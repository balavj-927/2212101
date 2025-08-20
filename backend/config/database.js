class Database {
    constructor() {
        this.urls = new Map();
        this.analytics = new Map();
        this.users = new Map();
    }
    createUrl(data) {
        this.urls.set(data.shortcode, {
            ...data,
            createdAt: new Date(),
            clicks: 0
        });
        this.analytics.set(data.shortcode, {
            totalClicks: 0,
            clickDetails: [],
            createdAt: new Date()
        });
        return this.urls.get(data.shortcode);
    }
    getUrl(shortcode) {
        return this.urls.get(shortcode);
    }
    getAllUrls() {
        return Array.from(this.urls.values());
    }
    updateUrlClicks(shortcode, clickData) {
        const url = this.urls.get(shortcode);
        if (url) {
            url.clicks++;
            this.urls.set(shortcode, url);
            const analytics = this.analytics.get(shortcode);
            if (analytics) {
                analytics.totalClicks++;
                analytics.clickDetails.push({
                    timestamp: new Date(),
                    ...clickData
                });
                this.analytics.set(shortcode, analytics);
            }
            return url;
        }
        return null;
    }
    getUrlAnalytics(shortcode) {
        const url = this.urls.get(shortcode);
        const analytics = this.analytics.get(shortcode);
        if (!url || !analytics) {
            return null;
        }
        return {
            shortcode,
            originalUrl: url.originalUrl,
            totalClicks: analytics.totalClicks,
            createdAt: url.createdAt,
            expiryDate: url.expiry,
            clickDetails: analytics.clickDetails,
            isExpired: new Date() > new Date(url.expiry)
        };
    }
    deleteUrl(shortcode) {
        const deleted = this.urls.delete(shortcode);
        this.analytics.delete(shortcode);
        return deleted;
    }
}
module.exports = new Database();