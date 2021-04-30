import { PRes } from "../../type";
import { UpSql } from "../../tools/mysql/type";
import { $redis } from "../../tools/redis";
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
export const upSet = (type: 'sql' | 'storage' | 'fail' | 'wait') => ['set', 'up', type].join(':')
export const upSetAdd = async (mid: string[] | string, type: 'sql' | 'storage' | 'fail' | 'wait' = 'storage') => await $redis.getSet(upSet(type)).add(mid)


export const getUpTaskLock = async () => {
  const [, lock] = await $redis.str.get('task:lock:up')
  return lock === '1'
}