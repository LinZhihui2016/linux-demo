import { $redis } from "../../tools/redis";
import { sleep } from "../../util";

const temp = async () => {
  const test = $redis.getList('test')
  for (let i = 0; i < 100; i++) {
    const [, v] = await test.shift();
    await $redis.getHash('test2').calc(v)
    await sleep(Math.ceil(Math.random() * 100))
  }
}
temp().then(() => process.exit(1))

