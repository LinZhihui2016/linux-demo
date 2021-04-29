import { $redis, redisTask } from "../../tools/redis";
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
export const videoSet = (type: 'sql' | 'storage' | 'fail' ) => ['set', 'up', type].join(':')
export const videoSetAdd = async (mid: string[] | string, type: 'sql' | 'storage' | 'fail' = 'storage') => await $redis.getSet(videoSet(type)).add(mid)

export const videoTaskKey = (type: 'update' | 'create', lv: number) => redisTask('video', type, lv)
export const videoUpdateKey = (lv: number) => videoTaskKey('update', lv)
export const videoCreateKey = (lv: number) => videoTaskKey('create', lv)

export const createVideo = (bv: string | string[]) => $redis.getList(videoCreateKey(0)).push(bv);
export const newVideo = (bv: string | string[]) => $redis.getList(videoCreateKey(0)).unshift(bv)
export const updateVideo = (bv: string | string[]) => $redis.getList(videoUpdateKey(0)).push(bv)
