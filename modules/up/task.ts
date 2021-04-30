import { createdAndUpdated } from "./helper";
import { $redis } from "../../tools/redis";
import { infoLog } from "../../util/chalk";
import { $mysql } from "../../tools/mysql";
import { upSet } from "./redis";
import { UpSql } from "../../tools/mysql/type";
import { sleep } from "../../util";

export const checkUp = async () => {
  const [err, storage] = await $mysql.query<{ UP_MID: number }>('video').select('up_mid').distinct().find()
  if (err) return
  const [err2, sql] = await $mysql.query<UpSql>('up').distinct().find()
  if (err2) return
  const storageSet = $redis.getSet(upSet('storage'))
  const sqlSet = $redis.getSet(upSet('sql'))
  await storageSet.clear()
  await sqlSet.clear()
  await storageSet.add(storage.map(i => i.UP_MID).filter(Boolean).map(String))
  await sqlSet.add(sql.map(i => i.mid + ''))
}

export const upCreateTask = async () => {
  const wait = $redis.getSet(upSet('wait'))
  const storage = $redis.getSet(upSet('storage'))
  const fail = $redis.getSet(upSet('fail'))
  const [, list] = await storage.diff(upSet('sql'))
  const [, failList] = await fail.all();
  infoLog(list.length + '个up主')
  await wait.add(list)
  await wait.del(failList)
  while (1) {
    await sleep(8000)
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