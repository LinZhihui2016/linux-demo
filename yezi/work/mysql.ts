import { $yezi } from "../../tools/mysql";
import { Where } from "../../tools/mysql/where";
import { Dayjs } from "dayjs";
import { format } from "../../util";

export interface LogSql {
  id: number,
  content: number,
  status: 'todo' | 'cancel' | 'finish',
  created: string,
  updated: string,
  deadline: string
}

const WORK = 'work'

export const addWork = async (content: string, deadline?: string) => {
  return $yezi.insert(WORK, { content, deadline, status: 'todo' })
}
export const updateWork = async (id: number, data: { content?: string, deadline?: string | null, status?: LogSql['status'] }) => {
  return $yezi.update(WORK, data, new Where().eq('id', id))
}

export const getWorkList = async (start: Dayjs, end: Dayjs, status: LogSql['status'] | '',) => {
  const where = new Where().between('deadline', format(start), format(end));
  status && where.eq('status', status)
  return $yezi.query(WORK).where(where).orderBy('deadline', 'DESC').find()
}