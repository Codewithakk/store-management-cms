// src/middleware/cacheInvalidator.ts

import { Request, Response, NextFunction } from 'express'
import redisClient from '../cache/redisClient'

// Factory function that returns middleware
const invalidateCache = (
  keyBuilder: (req: Request) => string | string[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const keys = keyBuilder(req)
      const keyArray = Array.isArray(keys) ? keys : [keys]

      for (const key of keyArray) {
        await redisClient.del(key)
        console.log(`🧹 Cache invalidated: ${key}`)
      }

      next()
    } catch (error) {
      console.error('❌ Failed to invalidate cache:', error)
      next(error)
    }
  }
}

export default invalidateCache
