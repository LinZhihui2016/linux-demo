import { $redis, redisTask } from "../tools/redis";
import * as bvAction from '../api/bv'
import { sleep } from "../util";

let errorTime = 0
export const updateBv = async () => {
  const [, bv] = await $redis.getList(redisTask('video', 0)).shift()
  if (bv) {
    const [, time] = await $redis.getHash(redisTask('video', 1)).get(bv)
    if (!(time && +time <= 5)) {
      const res = await bvAction.postAdd({ bv })
      const { err } = res.json.body
      if (err) {
        errorTime++
        if (errorTime >= 20) {
          await sleep(1000 * 60 * 10)
        }
        await $redis.getHash(redisTask('video', 1)).calc(bv)
      }
    }
    await sleep(1000)
    await updateBv()
  }
}