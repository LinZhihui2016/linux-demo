import { PRes } from "../../type";
import { UpSql } from "../../tools/mysql/type";
import { $redis, redisTask } from "../../tools/redis";
import { HOUR } from "../../util";

export const getUpCache = async (mid: number): PRes<UpSql> => {
  const redisKey = (['bilibili', 'up', mid].join(':'))
  const [e, info] = await $redis.str.get(redisKey);
  if (info) {
    try {
      const json = JSON.parse(info) as UpSql
      return [null, json]
    } catch (e) {
      return [e, null]
    }
  }
  return [e!, null]
}

export const setUpCache = async (up: UpSql) => {
  const redisKey = (['bilibili', 'up', up.mid].join(':'))
  await $redis.str.set({ [redisKey]: JSON.stringify(up) })
  await $redis.key.expire(redisKey, HOUR)
}
export const upSet = (type: 'sql' | 'storage') => ['set', 'up', type].join(':')
export const upSetAdd = async (mid: string[] | string, type: 'sql' | 'storage' = 'storage') => await $redis.getSet(upSet(type)).add(mid)


export const upTaskKey = (type: 'update' | 'create', lv: number) => redisTask('up', type, lv)
export const upUpdateKey = (lv: number) => upTaskKey('update', lv)
export const upCreateKey = (lv: number) => upTaskKey('create', lv)

export const createUp = (mid: string | string[]) => $redis.getList(upCreateKey(0)).push(mid);
export const newUp = (mid: string | string[]) => $redis.getList(upCreateKey(0)).unshift(mid)
export const updateUp = (mid: string | string[]) => $redis.getList(upUpdateKey(0)).push(mid)

