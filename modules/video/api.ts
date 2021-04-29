import { Action } from "../../type";
import { error, success } from "../../helper";
import { ErrBase, ErrVideo } from "../../util/error";
import { getListByUpdated, getVideo } from "./mysql";
import { createdAndUpdated } from "./helper";
import { fansVideo, fansVideoList, unfansVideo } from "../video_fans/mysql";

export const postCreated: Action<{ bv: string }> = async ({ bv, noCache }) => {
  if (!bv) return error(ErrBase.参数错误)
  const checkSql = await getVideo(bv)
  if (checkSql[1]) return error(ErrVideo.已收录该视频, bv)
  const [err, res] = await createdAndUpdated(bv, noCache)
  if (err) return err!
  return success(res)
}

export const postUpdated: Action<{ bv: string }> = async ({ bv, noCache }) => {
  if (!bv) return error(ErrBase.参数错误)
  const [err, res] = await createdAndUpdated(bv, noCache)
  if (err) return err!
  return success(res)
}

export const getInfo: Action<{ bv: string }> = async ({ bv }) => {
  if (!bv) return error(ErrBase.参数错误)
  const [err, res] = await getVideo(bv)
  if (err) return error(ErrVideo.未收录该视频)
  return success(res)
}

export const postFans: Action<{ id: number, status?: boolean }> = async ({ id, status, user }) => {
  if (!id) return error(ErrBase.参数错误)
  if (!user) return error(ErrBase.参数错误)
  const [err] = status ? await fansVideo(user, id) : await unfansVideo(user, id)
  return err || success(status ? '关注成功' : '取消关注成功')
}

export const getFansList: Action<{ page?: string, pageSize?: string }> = async ({ page, pageSize, user }) => {
  if (!user) return error(ErrBase.参数错误)
  const [err, list] = await fansVideoList(user, { page, pageSize })
  return err ? error(ErrBase.mysql读取失败, err.message) : success(list)
}

export const getLatest: Action<{ count: number }> = async ({ count }) => {
  const [err, list] = await getListByUpdated(count || 10, 'DESC')
  return err ? error(ErrBase.mysql读取失败, err.message) : success(list)
}