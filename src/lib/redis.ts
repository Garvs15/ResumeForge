import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

interface RedisClient {
    hgetall(key: string): Promise<Record<string, string> | null>;
    hset(key: string, data: Record<string, string>): Promise<number | "OK">;
    expire(key: string, seconds: number): Promise<number | boolean>;

    // ADD these
    get<T = unknown>(key: string): Promise<T | null>;
    set(key: string, value: unknown): Promise<unknown>;
};

const useLocalRedis = process.env.USE_LOCAL_REDIS === "true";

function createRedisClient(): RedisClient {
    if (useLocalRedis && process.env.REDIS_URL) {
        const client = new IORedis(process.env.REDIS_URL);
        return {
            hgetall: (key) => client.hgetall(key).then(r => Object.keys(r).length ? r : null),
            hset: (key, data) => client.hset(key, data),
            expire: (key, seconds) => client.expire(key, seconds).then(r => r === 1),

            // 🔥 ADD THESE
            get: async (key) => {
                const val = await client.get(key);
                return val ? JSON.parse(val) : null;
            },

            set: (key, value) =>
                client.set(key, JSON.stringify(value)),
        };
    }

    const client = new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    return client as unknown as RedisClient;
}

const redis = createRedisClient();
export default redis;