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

export const videoTaskLv0 = () => $redis.getList(redisTask('video', 0))
export const videoTaskLv1 = () => $redis.getHash(redisTask('video', 1))
export const videoTaskLv2 = () => $redis.getHash(redisTask('video', 2))

export const getVideoTaskLatest = async (): PRes<string> => {
  const [e, bvid] = await $redis.getList(redisTask('video', 0)).shift()
  if (bvid) {
    await $redis.getHash(redisTask('video', 1)).calc(bvid)
    return [null, bvid]
  }
  return [e!, null]
}

export const handleTaskLv2 = async (): PRes<number> => {
  const len = await videoTaskLv1().length();
  if (!len) return [null, len]
  const [e, info] = await videoTaskLv1().get()
  if (e) return [e, null]
  for (const bv of Object.keys(info)) {
    const count = +info[bv]
    if (count < 3) {
      await videoTaskLv0().push(bv)
    } else {
      await videoTaskLv2().set({ [bv]: count + '' })
    }
    await videoTaskLv2().del(bv)
  }
  const [err, length] = await videoTaskLv1().length();
  return err ? [err, null] : [null, length]
}