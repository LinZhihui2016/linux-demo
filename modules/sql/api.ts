import { getCountByDate as upCountByDate, getUpCount } from "../up/mysql";
import { getCountByDate as videoCountByDate, getVideoCount } from "../video/mysql";
import { getUpFansLength } from "../up_fans/mysql";
import { Action } from "../../type";
import { getVideoFansLength } from "../video_fans/mysql";
import { getRankDateLength } from "../rank/mysql";
import { error, success } from "../../helper";
import { ErrBase } from "../../util/error";
import { UP_FANS_MAX, VIDEO_FANS_MAX } from "../../util/magic";
import { format, getDays } from "../../util";
import dayjs from "dayjs";

export const getCount: Action = async ({ user }) => {
  const [err, upCount] = await getUpCount()
  const [err2, videoCount] = await getVideoCount()
  const [err3, upFansCount] = await getUpFansLength(user! || 1)
  const [err4, videoFansCount] = await getVideoFansLength(user! || 1)
  const [err5, rankLength] = await getRankDateLength()
  const [err6, upToday] = await upCountByDate('updated')
  const [err7, videoToday] = await videoCountByDate('updated')
  if ([err, err2, err3, err4, err5, err6, err7].some(Boolean)) {
    return error(ErrBase.mysql读取失败)
  }
  try {
    const obj = {
      up: { total: upCount[0].len, fans: upFansCount, fansMax: UP_FANS_MAX, update: upToday[0].len },
      video: { total: videoCount[0].len, fans: videoFansCount, fansMax: VIDEO_FANS_MAX, update: videoToday[0].len },
      rank: { date: rankLength.length },
      date: format(dayjs())
    }
    return success(obj)
  } catch (e) {
    return error(ErrBase.mysql读取失败, e.message)
  }
}

export const getCreatedInWeek: Action = async () => {
  const end = dayjs()
  const start = end.subtract(7, 'day')
  const day = getDays(start, end);
  const up = await upCountByDate('created', start, end)
  const video = await videoCountByDate('created', start, end)
  if (up[0]) return error(ErrBase.mysql读取失败, up[0].message)
  if (video[0]) return error(ErrBase.mysql读取失败, video[0].message)
  const $up = up[1]
  const $video = video[1]
  const map = new Map<string, { up: number, video: number }>()
  $up.forEach(({ date, len }) => {
    const v: { up: number, video: number } = map.get(date) || { up: 0, video: 0 }
    v.up = len
    map.set(date, v)
  })
  $video.forEach(({ date, len }) => {
    const v: { up: number, video: number } = map.get(date) || { up: 0, video: 0 }
    v.video = len
    map.set(date, v)
  })
  const data = day.map(date => {
    const v = map.get(date) || { up: 0, video: 0 }
    return { date, ...v }
  })
  return success(data)
}