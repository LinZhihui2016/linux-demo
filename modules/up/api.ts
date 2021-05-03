import { Action } from "../../type";
import { error, success } from "../../helper";
import { ErrBase, ErrUp } from "../../util/error";
import { getChartList, getCreatedCount, getListBySort, getListByUpdated, getUp } from "./mysql";
import { fansUp, fansUpList, unfansUp } from "../up_fans/mysql";
import { upSetAdd } from "./redis";
import { $redis } from "../../tools/redis";
import { videoSet } from "../video/redis";
import { ListQuery } from "../../tools/mysql/type";
import { notInArr } from "../../util";
import dayjs from "dayjs";

export const postAdd: Action<{ mid: number }> = async ({ mid }) => {
  const [err] = await upSetAdd(mid + '', 'storage')
  return err ? error(ErrBase.redis写入失败) : success('加入任务列表成功')
}
export const getTask: Action = async () => {
  const [err, list] = await $redis.getSet(videoSet('wait')).all()
  return err ? error(ErrBase.redis读取失败) : success(list)
}

export const getInfo: Action<{ mid: number }> = async ({ mid }) => {
  if (!mid) return error(ErrBase.参数错误)
  const [err, res] = await getUp(mid)
  if (err) return error(ErrUp.未收录该up主)
  return success(res)
}

export const postFans: Action<{ id: number, status?: 0 | 1 }> = async ({ id, status, user }) => {
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

export const getList: Action<ListQuery & { fans: number }> = async (query) => {
  const sortArr = ['follower', 'archive', 'likes', 'updated', 'created']
  query.sort = notInArr(sortArr, query.sort)
  query.orderby = notInArr(['DESC', 'ASC'], query.orderby)
  const [err, list] = await getListBySort(query, true)
  return err ? error(ErrBase.mysql读取失败, err.message) : success(list)
}

export const getChart: Action<{ key: string }> = async ({ key }) => {
  const sortArr = ['follower', 'archive', 'likes']
  const [err, list] = await getChartList(notInArr(sortArr, key))
  return err ? error(ErrBase.mysql读取失败, err.message) : success(list)
}

export const getCreatedInWeek: Action = async () => {
  const [err, list] = await getCreatedCount(dayjs().subtract(8, 'day').format('YYYY-MM-DD'), dayjs().subtract(1, 'day').format('YYYY-MM-DD'))
  return err ? error(ErrBase.mysql读取失败, err.message) : success(list)
}