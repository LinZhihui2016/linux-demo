import { scriptStart } from "../../helper";
import { $redis } from "../../tools/redis";

const temp = async () => {
  const [a, b] = await $redis.getSet('a').add(['1'])
  console.log(a, b)
}
scriptStart(temp)
