import { Action } from "../../type";
import { error, success } from "../../helper";
import { ErrBase, ErrYezi } from "../../util/error";
import { initDate, initDayjs, initNumber, initString, isUndef } from "../../util";
import { addItem, delItem, getItems, updateItem } from "./mysql";
import dayjs from "dayjs";
import { $date } from "../../util/date";

export const postAdd: Action<{ label: number, content: number, mark?: string, date: number }> = async (query) => {
  const { label, content, mark, date } = query
  const _label = initNumber(label)
  if (!_label) return error(ErrBase.参数错误);
  const _content = initNumber(content, 0)
  const _date = initDate(date, new Date())
  const _mark = initString(mark)

  const [err] = await addItem($date(_date), _label, _content, _mark)
  return err ? error(ErrYezi.记录操作失败) : success('添加成功')
}

export const postEdit: Action<{ id: number, content?: number, mark?: string }> = async (query) => {
  const { id, content, mark } = query
  if (isUndef(id)) return error(ErrBase.参数错误);
  if (isUndef(content) && isUndef(mark)) return success('无改动');
  const [err] = await updateItem(id, { content, mark })
  return err ? error(ErrYezi.记录操作失败) : success('修改成功')
}

export const postDel: Action<{ id: number }> = async ({ id }) => {
  if (isUndef(id)) return error(ErrBase.参数错误);
  const [err] = await delItem(id)
  return err ? error(ErrYezi.记录操作失败) : success('删除成功')
}

export const getList: Action<{ label?: string, start?: string, end?: string }> = async (query) => {
  const { start, end, label } = query
  const _start = initDayjs(start, dayjs())
  const _end = initDayjs(end, dayjs().add(1, 'date'))
  const _label = initNumber(label, 0)
  const [err, list] = await getItems(_start, _end, _label)
  return err ? error(ErrYezi.记录操作失败, err.sql) : success(list)
}