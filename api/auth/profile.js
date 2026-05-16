const app = require('../../backend/server');

module.exports = (req, res) => {
  req.url = '/api/auth/profile';
  return app(req, res);
};
