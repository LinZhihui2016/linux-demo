import { Action } from "../type";
import { RankId } from "../crawler/ranking";
import { error, success } from "../helper";
import { Err } from "../util/error";
import { $redis } from "../tools/redis";
import { fetchRank, saveRank } from "../model/rank.model";
import { BEFORE_TOMORROW } from "../util";

export const postAdd: Action<{ rid: RankId }> = async ({ rid, noCache }) => {
  if (!rid) return error(Err.参数错误)
  const redisKey = (['bilibili', 'rank', rid].join(':'))
  let bvList: string[] | null = null
  if ($redis.isConnect && !noCache) {
    const [, redisRes] = await $redis.str.get(redisKey);
    if (redisRes) {
      bvList = JSON.parse(redisRes) as string[]
    }
  }
  if (!bvList) {
    const [e, data] = await fetchRank(rid)
    if (e) return error(Err.b站抓取失败, e.message)
    if ($redis.isConnect) {
      await $redis.str.set({ [redisKey]: JSON.stringify(data) })
      await $redis.key.expire(redisKey, BEFORE_TOMORROW(), 'time_ms')
    }
    bvList = data
  }
  if (bvList) {
    const [err] = await saveRank([...bvList], rid)
    return err ? error(Err.mysql写入失败, err.sql) : success({ bvList })
  } else {
    return error(Err.b站抓取失败)
  }
}