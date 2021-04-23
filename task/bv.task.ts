import { $redis } from "../tools/redis";
import * as bvAction from '../api/bv'
import { sleep } from "../util";

const map = new Map()
const video_task = ['bilibili', 'task', 'video'].join(':')
export const updateBv = async () => {
  const [, bv] = await $redis.getList(video_task).shift()
  if (bv) {
    const res = await bvAction.postAdd({ noCache: false, bv })
    const { err } = res.json.body
    if (err) {
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