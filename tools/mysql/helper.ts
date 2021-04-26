import { Where } from "./where";
import { $mysql } from "./index";
import { toInt } from "../../util";

export const paging = <T>(table: string, {
  pageSize,
  page
}: { pageSize?: string, page?: string }, where: Where | string = '') => {
  let $pageSize = toInt(pageSize, 30)
  if ($pageSize < 10) {
    $pageSize = 10
  }
  let $page = toInt(page, 1) - 1
  if ($page < 0) {
    $page = 0
  }
  return $mysql.query<T>(table).where(where).limit($pageSize, $page)
}