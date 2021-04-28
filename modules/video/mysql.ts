import { VideoSql } from "../../tools/mysql/type";
import { Where } from "../../tools/mysql/where";
import { $mysql } from "../../tools/mysql";
import { PRes } from "../../type";

const VIDEO_TABLE = 'video'
export const saveVideo = async (video: VideoSql) => {
  const where = new Where().eq('bvid', video.bvid)
  const [err, data] = await $mysql.query<VideoSql>(VIDEO_TABLE).select('bvid').where(where).find()
  if (err) return [err, null]
  return $mysql.$(VIDEO_TABLE, video, data.length > 0 ? where : undefined)
}

export const getVideo = async (bv: string): PRes<VideoSql> => {
  const where = new Where().eq('bvid', bv)
  const [err, info] = await $mysql.query<VideoSql>(VIDEO_TABLE).where(where).find()
  if (err) return [err, null]
  if (info.length === 0) return [new Error('未收录'), null]
  return [null, info[0]]
}

export const getListById = async <T = VideoSql>(list: number[], select: string | string[] = '*'): PRes<T[]> => {
  const where = new Where().in('id', list)
  const [e, video] = await $mysql.query<T>(VIDEO_TABLE).select(select).where(where).orderBy('id', list).find();
  return e ? [e, null] : [null, video]
}
export const getListByBv = async <T = VideoSql>(list: string[], select: string | string[] = '*'): PRes<T[]> => {
  const where = new Where().in('bvid', list)
  const [e, video] = await $mysql.query<T>(VIDEO_TABLE).select(select).where(where).orderBy('bvid', list).find();
  return e ? [e, null] : [null, video]
}
export const getListByUpdated = async (count: number, orderBy: 'ASC' | 'DESC'): PRes<VideoSql[]> => {
  const [e, video] = await $mysql.query<VideoSql>(VIDEO_TABLE).orderBy('updated', orderBy).limit(Math.max(count, 30), 0).find();
  return e ? [e, null] : [null, video]
}