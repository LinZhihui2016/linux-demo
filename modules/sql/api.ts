import { getUpCount } from "../up/mysql";
import { getVideoCount } from "../video/mysql";
import { getUpFansLength } from "../up_fans/mysql";
import { Action } from "../../type";
import { getVideoFansLength } from "../video_fans/mysql";
import { getRankDateLength } from "../rank/mysql";
import { error, success } from "../../helper";
import { ErrBase } from "../../util/error";

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
      up: { total: upCount[0].len, fans: upFansCount },
      video: { total: videoCount[0].len, fans: videoFansCount },
      rank: { date: rankLength.length }
    }
    return success(obj)
  } catch (e) {
    return error(ErrBase.mysql读取失败, e.message)
  }
}