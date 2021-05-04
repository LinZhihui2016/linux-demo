import { scriptStart } from "../../helper";
import { getPaging } from "../../modules/rank/api";
import { RankId } from "../../crawler/ranking";

const temp = async () => {
  const res = await getPaging({ rid: RankId.全站, date: '2021-05-03' })
  console.log(res.json.body)
}
scriptStart(temp)
