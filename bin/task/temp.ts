import { rankDailyTask } from "../../modules/rank/task";
import { scriptStart } from "../../helper";

const temp = async () => {
  await rankDailyTask()
}
scriptStart(temp)
