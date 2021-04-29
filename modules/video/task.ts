import { getListByUpdated, getVideo } from "./mysql";
import { sleep } from "../../util";
import { createdAndUpdated } from "./helper";
import { $redis } from "../../tools/redis";
import { infoLog } from "../../util/chalk";
import { createVideo, updateVideo, videoCreateKey, videoUpdateKey } from "./redis";


export const videoUpdateTask = async () => {
  const [, bvid] = await $redis.getList(videoUpdateKey(0)).shift()
  if (!bvid) {
    const [, hash] = await $redis.getHash(videoUpdateKey(1)).get()
    const lv1 = Object.keys(hash || {})
    if (!lv1.length) {
      const [, video] = await getListByUpdated(10, 'ASC')
      await updateVideo((video || []).map(i => i.bvid))
      await sleep(1000 * 60)
    } else {
      const queue: string[] = []
      let i = 0;
      for (const bv of lv1) {
        const count = +hash[bv]
        if (count < 3) {
          queue.push(bv)
        } else {
          await $redis.getHash(videoUpdateKey(1)).calc(bv, count)
          i++
        }
      }
      await updateVideo(queue[0])
      infoLog(`video:update:1 ===> video:update:0 ,length = ${ queue.length }`)
      infoLog(`video:update:1 ===> video:update:2 ,length = ${ i }`)
      await sleep(1000 * 10)
    }
  } else {
    await $redis.getHash(videoUpdateKey(1)).calc(bvid)
    const [err2] = await createdAndUpdated(bvid)
    if (!err2) {
      await $redis.getHash(videoCreateKey(1)).del(bvid)
    }
  }
  await sleep(2000)
  await videoUpdateTask();
}

export const videoCreateTask = async () => {
  const [, bvid] = await $redis.getList(videoCreateKey(0)).shift()
  if (!bvid) {
    const [, hash] = await $redis.getHash(videoCreateKey(1)).get()
    const lv1 = Object.keys(hash || {})
    if (!lv1.length) return await videoUpdateTask();
    const queue: string[] = []
    let i = 0;
    for (const bv of lv1) {
      const count = +hash[bv]
      if (count < 3) {
        queue.push(bv)
      } else {
        await $redis.getHash(videoCreateKey(1)).calc(bv, count)
        i++
      }
    }
    await createVideo(queue[0])
    infoLog(`video:create:1 ===> video:create:0 ,length = ${ queue.length }`)
    infoLog(`video:create:1 ===> video:create:2 ,length = ${ i }`)
    await sleep(1000 * 10)
  } else {
    await $redis.getHash(videoCreateKey(1)).calc(bvid)
    const [err] = await getVideo(bvid)
    if (err && err.message === '未收录') {//未收录
      const [err2] = await createdAndUpdated(bvid)
      if (!err2) {
        await $redis.getHash(videoCreateKey(1)).del(bvid)
      }
    }
  }
  await sleep(2000)
  await videoCreateTask();
}