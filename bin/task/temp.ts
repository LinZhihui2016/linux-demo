import { scriptStart } from "../../helper";
import { getRankDateLength } from "../../modules/rank/mysql";

const temp = async () => {
  const a = await getRankDateLength()
  console.log(a)
}
scriptStart(temp)
