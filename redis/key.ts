import redis from "redis";
import { is1, Redis, RedisPromise, redisRes, RedisType } from "./index";

export class RedisKey {
  client: redis.RedisClient;

  constructor(public $redis: Redis) {
    this.client = $redis.client
  }

  expire(key: string, time: number, type: "s" | 'ms' | 'time_s' | 'time_ms' = 's'): RedisPromise<boolean> {
    return new Promise((resolve => {
      const hash = {
        s: this.client.expire,
        ms: this.client.pexpire,
        time_s: this.client.expireat,
        time_ms: this.client.pexpireat,
      };
      hash[type](key, time, redisRes(resolve, is1))
    }))
  }

  alive(key: string): RedisPromise<boolean> {
    return new Promise((resolve => {
      this.client.persist(key, redisRes(resolve, is1))
    }))
  }

  aliveTime(key: string, type: 's' | 'ms' = 's'): RedisPromise<number> {
    return new Promise((resolve => {
      const hash = {
        s: this.client.ttl,
        ms: this.client.pttl,
      };
      hash[type](key, redisRes(resolve))
    }))
  }

  match(pattern: string): RedisPromise<string[]> {
    return new Promise((resolve => {
      this.client.keys(pattern, redisRes(resolve))
    }))
  }

  is(key: string, type: RedisType): RedisPromise<boolean> {
    return new Promise((resolve => {
      this.client.type(key, redisRes(resolve, res => res === type))
    }))
  }

  type(key: string): RedisPromise<RedisType> {
    return new Promise((resolve => {
      this.client.type(key, redisRes(resolve))
    }))
  }
}