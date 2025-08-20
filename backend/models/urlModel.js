const database = require('../config/database');
const UrlValidator = require('../utils/urlValidator');
const ShortCodeGenerator = require('../utils/shortCodeGenerator');
class UrlModel {
    static create(urlData) {
        const { url, validity = 30, shortcode } = urlData;
        if (!UrlValidator.isValidUrl(url)) {
            throw new Error('Invalid URL format');
        }
        if (!UrlValidator.isValidValidity(validity)) {
            throw new Error('Invalid validity period');
        }
        let finalShortcode = shortcode;
        if (shortcode) {
            if (!UrlValidator.isValidShortcode(shortcode)) {
                throw new Error('Invalid shortcode format');
            }
            if (!ShortCodeGenerator.isUnique(shortcode, database)) {
                throw new Error('Shortcode already exists');
            }
        } else {
            do {
                finalShortcode = ShortCodeGenerator.generate();
            } while (!ShortCodeGenerator.isUnique(finalShortcode, database));
        }
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + parseInt(validity));
        const urlRecord = {
            shortcode: finalShortcode,
            originalUrl: url,
            validity: parseInt(validity),
            expiry: expiry.toISOString(),
            createdAt: new Date().toISOString()
        };
        return database.createUrl(urlRecord);
    }
    static getByShortcode(shortcode) {
        return database.getUrl(shortcode);
    }
    static incrementClick(shortcode, clickData) {
        return database.updateUrlClicks(shortcode, clickData);
    }
    static getAnalytics(shortcode) {
        return database.getUrlAnalytics(shortcode);
    }
    static isExpired(urlRecord) {
        if (!urlRecord || !urlRecord.expiry) {
            return true;
        }
        return new Date() > new Date(urlRecord.expiry);
    }
    static getAll() {
        return database.getAllUrls();
    }
}
module.exports = UrlModel;