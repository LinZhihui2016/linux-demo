import { scriptStart } from "../../helper";
import { getRatioInWeek } from "../../modules/rank/api";

const temp = async () => {
  await getRatioInWeek({})
}
scriptStart(temp)
