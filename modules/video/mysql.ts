import { ListQuery, VideoSql } from "../../tools/mysql/type";
import { Where } from "../../tools/mysql/where";
import { $mysql } from "../../tools/mysql";
import { PRes } from "../../type";
import { paging, Paging } from "../../tools/mysql/helper";
import { getAllVideoInFans } from "../video_fans/mysql";
import dayjs, { Dayjs } from "dayjs";
import { format } from "../../util";

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

export const getListById = <T = VideoSql>(list: number[], select: string | string[] = '*') => {
  const where = new Where().in('id', list)
  return $mysql.query<T>(VIDEO_TABLE).select(select).where(where).orderBy('id', list).find();
}
export const getListByBv = async <T = VideoSql>(list: string[], select: string | string[] = '*'): PRes<T[]> => {
  const where = new Where().in('bvid', list)
  const [e, video] = await $mysql.query<T>(VIDEO_TABLE).select(select).where(where).orderBy('bvid', list).find();
  return e ? [e, null] : [null, video]
}
export const getListByUpdated = async (count: number, orderBy: 'ASC' | 'DESC') => {
  return $mysql.query<VideoSql>(VIDEO_TABLE).orderBy('updated', orderBy).limit(Math.max(count, 30), 0).find();
}
export const getListBySort = async (query: ListQuery, getFans: boolean): PRes<Paging<VideoSql & { isFans?: number }>> => {
  const {
    page,
    pageSize,
    orderby,
    sort
  } = query
  const [err, pagingList] = await paging<VideoSql>({
    table: VIDEO_TABLE,
    page: { pageSize, page },
    more: e => sort ? e.orderBy(sort, orderby) : e,
    where: new Where().notEq('type', 'deleted')
  })
  if (err) return [err, null]
  const list: (VideoSql & { isFans: number })[] = pagingList!.list.map(i => ({ ...i, isFans: 0 }))
  if (!getFans) return [null, pagingList!]
  const res: Paging<VideoSql & { isFans: number }> = {
    list,
    total: pagingList!.total,
    totalPage: pagingList!.totalPage
  }
  const [e, fansList] = await getAllVideoInFans()
  if (e) return [null, res]
  res.list.forEach(i => {
    i.isFans = +fansList!.includes(i.id as number)
  })
  return [null, res]
}

export const getChartList = async (orderBy: string) => {
  return $mysql.query(VIDEO_TABLE).limit(10, 0).orderBy(orderBy, 'DESC').find()
}
export const getVideoCount = async (where?: Where) => {
  const $where = where || new Where()
  return $mysql.query<{ len: number }>(VIDEO_TABLE).where($where).count().find()
}

export const getCountByDate = async (type: 'updated' | 'created', start: Dayjs = dayjs(), end: Dayjs = dayjs().add(1, 'day')) => {
  return $mysql.query<{ len: number, date: string }>(VIDEO_TABLE).case()
      .select([[`date_format(${ type }, '%Y-%m-%d')`, 'date'], [`count(*)`, 'len']])
      .where(new Where().between(`${ type }`, format(start), format(end)))
      .groupBy('date')
      .find()
}