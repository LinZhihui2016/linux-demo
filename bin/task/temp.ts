import { scriptStart } from "../../helper";
import { getPaging } from "../../modules/rank/api";
import { RankId } from "../../crawler/ranking";

const temp = async () => {
  const a = await getPaging({ rid: RankId.全站, date: '2021-05-01' })
  console.log(a)
}
scriptStart(temp)
