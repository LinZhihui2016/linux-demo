import { Action } from "../../type";
import { error, success } from "../../helper";
import { ErrBase, ErrUp } from "../../util/error";
import { getListByUpdated, getUp } from "./mysql";
import { createdAndUpdated } from "./helper";
import { fansUp, fansUpList, unfansUp } from "../up_fans/mysql";

export const postCreated: Action<{ mid: number }> = async ({ mid, noCache }) => {
  if (!mid) return error(ErrBase.参数错误)
  const checkSql = await getUp(mid)
  if (checkSql[1]) return error(ErrUp.已收录该up主, checkSql[1].name)
  const [err, res] = await createdAndUpdated(mid, noCache)
  if (err) return err!
  return success(res)
}

export const postUpdated: Action<{ mid: number }> = async ({ mid, noCache }) => {
  if (!mid) return error(ErrBase.参数错误)
  const [err, res] = await createdAndUpdated(mid, noCache)
  if (err) return err!
  return success(res)
}

export const getInfo: Action<{ mid: number }> = async ({ mid }) => {
  if (!mid) return error(ErrBase.参数错误)
  const [err, res] = await getUp(mid)
  if (err) return error(ErrUp.未收录该up主)
  return success(res)
}

export const postFans: Action<{ id: number, status?: boolean }> = async ({ id, status, user }) => {
  if (!id) return error(ErrBase.参数错误)
  if (!user) return error(ErrBase.参数错误)
  const [err] = status ? await fansUp(user, id) : await unfansUp(user, id)
  return err || success(status ? '关注成功' : '取消关注成功')
}

export const getFansList: Action<{ page?: string, pageSize?: string }> = async ({ page, pageSize, user }) => {
  if (!user) return error(ErrBase.参数错误)
  const [err, list] = await fansUpList(user, { page, pageSize })
  return err ? error(ErrBase.mysql读取失败, err.message) : success(list)
}

export const getLatest: Action<{ count: number }> = async ({ count }) => {
  const [err, list] = await getListByUpdated(count || 10, 'DESC')
  return err ? error(ErrBase.mysql读取失败, err.message) : success(list)
}