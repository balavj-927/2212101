const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
    info: (message, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message,
            ...meta
        };
        console.log(`[INFO] ${logEntry.timestamp}: ${message}`, meta);
        fs.appendFileSync(
            path.join(logsDir, 'application.log'),
            JSON.stringify(logEntry) + '\n'
        );
    },
    error: (message, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message,
            ...meta
        };
        console.error(`[ERROR] ${logEntry.timestamp}: ${message}`, meta);
        fs.appendFileSync(
            path.join(logsDir, 'error.log'),
            JSON.stringify(logEntry) + '\n'
        );
    },

    warn: (message, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'WARN',
            message,
            ...meta
        };
        console.warn(`[WARN] ${logEntry.timestamp}: ${message}`, meta);
        fs.appendFileSync(
            path.join(logsDir, 'application.log'),
            JSON.stringify(logEntry) + '\n'
        );
    }
};

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