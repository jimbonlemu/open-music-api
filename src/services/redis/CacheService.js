const redis = require('redis');

class CacheService {
    constructor() {
        this._client = redis.createClient({
            socket: {
                host: process.env.REDIS_SERVER,
            },
        });

        this._client.on('error', (error) => {
            console.error(error);
        });

        this._client.connect();
    }

    async set(key, value, expirationInSeconds = 1800) {
        await this._client.set(key, value, {
            EX: expirationInSeconds,
        });
    }

    async get(key) {
        const result = await this._client.get(key);
        return result;
    }

    async delete(key) {
        await this._client.del(key);
    }
}

module.exports = CacheService;