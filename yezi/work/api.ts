import { Action } from "../../type";
import { format, initDayjs, initNumber, initString, isUndef, notInArr } from "../../util";
import { error, success } from "../../helper";
import { ErrBase, ErrYezi } from "../../util/error";
import { $date } from "../../util/date";
import { addWork, getWorkList, LogSql, updateWork } from "./mysql";
import dayjs from "dayjs";

export const postAdd: Action<{ content: string, deadline?: number }> = async ({ content, deadline }) => {
  const _content = initString(content)
  if (!_content) return error(ErrBase.参数错误);
  if ((_content || '').length > 30) return error(ErrYezi.文本过长);
  const _deadline = deadline ? $date(deadline) : undefined
  const [err] = await addWork(content, _deadline)
  return err ? error(ErrYezi.记录操作失败) : success('添加成功')
}

export const postEdit: Action<{ id: number, content: string }> = async ({ id, content }) => {
  const _id = initNumber(id)
  if (!_id) return error(ErrBase.参数错误);
  const _content = initString(content)
  if (!_content) return error(ErrBase.参数错误);
  if ((_content || '').length > 30) return error(ErrYezi.文本过长);
  const [err] = await updateWork(_id, { content: _content })
  return err ? error(ErrYezi.记录操作失败) : success('修改成功')
}

export const postFinish: Action<{ id: number }> = async ({ id }) => {
  const _id = initNumber(id)
  if (!_id) return error(ErrBase.参数错误);
  const [err] = await updateWork(_id, { status: 'finish' })
  return err ? error(ErrYezi.记录操作失败) : success('修改成功')
}

export const postCancel: Action<{ id: number }> = async ({ id }) => {
  const _id = initNumber(id)
  if (!_id) return error(ErrBase.参数错误);
  const [err] = await updateWork(_id, { status: 'cancel' })
  return err ? error(ErrYezi.记录操作失败) : success('修改成功')
}

export const postDeadline: Action<{ id: number, deadline?: string }> = async ({ id, deadline }) => {
  const _id = initNumber(id)
  if (!_id) return error(ErrBase.参数错误);
  if (isUndef(deadline)) {
    const [err] = await updateWork(_id, { deadline: null })
    return err ? error(ErrYezi.记录操作失败) : success('删除deadline')
  } else {
    const _deadline = initDayjs(deadline)
    const [err] = await updateWork(_id, { deadline: format(_deadline) })
    return err ? error(ErrYezi.记录操作失败) : success('修改deadline成功')
  }
}
export const getList: Action<{ status?: LogSql['status'], start?: string, end?: string }> = async (query) => {
  const { status, start, end } = query
  const _status: LogSql['status'] | '' = notInArr(['todo', 'cancel', 'finish'], status || '', '')
  const _start = initDayjs(start, dayjs().startOf('month'))
  const _end = initDayjs(end, dayjs().startOf('month').add(1, 'month'))
  const [err, list] = await getWorkList(_start, _end, _status)
  return err ? error(ErrBase.mysql读取失败) : success(list)

}