import { PRes } from "../../type";
import { $mysql } from "../../tools/mysql";
import { error, Res } from "../../helper";
import { Where } from "../../tools/mysql/where";
import { ErrBase, ErrVideo } from "../../util/error";
import { VIDEO_FANS_MAX } from "../../util/magic";
import { Paging, paging } from "../../tools/mysql/helper";
import { getListById } from "../video/mysql";
import { VideoSql } from "../../tools/mysql/type";

const VIDEO_FANS_TABLE = 'video_fans'

export const getVideoFansLength = async (user: number): PRes<number, Res> => {
  const fansCountWhere = new Where().eq('user_id', user)
  const count = await $mysql.query<{ len: number }>(VIDEO_FANS_TABLE).where(fansCountWhere).count().find()
  if (count[0]) return [error(ErrBase.mysql读取失败, count[0].sql), null]
  return [null, count[1][0].len]
}
export const fansVideo = async (user: number, video_id: number): PRes<boolean, Res> => {
  const [err, len] = await getVideoFansLength(user)
  if (err) return [err, null]
  if (len! >= VIDEO_FANS_MAX) return [error(ErrVideo.关注数量达到上限, '关注数量达到上限'), null]
  const data = { user, video_id, fans_time: new Date().getTime() }
  const [err2] = await $mysql.insert(VIDEO_FANS_TABLE, data);
  if (err2) return [error(ErrVideo.关注失败), null]
  return [null, true]
}

export const unfansVideo = async (user: number, video_id: number): PRes<boolean, Res> => {
  const where = new Where().eq('user', user).eq('video_id', video_id)
  const [err] = await $mysql.delete(VIDEO_FANS_TABLE, where)
  if (err) return [error(ErrVideo.取消关注失败), null]
  return [null, true]
}

export const fansVideoList = async (user: number, page: { page?: string, pageSize?: string }): PRes<Paging<VideoSql>> => {
  const where = new Where().eq('user_id', user)
  const [e, res] = await paging<{ VIDEO_ID: number }>({
    table: VIDEO_FANS_TABLE,
    select: 'video_id',
    where,
    more: e => e.orderBy('fans_time', 'DESC'),
    page
  });
  if (e) return [e, null]
  const list = res!.list
  if (!list.length) return [null, { ...res!, list: [] }]
  const [e2, videoList] = await getListById(list.map(i => i.VIDEO_ID))
  if (e2) return [e2, null]
  return [null, { ...res!, list: videoList! }]
}

export const getAllVideoInFans = async (): PRes<number[]> => {
  const [e, allList] = await $mysql.query<{ VIDEO_ID: number }>(VIDEO_FANS_TABLE).select('video_id').orderBy('updated', 'DESC').find()
  if (e) return [null, []];
  return [null, allList.map(i => i.VIDEO_ID)]
}