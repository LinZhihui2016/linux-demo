import { $mysql } from "../../tools/mysql";
import { $redis, redisTask } from "../../tools/redis";

const temp = async () => {
  const [, mid] = await $mysql.query<{ UP_MID: number }>('video').select('up_mid').distinct().find()
  await $redis.getList(redisTask('up')).push(mid.map(i => i.UP_MID + ''))
}
temp().then(() => process.exit(1))
