require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { requestLogger, errorLogger, logger } = require('./middleware/logging');
const urlRoutes = require('./routes/urlRoutes');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);
app.set('trust proxy', true);
app.use('/', urlRoutes);
app.use('*', (req, res) => {
    logger.warn('404 - Route not found', {
        method: req.method,
        url: req.originalUrl
    });
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});
app.use(errorLogger);
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal Server Error' : 'Error',
        message: statusCode === 500 ? 'Something went wrong' : message
    });
});
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
app.listen(PORT, () => {
    logger.info(`URL Shortener Microservice started`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation:`);
    console.log(`   POST http://localhost:${PORT}/shorturls - Create short URL`);
    console.log(`   GET  http://localhost:${PORT}/shorturls/:shortcode - Get URL stats`);
    console.log(`   GET  http://localhost:${PORT}/:shortcode - Redirect to original URL`);
    console.log(`   GET  http://localhost:${PORT}/health - Health check`);
});
module.exports = app;