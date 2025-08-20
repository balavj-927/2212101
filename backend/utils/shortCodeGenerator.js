const shortid = require('shortid');
class ShortCodeGenerator {
    static generate() {
        return shortid.generate().replace(/[_-]/g, 'x').substring(0, 6);
    }
    static generateCustom(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    static isUnique(shortcode, database) {
        return !database.getUrl(shortcode);
    }
}
module.exports = ShortCodeGenerator;