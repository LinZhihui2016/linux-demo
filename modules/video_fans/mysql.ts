import { PRes } from "../../type";
import { $mysql } from "../../tools/mysql";
import { error, Res } from "../../helper";
import { Where } from "../../tools/mysql/where";
import { ErrBase, ErrVideo } from "../../util/error";
import { VIDEO_FANS_MAX } from "../../util/magic";
import { Paging, paging } from "../../tools/mysql/helper";
import { getListById } from "../video/mysql";
import { VideoSql } from "../../tools/mysql/type";
import { $date } from "../../util/date";

const VIDEO_FANS_TABLE = 'video_fans'

export const getVideoFansLength = async (user_id: number): PRes<number, Res> => {
  const fansCountWhere = new Where().eq('user_id', user_id)
  const count = await $mysql.query<{ len: number }>(VIDEO_FANS_TABLE).where(fansCountWhere).count().find()
  if (count[0]) return [error(ErrBase.mysql读取失败, count[0].sql), null]
  return [null, count[1][0].len]
}
export const fansVideo = async (user_id: number, video_id: number): PRes<boolean, Res> => {
  const [err, len] = await getVideoFansLength(user_id)
  if (err) return [err, null]
  if (len! >= VIDEO_FANS_MAX) return [error(ErrVideo.关注数量达到上限, '关注数量达到上限'), null]
  const where = new Where().eq('user_id', user_id).eq('video_id', video_id)
  const [e, isFans] = await $mysql.query<{ len: number }>(VIDEO_FANS_TABLE).where(where).count().find()
  if (e) return [error(ErrVideo.关注失败, e.message), null]
  if (isFans[0].len > 0) return [null, true]
  const data = { user_id, video_id, fans_time: new Date().getTime() }
  const [err2] = await $mysql.insert(VIDEO_FANS_TABLE, data);
  if (err2) return [error(ErrVideo.关注失败), null]
  return [null, true]
}

export const unfansVideo = async (user_id: number, video_id: number): PRes<boolean, Res> => {
  const where = new Where().eq('user_id', user_id).eq('video_id', video_id)
  const [err] = await $mysql.delete(VIDEO_FANS_TABLE, where)
  if (err) return [error(ErrVideo.取消关注失败), null]
  return [null, true]
}

export const fansVideoList = async (user: number, page: { page?: string, pageSize?: string }): PRes<Paging<VideoSql & { isFans?: number, fans_time: string }>> => {
  const where = new Where().eq('user_id', user)
  const [e, fansUpIdList] = await paging<{ VIDEO_ID: number, FANS_TIME: number }>({
    table: VIDEO_FANS_TABLE,
    select: ['video_id', 'fans_time'],
    where,
    more: e => e.orderBy('fans_time', 'DESC'),
    page
  });
  if (e) return [e, null]
  const list = fansUpIdList!.list
  const map = new Map<number, number>()
  list.forEach(({ VIDEO_ID, FANS_TIME }) => map.set(VIDEO_ID, FANS_TIME))
  if (!list.length) return [null, { ...fansUpIdList!, list: [] }]
  const [e2, videoList] = await getListById<VideoSql & { isFans?: number, fans_time: string }>(list.map(i => i.VIDEO_ID))
  if (e2) return [e2, null]
  videoList.forEach(video => {
    video.isFans = 1
    const time = map.get(+video.id!)
    if (time) {
      video.fans_time = $date(time, 4) || ''
    }
  })
  return [null, { ...fansUpIdList!, list: videoList }]
}

export const getAllVideoInFans = async (): PRes<number[]> => {
  const [e, allList] = await $mysql.query<{ VIDEO_ID: number }>(VIDEO_FANS_TABLE).select('video_id').orderBy('updated', 'DESC').find()
  if (e) return [null, []];
  return [null, allList.map(i => i.VIDEO_ID)]
}