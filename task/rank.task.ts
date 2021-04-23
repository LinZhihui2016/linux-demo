import { RankId } from "../crawler/ranking";
import * as rank from '../api/rank'
import { apiLog } from "../util/log";
import { PRes } from "../type";

export const saveTodayRank = async () => {
  const rankIdList = Object.keys(RankId).filter(i => /^[0-9]*$/.test(i))
  const work = async (rid: RankId, retry = 0): PRes<string> => {
    const res = await rank.postAdd({ noCache: false, rid: rid as unknown as RankId })
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
    await work(rid as unknown as RankId)
  }
}
