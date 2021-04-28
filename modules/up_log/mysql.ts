import { $mysql } from "../../tools/mysql";
import { Where } from "../../tools/mysql/where";
import { UpLogSql } from "../../tools/mysql/type";

const UP_LOG_TABLE = 'up_log'

export const saveUpLog = async (log: UpLogSql) => {
  const where = new Where().eq('up_id', log.up_id).eq('date', log.date)
  const [err, data] = await $mysql.query<UpLogSql>(UP_LOG_TABLE).select('id').where(where).find()
  if (err) return [err, null]
  return $mysql.$(UP_LOG_TABLE, log, data.length > 0 ? where : undefined)
}