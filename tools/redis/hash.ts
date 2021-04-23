import redis from "redis";
import { is1, isOK, Redis, RedisPromise, redisRes } from "./index";

export class RedisHash {
  client: redis.RedisClient;

  constructor(public $redis: Redis, public hashKey: string) {
    this.client = $redis.client
  }

  del(keys: string | string[]): RedisPromise<number> {
    return new Promise((resolve => {
      this.client.hdel(this.hashKey, keys, redisRes(resolve))
    }))
  }

  in(key: string): RedisPromise<0 | 1> {
    return new Promise((resolve => {
      this.client.hexists(this.hashKey, key, redisRes(resolve))
    }))
  }

  length(): RedisPromise<number> {
    return new Promise((resolve) => {
      this.client.hlen(this.hashKey, redisRes(resolve))
    })
  }

  get(): RedisPromise<{ [key: string]: string }>
  get(key: string[]): RedisPromise<string[]>
  get(key: string): RedisPromise<string>
  get(key?: string | string[]) {
    return new Promise((resolve) => {
      if (key === undefined) {
        this.client.hgetall(this.hashKey, redisRes(resolve))
        return
      }
      if (Array.isArray(key)) {
        this.client.hmget(this.hashKey, key, redisRes(resolve))
      } else {
        this.client.hget(this.hashKey, key, redisRes(resolve))
      }
    })
  }

  set(obj: { [key: string]: string }): RedisPromise<boolean> {
    const arg: string[] = []
    for (const i in obj) {
      arg.push(i)
      arg.push(obj[i])
    }
    return new Promise((resolve) => {
      if (arg.length === 2) {
        this.client.hset(this.hashKey, arg[0], arg[1], redisRes(resolve, is1))
      } else {
        this.client.hmset(this.hashKey, arg, redisRes(resolve, isOK))
      }
    })
  }

  keys(): RedisPromise<string[]> {
    return new Promise((resolve) => {
      this.client.hkeys(this.hashKey, redisRes(resolve))
    })
  }

  values(): RedisPromise<string[]> {
    return new Promise((resolve) => {
      this.client.hvals(this.hashKey, redisRes(resolve))
    })
  }

  calc(key: string, num = 1): RedisPromise<number> {
    return new Promise((resolve) => {
      this.client.hincrby(this.hashKey, key, num, redisRes(resolve))
    })
  }
}