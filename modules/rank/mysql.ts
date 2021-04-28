import { Where } from "../../tools/mysql/where";
import { $mysql } from "../../tools/mysql";
import { RankId } from "../../crawler/ranking";
import { $date } from "../../util/date";
import { PRes, Type } from "../../type";

const VIDEO_RANK_TABLE = 'video_rank'
export const saveRank = async (list: string[], rid: RankId) => {
  const date = $date(new Date())
  const where = new Where().eq('date', date).eq('rid', rid)
  const [err, ids] = await $mysql.query(VIDEO_RANK_TABLE).select('id').where(where).find()
  if (err) return [err, null]
  const data: Type.Obj<string> = {
    rid: rid + '', date, list: list.join(',')
  }
  return $mysql.$(VIDEO_RANK_TABLE, data, ids.length > 0 ? where : undefined)
}

export const getRank = async (rid: RankId, date: string): PRes<string> => {
  const where = new Where().eq('rid', rid || '0').eq('date', date || $date(new Date()))
  const [err, list] = await $mysql.query<{ LIST: string }>(VIDEO_RANK_TABLE).select('list').where(where).find()
  if (err) return [err, null]
  if (list.length !== 1) return [new Error('日期或rid错误'), null]
  return [null, list[0].LIST]
}

export const getTodayList = async (): PRes<string[][]> => {
  const date = $date(new Date())
  const [err, info] = await $mysql.query<{ LIST: string }>(VIDEO_RANK_TABLE).select('list').where(new Where().eq('date', date)).find()
  return err ? [err, null] : [null, info.map(i => i.LIST.split(','))]
}