import { scriptStart } from "../../helper";
import { getPaging } from "../../modules/rank/api";
import { RankId } from "../../crawler/ranking";

const temp = async () => {
   await getPaging({ rid: RankId.全站, date: '2021-05-01' })
}
scriptStart(temp)
