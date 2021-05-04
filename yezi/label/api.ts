import { Action } from "../../type";
import { error, success } from "../../helper";
import { ErrBase, ErrYezi } from "../../util/error";
import { addLabel, addLabelP, disLabel, getLabelsByPid, LabelSql, moveLabel, updateLabel } from "./mysql";
import { initNumber, initString, isUndef } from "../../util";

export const postUpdate: Action<{ name: string, unit?: string, pid?: number, id?: number, type: LabelSql['type'] }> = async (query) => {
  const { name, unit, pid, id, type } = query
  const _name = initString(name)
  const _unit = initString(unit);
  const _id = initNumber(id)
  if (!['category', 'count', 'check'].includes(type)) return error(ErrBase.参数错误)
  if (!_name) return error(ErrBase.参数错误)
  if (type === 'category' && _unit) return error(ErrBase.参数错误, 'category不应该带单位')
  if (type === 'count' && !_unit) return error(ErrBase.参数错误, 'count应该带单位')
  if (type === 'check' && _unit) return error(ErrBase.参数错误, 'check不应该带单位')
  if (_id) {
    const [err] = await updateLabel(_id, { name: _name, unit: _unit, type })
    return err ? error(ErrYezi.标签操作失败) : success('修改成功')
  } else {
    if (typeof pid !== 'number') return error(ErrBase.参数错误)
    const [err] = await addLabel(_name, _unit || '', pid, type)
    return err ? error(ErrYezi.标签操作失败) : success('添加成功')
  }
}

export const postMove: Action<{ id: number, pid: number }> = async ({ id, pid }) => {
  if (isUndef([id, pid])) return error(ErrBase.参数错误)
  const [err] = await moveLabel(id, pid)
  return err ? error(ErrYezi.标签操作失败) : success('移动成功')
}

export const postCreate: Action<{ name: string }> = async ({ name }) => {
  if (isUndef(name)) return error(ErrBase.参数错误)
  const [err] = await addLabelP(name)
  return err ? error(ErrYezi.标签操作失败) : success('添加父分类成功')
}

export const postDisabled: Action<{ id: number, status: boolean }> = async ({ id, status }) => {
  if (isUndef([id, status])) return error(ErrBase.参数错误)
  const [err] = await disLabel(id, status ? 1 : 0)
  return err ? error(ErrYezi.标签操作失败) : success(status ? '禁用成功' : "解除禁用")
}

export const getList: Action<{ pid?: number }> = async ({ pid }) => {
  const [err, list] = await getLabelsByPid(initNumber(pid))
  return err ? error(ErrYezi.标签操作失败) : success(list)
}