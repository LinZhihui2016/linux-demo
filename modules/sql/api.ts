import { getCreatedCount as upCreatedCount, getUpCount } from "../up/mysql";
import { getCreatedCount as videoCreatedCount, getVideoCount } from "../video/mysql";
import { getUpFansLength } from "../up_fans/mysql";
import { Action } from "../../type";
import { getVideoFansLength } from "../video_fans/mysql";
import { getRankDateLength } from "../rank/mysql";
import { error, success } from "../../helper";
import { ErrBase } from "../../util/error";
import { UP_FANS_MAX, VIDEO_FANS_MAX } from "../../util/magic";
import { getDays } from "../../util";

export const getCount: Action = async ({ user }) => {
  const [err, upCount] = await getUpCount()
  const [err2, videoCount] = await getVideoCount()
  const [err3, upFansCount] = await getUpFansLength(user! || 1)
  const [err4, videoFansCount] = await getVideoFansLength(user! || 1)
  const [err5, rankLength] = await getRankDateLength()
  if ([err, err2, err3, err4, err5].some(Boolean)) {
    return error(ErrBase.mysql读取失败)
  }
  try {
    const obj = {
      up: { total: upCount[0].len, fans: upFansCount, fansMax: UP_FANS_MAX },
      video: { total: videoCount[0].len, fans: videoFansCount, fansMax: VIDEO_FANS_MAX },
      rank: { date: rankLength.length }
    }
    return success(obj)
  } catch (e) {
    return error(ErrBase.mysql读取失败, e.message)
  }
}

export const getCreatedInWeek: Action = async () => {
  const day = getDays();
  const end = day[0]
  const start = day.slice(-1)[0]
  const up = await upCreatedCount(start, end)
  const video = await videoCreatedCount(start, end)
  if (up[0]) return error(ErrBase.mysql读取失败, up[0].message)
  if (video[0]) return error(ErrBase.mysql读取失败, video[0].message)
  console.log(up,video)
  const $up = up[1]
  const $video = video[1]
  const map = new Map<string, { up: number, video: number }>()
  $up.forEach(({ date, up }) => {
    console.log(date, up)
    const v: { up: number, video: number } = map.get(date) || { up: 0, video: 0 }
    v.up = up
    map.set(date, v)
  })
  $video.forEach(({ date, video }) => {
    console.log(date, video)
    const v: { up: number, video: number } = map.get(date) || { up: 0, video: 0 }
    v.video = video
    map.set(date, v)
  })
  const data = day.map(date => {
    const v = map.get(date) || { up: 0, video: 0 }
    return { date, ...v }
  })
  return success(data)
}