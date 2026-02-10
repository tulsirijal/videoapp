import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisOptions = {
    tls: {
        rejectUnauthorized: false, 
    },

    maxRetriesPerRequest: null, 
};


const pubClient = new Redis(process.env.REDIS_URL, redisOptions);


const subClient = pubClient.duplicate();


pubClient.on('error', (err) => console.error('Redis PubClient Error:', err));
subClient.on('error', (err) => console.error('Redis SubClient Error:', err));

export { pubClient, subClient };