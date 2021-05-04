import { $yezi } from "../../tools/mysql";
import { Where } from "../../tools/mysql/where";
import { Dayjs } from "dayjs";
import { format } from "../../util";

export interface LogSql {
  id: number,
  label: number,
  content: number,
  mark: string,
  created: string,
  updated: string,
  date: number
}

const DAILY_LOG = 'daily_log'

export const addItem = async (date: string, label: number, content: number, mark?: string) => {
  return $yezi.insert(DAILY_LOG, { date, label, content, mark })
}
export const updateItem = async (id: number, data: { label?: number, content?: number, mark?: string }) => {
  return $yezi.update(DAILY_LOG, data, new Where().eq('id', id))
}

export const delItem = async (id: number, where = new Where()) => {
  return $yezi.delete(DAILY_LOG, where.eq('id', id))
}

export const getItems = async (start: Dayjs, end: Dayjs, label = 0) => {
  const where = new Where().between('date', format(start), format(end))
  label && where.eq('label', label)
  return $yezi.query<LogSql>(DAILY_LOG).case(false)
      .select(['daily_log.id', 'daily_log.mark', 'daily_log.content', 'daily_log.date', 'label.unit', 'label.type'])
      .join('label', new Where().eq('daily_log.label', 'label.id', { raw: true }), 'left')
      .where(where)
      .orderBy('updated', "DESC")
      .find()
}