const app = require('../../backend/server');

module.exports = (req, res) => {
  req.url = '/api/auth/login';
  return app(req, res);
};
