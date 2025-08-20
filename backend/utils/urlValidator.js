const validator = require('validator');
class UrlValidator {
    static isValidUrl(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }
        if (!validator.isURL(url, {
                protocols: ['http', 'https'],
                require_protocol: true,
                require_valid_protocol: true,
                allow_underscores: true
            })) {
            return false;
        }
        return true;
    }
    static isValidShortcode(shortcode) {
        if (!shortcode || typeof shortcode !== 'string') {
            return false;
        }
        const shortcodeRegex = /^[a-zA-Z0-9]{4,10}$/;
        return shortcodeRegex.test(shortcode);
    }
    static isValidValidity(validity) {
        if (validity === undefined || validity === null) {
            return true;
        }
        const validityNum = parseInt(validity);
        return !isNaN(validityNum) && validityNum > 0 && validityNum <= 525600;
    }
}
module.exports = UrlValidator;