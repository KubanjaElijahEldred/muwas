const app = require('../../backend/server');

module.exports = (req, res) => {
  req.url = '/api/auth/register';
  return app(req, res);
};
