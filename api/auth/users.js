const app = require('../../backend/server');

module.exports = (req, res) => {
  req.url = '/api/auth/users';
  return app(req, res);
};
