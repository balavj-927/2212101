const UrlModel = require('../models/urlModel');
const { logger } = require('../middleware/logging');
class UrlController {
    static async createShortUrl(req, res) {
        try {
            const { url, validity, shortcode } = req.body;
            if (!url) {
                logger.warn('Create URL attempt without URL', { body: req.body });
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'URL is required'
                });
            }
            const urlRecord = UrlModel.create({ url, validity, shortcode });
            logger.info('URL shortened successfully', {
                shortcode: urlRecord.shortcode,
                originalUrl: url,
                validity: urlRecord.validity
            });
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            res.status(201).json({
                shortLink: `${baseUrl}/${urlRecord.shortcode}`,
                expiry: urlRecord.expiry
            });
        } catch (error) {
            logger.error('Error creating short URL', {
                error: error.message,
                body: req.body
            });
            if (error.message.includes('Invalid') || error.message.includes('already exists')) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: error.message
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to create short URL'
            });
        }
    }
    static async redirectUrl(req, res) {
        try {
            const { shortcode } = req.params;
            logger.info('Redirect attempt', { shortcode });
            const urlRecord = UrlModel.getByShortcode(shortcode);
            if (!urlRecord) {
                logger.warn('Shortcode not found', { shortcode });
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Short URL not found'
                });
            }
            if (UrlModel.isExpired(urlRecord)) {
                logger.warn('Expired shortcode accessed', { shortcode, expiry: urlRecord.expiry });
                return res.status(410).json({
                    error: 'Gone',
                    message: 'Short URL has expired'
                });
            }
            const clickData = {
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                referer: req.headers.referer || 'direct',
                timestamp: new Date().toISOString()
            };
            UrlModel.incrementClick(shortcode, clickData);
            logger.info('Successful redirect', {
                shortcode,
                originalUrl: urlRecord.originalUrl,
                clickData
            });
            res.redirect(urlRecord.originalUrl);
        } catch (error) {
            logger.error('Error during redirect', {
                error: error.message,
                shortcode: req.params.shortcode
            });
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to redirect'
            });
        }
    }
    static async getUrlStats(req, res) {
        try {
            const { shortcode } = req.params;
            logger.info('Stats request', { shortcode });
            const analytics = UrlModel.getAnalytics(shortcode);
            if (!analytics) {
                logger.warn('Stats requested for non-existent shortcode', { shortcode });
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Short URL not found'
                });
            }
            logger.info('Stats retrieved successfully', { shortcode });
            res.json({
                shortcode: analytics.shortcode,
                originalUrl: analytics.originalUrl,
                totalClicks: analytics.totalClicks,
                createdAt: analytics.createdAt,
                expiryDate: analytics.expiryDate,
                isExpired: analytics.isExpired,
                clickDetails: analytics.clickDetails.map(click => ({
                    timestamp: click.timestamp,
                    sourceIP: click.ip,
                    referer: click.referer,
                    userAgent: click.userAgent
                }))
            });
        } catch (error) {
            logger.error('Error retrieving stats', {
                error: error.message,
                shortcode: req.params.shortcode
            });
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to retrieve statistics'
            });
        }
    }
    static async healthCheck(req, res) {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'URL Shortener Microservice'
        });
    }
}
module.exports = UrlController;