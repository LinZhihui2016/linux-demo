import { $redis } from "../tools/redis";
import * as upAction from "../api/up";
import { sleep } from "../util";

const map = new Map()
const video_task = ['bilibili', 'task', 'up'].join(':')
export const updateUp = async () => {
  const [, mid] = await $redis.getList(video_task).shift()
  if (mid) {
    const res = await upAction.postAdd({ noCache: false, mid })
    const { err } = res.json.body
    if (err) {
      const time = map.get(mid) || 0
      if (time <= 5) {
        map.set(mid, time + 1)
        await $redis.getList(video_task).push(mid)
      } else {
        await sleep(1000)
      }
    }
    await updateUp()
  }
}