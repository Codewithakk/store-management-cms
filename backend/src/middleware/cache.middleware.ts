import { Request, Response, NextFunction } from 'express';
import redisClient from '../cache/redisClient';
import logger from '../util/logger';

const cacheMiddleware = (keyGenerator: (req: Request) => string, ttl: number) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const cacheKey = keyGenerator(req);
        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                res.status(200).json(JSON.parse(cachedData));
                return
            }
        } catch (error) {
            logger.error('Error retrieving cache:', error);
        }

        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = (data) => {
            redisClient.setEx(cacheKey, ttl, JSON.stringify(data)).catch((error) => {
                logger.error('Error setting cache:', error);
            });
            return originalJson.call(res, data);
        };

        next();
    };
};

export default cacheMiddleware;