const express = require('express');
const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
const isDatabaseReady = () => mongoose.connection.readyState === 1;
const fallbackContacts = [];
const allowedStatuses = new Set(['new', 'in_progress', 'resolved']);
const allowedRequestTypes = new Set(['contact', 'tour']);

const normalizeText = (value = '') => String(value || '').trim();
const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();

const parsePagination = ({ page, limit }) => {
  const pageNum = Number.parseInt(page, 10);
  const limitNum = Number.parseInt(limit, 10);

  return {
    pageNum: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
    limitNum: Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 20,
  };
};

const buildContactPayload = (payload = {}) => {
  const requestType = allowedRequestTypes.has(normalizeText(payload.requestType))
    ? normalizeText(payload.requestType)
    : 'contact';

  const guests = Number.parseInt(payload.numberOfGuests, 10);

  return {
    name: normalizeText(payload.name),
    email: normalizeEmail(payload.email),
    phone: normalizeText(payload.phone),
    subject: normalizeText(payload.subject),
    message: normalizeText(payload.message),
    requestType,
    tourType: requestType === 'tour' ? normalizeText(payload.tourType) : '',
    tourDate: requestType === 'tour' ? normalizeText(payload.tourDate) : '',
    tourTime: requestType === 'tour' ? normalizeText(payload.tourTime) : '',
    numberOfGuests: Number.isFinite(guests) && guests > 0 ? guests : 1,
  };
};

const validatePayload = (payload = {}) => {
  if (!payload.name || !payload.email) {
    return 'Name and email are required.';
  }

  if (payload.requestType === 'contact') {
    if (!payload.subject) {
      return 'Subject is required for contact messages.';
    }

    if (!payload.message) {
      return 'Message is required.';
    }
  }

  if (payload.requestType === 'tour') {
    if (!payload.tourType || !payload.tourDate || !payload.tourTime) {
      return 'Tour type, preferred date, and preferred time are required.';
    }
  }

  return '';
};

const applyFallbackFilters = (contacts, { status, requestType, search }) => {
  let filtered = [...contacts];

  if (status && allowedStatuses.has(status)) {
    filtered = filtered.filter((contact) => contact.status === status);
  }

  if (requestType && allowedRequestTypes.has(requestType)) {
    filtered = filtered.filter((contact) => contact.requestType === requestType);
  }

  if (search) {
    const normalizedSearch = normalizeText(search).toLowerCase();

    filtered = filtered.filter((contact) => {
      const haystack = [
        contact.name,
        contact.email,
        contact.subject,
        contact.message,
        contact.tourType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }

  return filtered;
};

router.post('/', async (req, res) => {
  try {
    const contactPayload = buildContactPayload(req.body);
    const validationMessage = validatePayload(contactPayload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    if (!isDatabaseReady()) {
      const now = new Date().toISOString();
      const fallbackContact = {
        _id: `fallback-contact-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...contactPayload,
        status: 'new',
        adminNotes: '',
        createdAt: now,
        updatedAt: now,
      };

      fallbackContacts.unshift(fallbackContact);

      return res.status(201).json({
        message: 'Request received successfully.',
        contact: fallbackContact,
        source: 'fallback',
      });
    }

    const contact = new Contact(contactPayload);
    await contact.save();

    return res.status(201).json({
      message: 'Request received successfully.',
      contact,
    });
  } catch (error) {
    console.error('Create contact request error:', error);
    return res.status(500).json({ message: 'Server error sending request' });
  }
});

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, requestType, search } = req.query;
    const { pageNum, limitNum } = parsePagination({ page, limit });
    const skip = (pageNum - 1) * limitNum;

    if (!isDatabaseReady()) {
      const filteredContacts = applyFallbackFilters(fallbackContacts, {
        status,
        requestType,
        search,
      });

      return res.json({
        contacts: filteredContacts.slice(skip, skip + limitNum),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredContacts.length,
          pages: Math.ceil(filteredContacts.length / limitNum),
        },
        source: 'fallback',
      });
    }

    const filter = {};

    if (status && allowedStatuses.has(status)) {
      filter.status = status;
    }

    if (requestType && allowedRequestTypes.has(requestType)) {
      filter.requestType = requestType;
    }

    if (search) {
      const normalizedSearch = normalizeText(search);
      if (normalizedSearch) {
        filter.$or = [
          { name: { $regex: normalizedSearch, $options: 'i' } },
          { email: { $regex: normalizedSearch, $options: 'i' } },
          { subject: { $regex: normalizedSearch, $options: 'i' } },
          { message: { $regex: normalizedSearch, $options: 'i' } },
          { tourType: { $regex: normalizedSearch, $options: 'i' } },
        ];
      }
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);
    const total = await Contact.countDocuments(filter);

    return res.json({
      contacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get contact requests error:', error);
    return res.status(500).json({ message: 'Server error fetching contact requests' });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const status = normalizeText(req.body.status);
    const adminNotes = normalizeText(req.body.adminNotes);

    if (status && !allowedStatuses.has(status)) {
      return res.status(400).json({ message: 'Invalid contact status.' });
    }

    if (!isDatabaseReady()) {
      const contactIndex = fallbackContacts.findIndex(
        (contact) => String(contact._id) === String(req.params.id)
      );

      if (contactIndex === -1) {
        return res.status(404).json({ message: 'Contact request not found' });
      }

      const current = fallbackContacts[contactIndex];
      const updated = {
        ...current,
        status: status || current.status,
        adminNotes: adminNotes || current.adminNotes,
        updatedAt: new Date().toISOString(),
      };

      fallbackContacts[contactIndex] = updated;

      return res.json({
        message: 'Contact request updated successfully',
        contact: updated,
        source: 'fallback',
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes || adminNotes === '') updateData.adminNotes = adminNotes;

    const contact = await Contact.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact request not found' });
    }

    return res.json({
      message: 'Contact request updated successfully',
      contact,
    });
  } catch (error) {
    console.error('Update contact request error:', error);
    return res.status(500).json({ message: 'Server error updating contact request' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const contactIndex = fallbackContacts.findIndex(
        (contact) => String(contact._id) === String(req.params.id)
      );

      if (contactIndex === -1) {
        return res.status(404).json({ message: 'Contact request not found' });
      }

      fallbackContacts.splice(contactIndex, 1);

      return res.json({
        message: 'Contact request deleted successfully',
        source: 'fallback',
      });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact request not found' });
    }

    return res.json({ message: 'Contact request deleted successfully' });
  } catch (error) {
    console.error('Delete contact request error:', error);
    return res.status(500).json({ message: 'Server error deleting contact request' });
  }
});

module.exports = router;
