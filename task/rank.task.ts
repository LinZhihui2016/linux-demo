import { RankId } from "../crawler/ranking";
import * as rankAction from '../api/rank'
import { apiLog } from "../util/log";
import { PRes } from "../type";
import { Where } from "../tools/mysql/where";
import { $date } from "../util/date";
import { $mysql } from "../tools/mysql";
import { $redis, redisTask } from "../tools/redis";

export const saveTodayRank = async () => {
  const rankIdList = Object.keys(RankId).filter(i => /^[0-9]*$/.test(i))
  const date = $date(new Date())
  const work = async (rid: RankId, retry = 0): PRes<string> => {
    const res = await rankAction.postAdd({ noCache: false, rid: rid as unknown as RankId })
    const { err, msg } = res.json.body
    if (err) {
      const m = [err, msg].join('|')
      apiLog().error(m)
      return retry < 3 ? work(rid, retry + 1) : [new Error(m), null]
    } else {
      apiLog().info(rid + ' OK')
      return [null, 'OK']
    }
  }
  for (const rid of rankIdList) {
    const where = new Where().eq('rid', rid).eq('date', date)
    const [, data] = await $mysql.query('video_rank').where(where).find()
    if (data.length === 0) {
      await work(rid as unknown as RankId)
    }
  }
}

export const pushTodayBv = async () => {
  const date = $date(new Date())
  const [, info] = await $mysql.query<{ LIST: string }>('video_rank').select('list').where(new Where().eq('date', date)).find()
  console.log(info)
  if (info) {
    for (const i of info) {
      await $redis.getList(redisTask('video')).push(i.LIST.split(','))
    }
  }
}