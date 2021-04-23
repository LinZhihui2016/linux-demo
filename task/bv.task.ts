import { $redis, redisTask } from "../tools/redis";
import * as bvAction from '../api/bv'
import { sleep } from "../util";

const map = new Map()
const video_task = redisTask('video')
let errorTime = 0
export const updateBv = async () => {
  const [, bv] = await $redis.getList(video_task).shift()
  if (bv) {
    const res = await bvAction.postAdd({ noCache: false, bv })
    const { err } = res.json.body
    if (err) {
      errorTime++
      if (errorTime >= 20) {
        await sleep(1000 * 60 * 10)
      }
      const time = map.get(bv) || 0
      if (time <= 5) {
        map.set(bv, time + 1)
        await $redis.getList(video_task).push(bv)
      } else {
        await sleep(1000)
      }
    }
    await updateBv()
  }
}