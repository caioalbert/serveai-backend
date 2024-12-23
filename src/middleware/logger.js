const { Log } = require('../models');

const logger = async (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    res.locals.responseData = data;
    originalJson.call(this, data);
  };

  res.on('finish', async () => {
    try {
      const { method, url, user } = req;
      const { statusCode } = res;
      const responseData = res.locals.responseData;

      await Log.create({
        action: `${method} ${url}`,
        details: JSON.stringify({
          statusCode,
          responseData,
          requestBody: req.body
        }),
        userId: user ? user.id : null
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  });

  next();
};

module.exports = logger;
