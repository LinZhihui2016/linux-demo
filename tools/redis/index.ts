import redis from "redis";
import { RedisStr } from "./string";
import { RedisList } from "./list";
import { RedisHash } from "./hash";
import { RedisKey } from "./key";
import redisConf from '../../conf/redis.json'
import { RequestHandler } from "express";
import { apiLog } from "../../util/log";
import { infoLog } from "../../util/chalk";
import { today } from "../../util";

declare module 'express-serve-static-core' {
  interface Request {
    redis: Redis
  }
}

export type RedisCb<T> = [Error | null, T]
export type RedisPromise<T> = Promise<RedisCb<T>>
export type RedisType = 'none' | 'string' | 'list' | 'set' | 'zset' | 'hash'

export class Redis {
  client: redis.RedisClient;
  str: RedisStr;
  key: RedisKey;
  isConnect = false

  constructor(public port: number, public host: string) {
    this.client = redis.createClient(port, host)
    this.client.on('connect', () => {
      this.isConnect = true
      infoLog(`redis connect ${ host }:${ port } OK`)
    })
    this.str = new RedisStr(this)
    this.key = new RedisKey(this)
  }

  quit = () => new Promise(resolve => this.client.quit(redisRes(resolve, isOK)));
  getList = (key: string) => new RedisList(this, key);
  getHash = (key: string) => new RedisHash(this, key);
}

export const $redis = new Redis(redisConf.port, redisConf.host)
export const setupRedis: RequestHandler = (req, res, next) => {
  req.redis = $redis
  next()
}
export const redisRes = <S, T extends CallableFunction>(resolve: T, fn?: (arg: S) => any) =>
    (err: Error | null, reply: S) => {
      err && apiLog().error(err.message)
      resolve([err, fn ? fn(reply) : reply])
    }
export const isOK = (reply: string) => reply === 'OK'
export const is1 = (reply: string | number) => (reply + '') === '1'

export const redisTask = (k: 'video' | 'up', lv: 0 | 1 | 2 = 0) => ['bilibili', 'task', k, today(), lv].join(':')