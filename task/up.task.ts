import { $redis, redisTask } from "../tools/redis";
import * as upAction from "../api/up";
import { sleep } from "../util";
import { $mysql } from "../tools/mysql";
import { Where } from "../tools/mysql/where";
import { infoLog } from "../util/chalk";

let errorTime = 0

export const updateUp = async () => {
  const [, mid] = await $redis.getList(redisTask('up', 0)).shift()
  if (mid) {
    const [, isInSql] = await $mysql.query('up').select('mid').where(new Where().eq('mid', mid)).find()
    if (isInSql.length === 0) {
      const [, info] = await $redis.str.get(['bilibili', 'up', mid].join(':'))
      if (!info) {
        const [, time] = await $redis.getHash(redisTask('up', 1)).get(mid)
        if (!(time && +time <= 5)) {
          const res = await upAction.postAdd({ noCache: false, mid })
          const { err } = res.json.body
          if (err) {
            errorTime++
            if (errorTime >= 20) {
              await sleep(1000 * 60 * 10)
            }
            await $redis.getHash(redisTask('up', 1)).calc(mid)
          }
        }
        await sleep(3000)
      }
    } else {
      infoLog(mid + '已存在数据库')
    }
    await updateUp()
  }
}