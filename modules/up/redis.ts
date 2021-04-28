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

export const upTaskLv0 = () => $redis.getList(redisTask('up', 0))
export const upTaskLv1 = () => $redis.getHash(redisTask('up', 1))
export const upTaskLv2 = () => $redis.getHash(redisTask('up', 2))

export const handleTaskLv2 = async (): PRes<number> => {
  const len = await upTaskLv1().length();
  if (!len) return [null, len]
  const [e, info] = await upTaskLv1().get()
  if (e) return [e, null]
  for (const bv of Object.keys(info)) {
    const count = +info[bv]
    if (count < 3) {
      await upTaskLv0().push(bv)
    } else {
      await upTaskLv2().set({ [bv]: count + '' })
    }
    await upTaskLv2().del(bv)
  }
  const [err, length] = await upTaskLv1().length();
  return err ? [err, null] : [null, length]
}