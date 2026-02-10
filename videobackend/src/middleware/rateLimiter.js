
import { pubClient } from "../db/redis.js"; 

export const rateLimiter = (limit, windowInSeconds) => {
  return async (req, res, next) => {
    if (process.env.NODE_ENV === "test") {
      return next();
    }
    const userId = req.user?.id || req.ip; 
    const key = `rate_limit:${req.route.path}:${userId}`;
    const now = Date.now();
    const windowStart = now - (windowInSeconds * 1000);

    try {
      // Remove requests outside the current sliding window
      await pubClient.zremrangebyscore(key, 0, windowStart);

      //  Count how many requests are left in the window
      const requestCount = await pubClient.zcard(key);

      if (requestCount >= limit) {
        return res.status(429).json({
          message: "Too many requests. Please try again later.",
          retryAfter: `${windowInSeconds} seconds`
        });
      }

      //  Add the current request to the set
      //  use 'now' as both score and value to keep entries unique-ish
      await pubClient.zadd(key, now, now.toString());
      
      //  Set expiry on the whole set so it doesn't stay in Redis forever
      await pubClient.expire(key, windowInSeconds);

      next();
    } catch (error) {
      console.error("Rate Limiter Error:", error);
      next(); 
    }
  };
};