import { VideoLogSql } from "../tools/mysql/type";
import { Where } from "../tools/mysql/where";
import { $mysql } from "../tools/mysql";

export const saveBvLog = async (log: VideoLogSql) => {
  const where = new Where().eq('video_id', log.video_id).eq('date', log.date)
  const [err, data] = await $mysql.query<VideoLogSql>('video_log').select('id').where(where).find()
  if (err) return [err, null]
  return $mysql.$('video_log', log, data.length > 0 ? where : undefined)
}