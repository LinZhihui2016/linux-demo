import { $redis } from "../tools/redis";
import { $mysql } from "../tools/mysql";
import { getTodayRank } from "../model/rank.model";
import { addBvList } from "../model/bv.model";
import { apiLog } from "../util/log";

export const taskInit = () => {
  const timer = setInterval(async () => {
    const redis = $redis.isConnect
    const mysql = $mysql.isConnect
    if (redis && mysql) {
      clearInterval(timer)
      await taskStart()
    }
  }, 1000)
}

export const taskStart = async () => {
  // await saveTodayRank()
  const [err, bvs] = await getTodayRank()
  err && apiLog().error(err.sql)
  if (bvs) {
    await addBvList(bvs)
  }
}