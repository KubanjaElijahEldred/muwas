import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const vintageImage = '/images/vintage_distillation.png';
const storyImage = '/images/story.png';
const coverImage = '/images/home.png';

const contents = [
  { page: '01', label: "Editor's Letter", href: '#editor-note' },
  { page: '02', label: 'Brand Background', href: '#brand-journey' },
  { page: '03', label: 'Field Notes', href: '#farm-chapter' },
  { page: '04', label: 'Key Events', href: '#timeline' },
  { page: '05', label: 'Botanical Atlas', href: '#botanical-atlas' },
];

const timeline = [
  {
    year: '2021',
    title: 'Masaka Workshop Opens',
    detail: 'Early trials focused on small-batch craft and a local-first identity.',
  },
  {
    year: '2022',
    title: 'Citrus & Coffee Sourcing',
    detail: 'The ingredient map sharpened around peel brightness, coffee depth, and wild botanicals.',
  },
  {
    year: '2023',
    title: 'Recipe Refinement',
    detail: 'Juniper, orris root, and warm spice were balanced into a cleaner house profile.',
  },
  {
    year: '2024',
    title: 'Signature Bottles Released',
    detail: 'MUWAS introduced its core expressions with a clearer farm-to-glass story.',
  },
];

const farmHighlights = [
  'Closer sourcing relationships around Masaka.',
  'Seasonal citrus, coffee, and support botanicals.',
  'Slow distilling designed to preserve aroma and texture.',
];

const botanicals = [
  {
    number: '01',
    name: 'Masaka Coffee',
    note: 'Builds warmth, depth, and a dry cocoa finish.',
    palette: 'linear-gradient(180deg, #8b5d3b 0%, #c99466 100%)',
  },
  {
    number: '02',
    name: 'Local Citrus',
    note: 'Lifts the profile with bright peel and clean sweetness.',
    palette: 'linear-gradient(180deg, #f0a24c 0%, #d7641f 100%)',
  },
  {
    number: '03',
    name: 'Ugandan Juniper',
    note: 'Adds backbone, dryness, and a classic botanical spine.',
    palette: 'linear-gradient(180deg, #7a90b0 0%, #304263 100%)',
  },
  {
    number: '04',
    name: 'Orris Root',
    note: 'Threads the whole blend together with floral structure.',
    palette: 'linear-gradient(180deg, #d6c8af 0%, #86785d 100%)',
  },
];

const sheetMotion = (rotate = 0, delay = 0) => ({
  initial: { opacity: 0, y: 40, rotate: rotate * 3.5 },
  whileInView: { opacity: 1, y: 0, rotate },
  viewport: { once: true, margin: '-100px' },
  transition: {
    duration: 0.7,
    delay,
    ease: [0.22, 1, 0.36, 1],
  },
});

const heroVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.04,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const listContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.52,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const timelineItemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const atlasContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

const atlasItemVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.56,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Story = () => {
  const reduceMotion = useReducedMotion();
  const sheetHover = (rotate = 0) =>
    reduceMotion
      ? undefined
      : {
          y: -10,
          rotate: rotate + (rotate >= 0 ? 0.4 : -0.4),
          transition: { duration: 0.26, ease: 'easeOut' },
        };

  const floatingImage = reduceMotion
    ? {}
    : {
        scale: [1, 1.035, 1],
        x: [0, 6, 0],
        y: [0, -8, 0],
        transition: {
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  const slowerFloatingImage = reduceMotion
    ? {}
    : {
        scale: [1, 1.025, 1],
        x: [0, -5, 0],
        y: [0, -6, 0],
        transition: {
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  return (
    <div className="story-magazine">
      <div className="story-magazine__backdrop" aria-hidden="true" />

      <div className="story-magazine__inner">
        <motion.section
          id="high-pitch-story"
          className="story-magazine__hero"
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
          variants={heroVariants}
        >
          <motion.p className="story-magazine__eyebrow" variants={heroItemVariants}>
            Issue 01 • Muwas Journal
          </motion.p>
          <motion.h1 variants={heroItemVariants}>Our Story In Print</motion.h1>
          <motion.p variants={heroItemVariants}>
            A cleaner editorial read of the MUWAS story, from brand background and farm notes to
            the botanicals that shape every bottle.
          </motion.p>
        </motion.section>

        <div className="story-magazine__grid story-magazine__grid--top">
          <motion.article
            id="editor-note"
            className="story-sheet story-sheet--editor"
            {...sheetMotion(-1.15, 0.04)}
            whileHover={sheetHover(-1.15)}
          >
            <div className="story-editor__meta">
              <span className="story-editor__avatar">
                <motion.img
                  src={vintageImage}
                  alt="Muwas editorial portrait"
                  animate={slowerFloatingImage}
                />
              </span>

              <div>
                <p className="story-sheet__micro">Editorial Desk</p>
                <p className="story-sheet__tiny">Muwas Distilling Journal</p>
              </div>
            </div>

            <p className="story-sheet__super">Editor</p>

            <div className="story-editor__columns">
              <div className="story-sheet__copy">
                <p className="story-dropcap">
                  Every MUWAS bottle begins as a local conversation between land, harvest, and
                  patient craft. The brand was never meant to feel detached from its origin.
                </p>
              </div>

              <div className="story-sheet__copy">
                <p>
                  This issue keeps the story simple: local ingredients, slow distilling, and a
                  visual identity that still remembers Masaka even when the bottle travels.
                </p>
              </div>
            </div>

            <figure className="story-editor__figure">
              <motion.img
                src={vintageImage}
                alt="Vintage-inspired still-life showing early distillation craft"
                animate={slowerFloatingImage}
              />
              <figcaption>Craft inspiration drawn from small-scale local distilling culture.</figcaption>
            </figure>
          </motion.article>

          <motion.article
            className="story-sheet story-sheet--cover"
            {...sheetMotion(0.85, 0.1)}
            whileHover={sheetHover(0.85)}
          >
            <div className="story-cover__meta">
              <span>Issue 01</span>
              <span>Farm & Craft Magazine</span>
              <span>Masaka Edition</span>
            </div>

            <p className="story-cover__kicker">The</p>
            <h2 className="story-cover__title">Muwas Journal</h2>
            <p className="story-cover__tagline">botanical spirits rooted in masaka and made to travel</p>

            <motion.div
              className="story-cover__image"
              whileHover={
                reduceMotion
                  ? undefined
                  : { scale: 1.015, transition: { duration: 0.3, ease: 'easeOut' } }
              }
            >
              <motion.img
                src={coverImage}
                alt="Muwas bottles surrounded by fruit and botanicals"
                animate={floatingImage}
              />
            </motion.div>

            <div className="story-cover__footer">
              <p>Origin story</p>
              <p>Field notes</p>
              <p>Botanical atlas</p>
            </div>
          </motion.article>
        </div>

        <div className="story-magazine__grid story-magazine__grid--middle">
          <motion.article
            className="story-sheet story-sheet--contents"
            {...sheetMotion(-0.55, 0.08)}
            whileHover={sheetHover(-0.55)}
          >
            <p className="story-sheet__micro">Content</p>
            <h2 className="story-sheet__title">Inside This Issue</h2>

            <motion.ol
              className="story-contents__list"
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={{ once: true, margin: '-80px' }}
              variants={listContainerVariants}
            >
              {contents.map((item) => (
                <motion.li
                  key={item.page}
                  variants={listItemVariants}
                  whileHover={reduceMotion ? undefined : { x: 6 }}
                >
                  <a href={item.href}>
                    <span>{item.page}</span>
                    <strong>{item.label}</strong>
                  </a>
                </motion.li>
              ))}
            </motion.ol>

            <div className="story-contents__visual">
              <motion.img src={storyImage} alt="Muwas field scene" animate={slowerFloatingImage} />
            </div>
          </motion.article>

          <motion.article
            id="brand-journey"
            className="story-sheet story-sheet--journey"
            {...sheetMotion(0.45, 0.14)}
            whileHover={sheetHover(0.45)}
          >
            <div className="story-sheet__heading">
              <div>
                <p className="story-sheet__micro">Brand Background</p>
                <h2 className="story-sheet__title">From Masaka To The World</h2>
              </div>
              <span className="story-sheet__page">Feature 02</span>
            </div>

            <div className="story-journey__layout">
              <figure className="story-journey__figure">
                <motion.img
                  src={vintageImage}
                  alt="Vintage distillation scene representing the early Muwas story"
                  animate={slowerFloatingImage}
                />
              </figure>

              <div className="story-journey__body">
                <p className="story-standfirst">
                  MUWAS treats provenance as the main ingredient, not just decoration around the
                  bottle.
                </p>

                <div className="story-journey__columns">
                  <p>
                    The brand started with a simple ambition: take East African harvests seriously
                    enough to build premium spirits around them. Citrus, coffee, roots, and local
                    craft became the foundation instead of an afterthought.
                  </p>
                  <p>
                    That decision shaped everything else, from the flavor profile to the packaging
                    language. The result is a collection that feels refined while still reading
                    clearly as a product of place.
                  </p>
                </div>

                <div className="story-journey__facts">
                  <div>
                    <span>Craft Focus</span>
                    <strong>Small-batch and farm-rooted</strong>
                  </div>
                  <div>
                    <span>Regional Lens</span>
                    <strong>Masaka ingredients and identity</strong>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        </div>

        <div className="story-magazine__grid story-magazine__grid--bottom">
          <motion.article
            id="farm-chapter"
            className="story-sheet story-sheet--farm"
            {...sheetMotion(-0.35, 0.12)}
            whileHover={sheetHover(-0.35)}
          >
            <div className="story-sheet__heading">
              <div>
                <p className="story-sheet__micro">Field Notes</p>
                <h2 className="story-sheet__title">Regional Harvest, Local Partners</h2>
              </div>
              <span className="story-sheet__page">Field 03</span>
            </div>

            <div className="story-farm__layout">
              <div className="story-farm__copy">
                <p className="story-standfirst">
                  The farming story is deliberately close to home: nearby growers, careful
                  sourcing, and ingredients chosen for character rather than volume.
                </p>

                <ul className="story-farm__list">
                  {farmHighlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <Link to="/contact" className="story-inline-link">
                  Book A Tour
                  <ArrowRight size={16} strokeWidth={1.8} />
                </Link>
              </div>

              <figure className="story-farm__figure">
                <motion.img
                  src={storyImage}
                  alt="Muwas farming and ingredient landscape"
                  animate={floatingImage}
                />
                <figcaption>Harvest perspective, local sourcing, and a calm farm-to-glass rhythm.</figcaption>
              </figure>
            </div>
          </motion.article>

          <motion.article
            id="timeline"
            className="story-sheet story-sheet--timeline"
            {...sheetMotion(0.7, 0.18)}
            whileHover={sheetHover(0.7)}
          >
            <p className="story-sheet__micro">Timeline</p>
            <h2 className="story-sheet__title">Key Events</h2>

            <motion.div
              className="story-timeline"
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={{ once: true, margin: '-90px' }}
              variants={listContainerVariants}
            >
              {timeline.map((item) => (
                <motion.article
                  key={item.year}
                  className="story-timeline__item"
                  variants={timelineItemVariants}
                >
                  <span className="story-timeline__year">{item.year}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </motion.article>
        </div>

        <motion.article
          id="botanical-atlas"
          className="story-sheet story-sheet--atlas"
          {...sheetMotion(0.2, 0.16)}
          whileHover={sheetHover(0.2)}
        >
          <div className="story-sheet__heading">
            <div>
              <p className="story-sheet__micro">Botanical Atlas</p>
              <h2 className="story-sheet__title">A Masterclass Of Local Botanicals</h2>
            </div>
            <span className="story-sheet__page">Atlas 04</span>
          </div>

          <motion.div
            className="story-atlas__grid"
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            viewport={{ once: true, margin: '-80px' }}
            variants={atlasContainerVariants}
          >
            {botanicals.map((item) => (
              <motion.article
                key={item.name}
                className="story-atlas__card"
                variants={atlasItemVariants}
                whileHover={reduceMotion ? undefined : { y: -8, transition: { duration: 0.25 } }}
              >
                <div
                  className="story-atlas__swatch"
                  style={{ background: item.palette }}
                  aria-hidden="true"
                />
                <p className="story-atlas__number">{item.number}</p>
                <h3>{item.name}</h3>
                <p>{item.note}</p>
              </motion.article>
            ))}
          </motion.div>

          <div className="story-atlas__footer">
            <p>
              Together these ingredients create the MUWAS signature: citrus for lift, coffee for
              depth, juniper for structure, and orris root for a clean floral thread.
            </p>

            <Link to="/products" className="story-inline-link">
              Explore The Collection
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default Story;
