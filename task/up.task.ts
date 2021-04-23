import { $redis, redisTask } from "../tools/redis";
import * as upAction from "../api/up";
import { sleep } from "../util";

const map = new Map()
const video_task = redisTask('up')
let errorTime = 0

export const updateUp = async () => {
  const [, mid] = await $redis.getList(video_task).shift()
  if (mid) {
    const res = await upAction.postAdd({ noCache: false, mid })
    const { err } = res.json.body
    if (err) {
      errorTime++
      if (errorTime >= 20) {
        await sleep(1000 * 60 * 10)
      }
      const time = map.get(mid) || 0
      if (time <= 5) {
        map.set(mid, time + 1)
        await $redis.getList(video_task).push(mid)
      } else {
        await sleep(5000)
      }
    }
    await sleep(1000)
    await updateUp()
  }
}