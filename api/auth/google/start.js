const app = require('../../../backend/server');

module.exports = (req, res) => {
  req.url = '/api/auth/google/start';
  return app(req, res);
};
