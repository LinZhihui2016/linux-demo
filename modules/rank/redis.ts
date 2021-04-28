import { RankId } from "../../crawler/ranking";
import { $redis } from "../../tools/redis";
import { BEFORE_TOMORROW } from "../../util";
import { PRes } from "../../type";

export const getRankCache = async (rid: RankId): PRes<string[]> => {
  const redisKey = (['bilibili', 'rank', rid].join(':'))
  const [e, info] = await $redis.str.get(redisKey);
  if (info) {
    try {
      const json = JSON.parse(info) as string[]
      return [null, json]
    } catch (e) {
      return [e, null]
    }
  }
  return [e!, null]
}

export const setRankCache = async (rank: string[], rid: RankId) => {
  const redisKey = (['bilibili', 'rank', rid].join(':'))
  await $redis.str.set({ [redisKey]: JSON.stringify(rank) })
  await $redis.key.expire(redisKey, BEFORE_TOMORROW(), 'time_ms')
}