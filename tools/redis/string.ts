import { isOK, Redis, RedisPromise, redisRes } from "./index";
import redis from "redis";

export class RedisStr {
  client: redis.RedisClient;

  constructor(public $redis: Redis) {
    this.client = $redis.client
  }

  get(key: string[]): RedisPromise<string[] | null>
  get(key: string): RedisPromise<string | null>
  get(key: string | string[]) {
    return new Promise((resolve) => {
      if (Array.isArray(key)) {
        this.client.mget(key, redisRes(resolve))
      } else {
        this.client.get(key, redisRes(resolve))
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
        this.client.set(arg[0], arg[1], redisRes(resolve, isOK))
      } else {
        this.client.mset(arg, redisRes(resolve))
      }
    })
  }

  join(key: string, value: string, separator = ''): RedisPromise<number> {
    return new Promise(resolve => {
      this.client.append(key, separator + value, redisRes(resolve))
    })
  }

  calc(key: string, num = 1): RedisPromise<number> {
    return new Promise((resolve) => {
      if (num === 1) {
        this.client.incr(key, redisRes(resolve))
      }
      if (num === -1) {
        this.client.decr(key, redisRes(resolve))
      }
      if (num >= 0) {
        this.client.incrby(key, num, redisRes(resolve))
      } else {
        this.client.decrby(key, -num, redisRes(resolve))
      }
    })
  }
}

