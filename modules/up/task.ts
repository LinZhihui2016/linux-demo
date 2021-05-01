import { createdAndUpdated } from "./helper";
import { $redis, getTaskLock } from "../../tools/redis";
import { $mysql } from "../../tools/mysql";
import { upSet } from "./redis";
import { UpSql } from "../../tools/mysql/type";
import { sleep } from "../../util";
import { getListByUpdated } from "./mysql";
import { scriptLog } from "../../tools/log4js/log";

export const checkUp = async () => {
  const [err, storage] = await $mysql.query<{ UP_MID: number }>('video').select('up_mid').distinct().find()
  if (err) return
  const [err2, sql] = await $mysql.query<UpSql>('up').distinct().find()
  if (err2) return
  const storageSet = $redis.getSet(upSet('storage'))
  const sqlSet = $redis.getSet(upSet('sql'))
  await storageSet.clear()
  await sqlSet.clear()
  scriptLog(`check up storage: ${ storage.length },sql: ${ sql.length }`)
  await storageSet.add(storage.map(i => i.UP_MID).filter(Boolean).map(String))
  await sqlSet.add(sql.map(i => i.mid + ''))
}
export const taskBranch = async () => {
  if (new Date().getHours() >= 23) return;
  const storage = $redis.getSet(upSet('storage'))
  const [, list] = await storage.diff(upSet('sql'))
  const fail = await $redis.getSet(upSet('fail')).all()
  if (!fail[1]) {
    await upUpdateTask()
  }
  if (list.length - fail[1].length) {
    await upCreateTask()
  } else {
    await upUpdateTask()
  }
}
export const upCreateTask = async () => {
  const wait = $redis.getSet(upSet('wait'))
  const storage = $redis.getSet(upSet('storage'))
  const fail = $redis.getSet(upSet('fail'))
  const [, list] = await storage.diff(upSet('sql'))
  const [, failList] = await fail.all();
  scriptLog(`new up task, length ${ list.length }`)
  list.length && await wait.add(list)
  failList.length && await wait.del(failList)
  while (1) {
    const [, mid] = await wait.pop()
    if (mid) {
      const lock = await getTaskLock('up')
      if (lock) await sleep(1000 * 60 * 60 * 2)
      const [err2] = await createdAndUpdated(+mid)
      if (err2) {
        await fail.add(mid)
      } else {
        await fail.del(mid)
      }
      await sleep(8000)
    } else {
      break
    }
  }
  await sleep(1000 * 60)
  await taskBranch()
}

export const upUpdateTask = async () => {
  const [, up] = await getListByUpdated(10, 'ASC')
  scriptLog(`start up update, length ${ up.length }`)
  if (up) {
    for (const mid of up.map(i => i.mid)) {
      const lock = await getTaskLock('up')
      if (lock) await sleep(1000 * 60 * 60 * 2)
      await createdAndUpdated(+mid, true)
      await sleep(10000)
    }
  }
  await sleep(1000 * 60)
  await taskBranch()
}

