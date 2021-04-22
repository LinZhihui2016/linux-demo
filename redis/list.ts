import redis from "redis";
import { isOK, Redis, RedisPromise, redisRes } from "./index";

export class RedisList {
  client: redis.RedisClient;

  constructor(public $redis: Redis, public listKey: string) {
    this.client = $redis.client
  }

  pop(): RedisPromise<string> {
    return new Promise((resolve) => {
      this.client.rpop(this.listKey, redisRes(resolve))
    })
  }

  push(value: string | string[]): RedisPromise<number> {
    return new Promise(resolve => {
      this.client.rpush(this.listKey, value, redisRes(resolve))
    })
  }

  shift(): RedisPromise<string> {
    return new Promise((resolve) => {
      this.client.lpop(this.listKey, redisRes(resolve))
    })
  }

  unshift(value: string | string[]): RedisPromise<number> {
    return new Promise(resolve => {
      this.client.lpush(this.listKey, value, redisRes(resolve))
    })
  }

  set(index: number, value: string): RedisPromise<number> {
    return new Promise(resolve => {
      this.client.lset(this.listKey, index, value, redisRes(resolve))
    })
  }

  get(index: number): RedisPromise<string>
  get(start: number, end: number): RedisPromise<string[]>
  get(index: number, end?: number) {
    return new Promise((resolve) => {
      if (end === undefined) {
        this.client.lindex(this.listKey, index, redisRes(resolve))
      } else {
        this.client.lrange(this.listKey, index, end, redisRes(resolve))
      }
    })
  }

  length(): RedisPromise<number> {
    return new Promise((resolve) => {
      this.client.llen(this.listKey, redisRes(resolve))
    })
  }


  remove(value: string, count: number): RedisPromise<number> {
    return new Promise(resolve => {
      this.client.lrem(this.listKey, count, value, redisRes(resolve))
    })
  }


  trim(range: { start?: number, end?: number }): RedisPromise<boolean> {
    const { start = 0, end = -1 } = range
    return new Promise(resolve => {
      this.client.ltrim(this.listKey, start, end, redisRes(resolve, isOK))
    })
  }
}