import { PRes } from "../../type";
import { $mysql } from "../../tools/mysql";
import { error, Res } from "../../helper";
import { Where } from "../../tools/mysql/where";
import { ErrBase, ErrUp } from "../../util/error";
import { UP_FANS_MAX } from "../../util/magic";
import { Paging, paging } from "../../tools/mysql/helper";
import { UpSql } from "../../tools/mysql/type";
import { getListById } from "../up/mysql";

const UP_FANS_TABLE = 'up_fans'

export const getUpFansLength = async (user: number): PRes<number, Res> => {
  const fansCountWhere = new Where().eq('user_id', user)
  const count = await $mysql.query<{ len: number }>(UP_FANS_TABLE).where(fansCountWhere).count().find()
  if (count[0]) return [error(ErrBase.mysql读取失败, count[0].sql), null]
  return [null, count[1][0].len]
}
export const fansUp = async (user: number, up_id: number): PRes<boolean, Res> => {
  const [err, len] = await getUpFansLength(user)
  if (err) return [err, null]
  if (len! >= UP_FANS_MAX) return [error(ErrUp.关注数量达到上限, '关注数量达到上限'), null]
  const data = { user, up_id, fans_time: new Date().getTime() }
  const [err2] = await $mysql.insert(UP_FANS_TABLE, data);
  if (err2) return [error(ErrUp.关注失败), null]
  return [null, true]
}

export const unfansUp = async (user: number, up_id: number): PRes<boolean, Res> => {
  const where = new Where().eq('user', user).eq('up_id', up_id)
  const [err] = await $mysql.delete(UP_FANS_TABLE, where)
  if (err) return [error(ErrUp.取消关注失败), null]
  return [null, true]
}

export const fansUpList = async (user: number, page: { page?: string, pageSize?: string }): PRes<Paging<UpSql>> => {
  const where = new Where().eq('user_id', user)
  const [e, res] = await paging<{ UP_ID: number }>({
    table: UP_FANS_TABLE,
    select: 'up_id',
    where,
    more: e => e.orderBy('fans_time', 'DESC'),
    page
  });
  if (e) return [e, null]
  const list = res!.list
  if (!list.length) return [null, { ...res!, list: [] }]
  const [e2, upList] = await getListById(list.map(i => i.UP_ID))
  if (e2) return [e2, null]
  return [null, { ...res!, list: upList! }]
}

export const getAllUpInFans = async (): PRes<number[]> => {
  const [e, allList] = await $mysql.query<{ UP_ID: number }>(UP_FANS_TABLE).select('up_id').orderBy('updated', 'DESC').find()
  if (e) return [null, []];
  return [null, allList.map(i => i.UP_ID)]
}