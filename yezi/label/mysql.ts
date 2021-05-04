import { $yezi } from "../../tools/mysql";
import { Where } from "../../tools/mysql/where";

export interface LabelSql {
  id: number
  pid: number,
  name: string,
  created: string,
  updated: string,
  disabled: number,
  unit: string,
  type: 'category' | 'count' | 'check'
}

const LABEL = 'label'
export const addLabel = (name: string, unit: string, pid: number, type: LabelSql['type']) => {
  return $yezi.insert(LABEL, { name, pid, unit, type })
}

export const addLabelP = (name: string) => {
  return addLabel(name, '', 0, 'category')
}

export const updateLabel = (id: number, data: { name?: string, unit?: string, type?: string }) => {
  return $yezi.update(LABEL, data, new Where().eq('id', id))
}

export const moveLabel = (id: number, pid: number) => {
  return $yezi.update(LABEL, { pid }, new Where().eq('id', id))
}

export const disLabel = (id: number, disabled: 0 | 1) => {
  return $yezi.update(LABEL, { disabled }, new Where().eq('id', id))
}

export const getLabelsByPid = (pid: number) => {
  return $yezi.query(LABEL).where(new Where().eq('pid', pid)).find()
}

export const getLabelById = (id: number) => {
  return $yezi.query(LABEL).where(new Where().eq('id', id)).find()
}