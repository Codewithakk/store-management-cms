import redisClient from "../cache/redisClient";


export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`⚠️ Redis get failed for key: ${key}`, err);
    return null;
  }
};

export const setToCache = async (key: string, value: any, ttl: number): Promise<void> => {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
  } catch (err) {
    console.warn(`⚠️ Redis set failed for key: ${key}`, err);
  }
};

export const deleteFromCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.warn(`⚠️ Redis delete failed for key: ${key}`, err);
  }
};
