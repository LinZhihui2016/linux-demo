import { UpLogSql } from "../tools/mysql/type";
import { Where } from "../tools/mysql/where";
import { $mysql } from "../tools/mysql";

export const saveUpLog = async (log: UpLogSql) => {
  const where = new Where().eq('up_id', log.up_id).eq('date', log.date)
  const [err, data] = await $mysql.query<UpLogSql>('up_log').select('id').where(where).find()
  if (err) return [err, null]
  return $mysql.$('up_log', log, data.length > 0 ? where : undefined)
}