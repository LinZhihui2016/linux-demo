import { RankId } from "../crawler/ranking";
import * as rankAction from '../api/rank'
import { apiLog } from "../util/log";
import { PRes } from "../type";
import { Where } from "../tools/mysql/where";
import { $date } from "../util/date";
import { $mysql } from "../tools/mysql";

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
