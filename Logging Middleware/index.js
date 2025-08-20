const logger = require('./logger');
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const { method, url, ip, headers } = req;
    logger.info('Incoming Request', {
        method,
        url,
        ip: ip || req.connection.remoteAddress,
        userAgent: headers['user-agent'],
        timestamp: new Date().toISOString()
    });
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - start;
        const { statusCode } = res;
        logger.info('Outgoing Response', {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            responseSize: JSON.stringify(data).length
        });
        return originalJson.call(this, data);
    };
    next();
};
const errorLogger = (error, req, res, next) => {
    logger.error('Application Error', {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
    });
    next(error);
};
module.exports = {
    logger,
    requestLogger,
    errorLogger
};