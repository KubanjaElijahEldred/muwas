const app = require('../../../backend/server');

module.exports = (req, res) => {
  req.url = '/api/auth/google/callback';
  return app(req, res);
};
