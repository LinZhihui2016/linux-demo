import { apiRank, RankId } from "../crawler/ranking";
import { PRes, Type } from "../type";
import { $date } from "../util/date";
import { Where } from "../tools/mysql/where";
import { $mysql } from "../tools/mysql";
import { apiLog } from "../util/log";
import { MysqlError } from "mysql";
import { $redis, redisTask } from "../tools/redis";

export const fetchRank = async (rid: RankId): PRes<string[]> => {
  const [e, res] = await apiRank(rid)
  if (e) return [e, null]
  if (res && res.data) {
    const { data: { list } } = res
    const bvList = list.map(i => i.bvid)
    await $redis.getList(redisTask('video', 0)).push(bvList)
    return [null, list.map(i => i.bvid)]
  } else {
    apiLog().error(rid + ' 没有列表')
    return [new Error(rid + '没有列表'), null]
  }
}

export const saveRank = async (list: string[], rid: RankId) => {
  const date = $date(new Date())
  const where = new Where().eq('date', date).eq('rid', rid)
  const [err, ids] = await $mysql.query('video_rank').select('id').where(where).find()
  if (err) return [err, null]
  const data: Type.Obj<string> = {
    rid: rid + '', date, list: list.join(',')
  }
  return $mysql.$('video_rank', data, ids.length > 0 ? where : undefined)
}

export const getTodayRank = async (): PRes<string[], MysqlError> => {
  const date = $date(new Date())
  const where = new Where().eq('date', date)
  const [err, bvList] = await $mysql.query<{ LIST: string }>('video_rank').select('list').where(where).find()
  if (err) return [err, null]
  const k = bvList.map(i => i.LIST).filter(Boolean).join(',').split(',')
  const bvs = Array.from(new Set(k))
  return [null, bvs]
}