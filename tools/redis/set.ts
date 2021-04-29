import redis from "redis";
import { Redis, RedisPromise, redisRes } from "./index";

export class RedisSet {
  client: redis.RedisClient;

  constructor(public $redis: Redis, public listKey: string) {
    this.client = $redis.client
  }

  add(value: string | string[]): RedisPromise<number> {
    return new Promise(resolve => {
      this.client.sadd(this.listKey, value, redisRes(resolve))
    })
  }

  length(): RedisPromise<number> {
    return new Promise(resolve => {
      this.client.scard(this.listKey, redisRes(resolve))
    })
  }

  in(value: string): RedisPromise<1 | 0> {
    return new Promise(resolve => {
      this.client.sismember(this.listKey, value, redisRes(resolve))
    })
  }

  all(): RedisPromise<string[]> {
    return new Promise(resolve => {
      this.client.smembers(this.listKey, redisRes(resolve))
    })
  }

  del(value: string): RedisPromise<string[]> {
    return new Promise(resolve => {
      this.client.srem(this.listKey, value, redisRes(resolve))
    })
  }

  diff(set: string): RedisPromise<string[]> {
    return new Promise(resolve => {
      this.client.sdiff(this.listKey, set, redisRes(resolve))
    })
  }

  move(value: string, to: string): RedisPromise<0 | 1> {
    return new Promise(resolve => {
      this.client.smove(this.listKey, value, to, redisRes(resolve))
    })
  }

  pop(): RedisPromise<string | null> {
    return new Promise(resolve => {
      this.client.spop(this.listKey, redisRes(resolve))
    })
  }
}