import { $redis } from "../../tools/redis";
import { VideoSql } from "../../tools/mysql/type";
import { PRes } from "../../type";
import { HOUR } from "../../util";

export const getVideoCache = async (bv: string): PRes<VideoSql> => {
  const redisKey = (['bilibili', 'video', bv].join(':'))
  const [e, info] = await $redis.str.get(redisKey);
  if (info) {
    try {
      const json = JSON.parse(info) as VideoSql
      return [null, json]
    } catch (e) {
      return [e, null]
    }
  }
  return [e!, null]
}

export const setVideoCache = async (video: VideoSql) => {
  const redisKey = (['bilibili', 'video', video.bvid].join(':'))
  await $redis.str.set({ [redisKey]: JSON.stringify(video) })
  await $redis.key.expire(redisKey, HOUR)
}
export const videoSet = (type: 'sql' | 'storage' | 'fail' | 'wait') => ['set', 'video', type].join(':')
export const videoSetAdd = async (mid: string[] | string, type: 'sql' | 'storage' | 'fail' | 'wait' = 'storage') => await $redis.getSet(videoSet(type)).add(mid)


export const setVideoTaskLock = () => $redis.str.set({ 'task:lock:video': '1' })
export const removeVideoTaskLock = () => $redis.str.set({ 'task:lock:video': '0' })
export const getVideoTaskLock = async () => {
  const [, lock] = await $redis.str.get('task:lock:video')
  return lock === '1'
}