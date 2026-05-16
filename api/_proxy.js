const app = require('../backend/server');

const getQueryString = (url = '') => {
  const index = String(url || '').indexOf('?');
  return index >= 0 ? String(url).slice(index) : '';
};

module.exports = (targetPath) => (req, res) => {
  req.url = `${targetPath}${getQueryString(req.url)}`;
  return app(req, res);
};
