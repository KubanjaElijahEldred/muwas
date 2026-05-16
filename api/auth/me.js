const app = require('../../backend/server');

module.exports = (req, res) => {
  req.url = '/api/auth/me';
  return app(req, res);
};
