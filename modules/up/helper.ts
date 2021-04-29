import { PRes } from "../../type";
import { UpSql } from "../../tools/mysql/type";
import { error, Res } from "../../helper";
import { ErrBase } from "../../util/error";
import { getUpCache, setUpCache, upTaskLv0 } from "./redis";
import { fetchUp } from "./fetch";
import { saveUp } from "./mysql";
import { $mysql } from "../../tools/mysql";
import { stdout } from "single-line-log";
import { Where } from "../../tools/mysql/where";
import { infoLog } from "../../util/chalk";

export const createdAndUpdated = async (mid: number, noCache?: boolean): PRes<UpSql, Res> => {
  let upObj: UpSql | null = null
  //检查redis
  if (!noCache) [, upObj] = await getUpCache(mid)
  if (!upObj) {
    const [, data] = await fetchUp(mid)
    data && await setUpCache(data)
    upObj = data
  }
  if (!upObj) return [error(ErrBase.b站抓取失败, mid + ''), null]
  const [err] = await saveUp(upObj)
  !err && infoLog(mid + '保存成功')
  return err ? [error(ErrBase.mysql写入失败, err.sql), null] : [null, upObj]
}

export const checkUp = async () => {
  const [, list] = await $mysql.query<{ UP_MID: number }>('video').select('up_mid').distinct().find();
  let tar: number[] = []
  list.map(i => i.UP_MID).forEach(i => {
    tar = tar.concat(i)
  })
  const set = new Set(tar)
  let j = 1;
  for (const i of set) {
    stdout(j + '  ' + i)
    j++
    const [, l] = await $mysql.query<{ len: number }>('up').where(new Where().eq('mid', i)).count().find()
    if (l && l[0].len === 1) {
      set.delete(i)
    } else {
      await upTaskLv0().push(i + '')
    }
  }
  stdout.clear();
  console.log('\n');
}