import { VideoLogSql } from "../../tools/mysql/type";
import { Where } from "../../tools/mysql/where";
import { $mysql } from "../../tools/mysql";

const VIDEO_LOG_TABLE = 'video_log'

export const saveVideoLog = async (log: VideoLogSql) => {
  const where = new Where().eq('video_id', log.video_id).eq('date', log.date)
  const [err, data] = await $mysql.query<VideoLogSql>(VIDEO_LOG_TABLE).select('id').where(where).find()
  if (err) return [err, null]
  return $mysql.$(VIDEO_LOG_TABLE, log, data.length > 0 ? where : undefined)
}