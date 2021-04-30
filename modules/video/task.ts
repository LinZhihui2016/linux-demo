import { $mysql } from "../../tools/mysql";
import { $redis } from "../../tools/redis";
import { videoSet } from "./redis";
import { infoLog } from "../../util/chalk";
import { createdAndUpdated } from "./helper";
import { sleep } from "../../util";
import { getListByUpdated } from "./mysql";

export const checkVideo = async () => {
  const [err, storage] = await $mysql.query<{ LIST: string }>('video_rank').select('list').find()
  if (err) return
  const [err2, sql] = await $mysql.query<{ BVID: string }>('video').select('BVID').distinct().find()
  if (err2) return
  const storageSet = $redis.getSet(videoSet('storage'))
  const sqlSet = $redis.getSet(videoSet('sql'))
  await storageSet.clear()
  await sqlSet.clear()
  await storageSet.add(storage.map(i => i.LIST.split(',')).reduce((a, b) => a.concat(b), []))
  await sqlSet.add(sql.map(i => i.BVID))
}

export const videoCreateTask = async () => {
  const wait = $redis.getSet(videoSet('wait'))
  const storage = $redis.getSet(videoSet('storage'))
  const fail = $redis.getSet(videoSet('fail'))
  const [, list] = await storage.diff(videoSet('sql'))
  const [, failList] = await fail.all();
  infoLog(list.length + '个视频')
  await wait.add(list)
  await wait.del(failList)
  while (1) {
    await sleep(2000)
    const [, bv] = await wait.pop()
    if (bv) {
      const [err2] = await createdAndUpdated(bv)
      if (err2) {
        await fail.add(bv)
      } else {
        await fail.del(bv)
      }
    } else {
      break
    }
  }
  const failTask = await fail.all()
  console.log(failTask[1])
  taskBranch()
}


export const videoUpdateTask = async () => {
  const [, video] = await getListByUpdated(10, 'ASC')
  if (video) {
    for (const bvid of video.map(i => i.bvid)) {
      await createdAndUpdated(bvid)
    }
  }
  taskBranch()
}

export const taskBranch = () => {
  setTimeout(async () => {
    const storage = $redis.getSet(videoSet('storage'))
    const [, list] = await storage.diff(videoSet('sql'))
    if (list.length) {
      await videoCreateTask()
    } else {
      await videoUpdateTask()
    }
  }, 1000 * 60 * 5)

}