import { $redis } from "../tools/redis";
import { $mysql } from "../tools/mysql";
import { saveTodayRank } from "./rank.task";
import schedule from "node-schedule";
import { updateBv } from "./bv.task";
import { updateUp } from "./up.task";

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
  schedule.scheduleJob('*50***', saveTodayRank) //每日0点5分开始采集排行榜
  schedule.scheduleJob('*10****', updateBv)
  schedule.scheduleJob('*10****', updateUp)
}