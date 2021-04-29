import { upCreateKey, upUpdateKey } from "./redis";
import { sleep } from "../../util";
import { getListByUpdated } from "./mysql";
import { createdAndUpdated } from "./helper";
import { $redis } from "../../tools/redis";
import { infoLog } from "../../util/chalk";
import { updateVideo, videoSet } from "../video/redis";

export const upUpdateTask = async () => {
  const [, mid] = await $redis.getList(upUpdateKey(0)).shift()
  if (!mid) {
    const [, hash] = await $redis.getHash(upUpdateKey(1)).get()
    const lv1 = Object.keys(hash || {})
    if (!lv1.length) {
      const [, ups] = await getListByUpdated(10, 'ASC')
      await updateVideo((ups || []).map(i => i.mid + ''))
      await sleep(1000 * 60)
    } else {
      const queue: string[] = []
      let i = 0;
      for (const mid of lv1) {
        const count = +hash[mid]
        if (count < 3) {
          queue.push(mid)
        } else {
          await $redis.getHash(upUpdateKey(1)).calc(mid, count)
          i++
        }
      }
      await updateVideo(queue[0])
      infoLog(`up:update:1 ===> up:update:0 ,length = ${ queue.length }`)
      infoLog(`up:update:1 ===> up:update:2 ,length = ${ i }`)
      await sleep(1000 * 10)
    }
  } else {
    await $redis.getHash(upUpdateKey(1)).calc(mid)
    const [err2] = await createdAndUpdated(+mid)
    if (!err2) {
      await $redis.getHash(upCreateKey(1)).del(mid)
    }
  }
  await sleep(10000)
  await upUpdateTask();
}

export const upCreateTask = async () => {
  const wait = $redis.getSet(videoSet('wait'))
  const storage = $redis.getSet(videoSet('storage'))
  const fail = $redis.getSet(videoSet('fail'))
  const [, list] = await storage.diff(videoSet('sql'))
  infoLog(list.length + '个up主')
  await wait.add(list)
  while (1) {
    const [, mid] = await wait.pop()
    if (mid) {
      const [err2] = await createdAndUpdated(+mid)
      if (err2) {
        await fail.add(mid)
      } else {
        await fail.del(mid)
      }
    } else {
      break
    }
  }
  const failTask = await fail.all()
  console.log(failTask[1])
}