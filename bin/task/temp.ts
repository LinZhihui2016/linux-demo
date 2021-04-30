import { rankDailyTask } from "../../modules/rank/task";
import { scriptStart } from "../../tools/log4js/log";

const temp = async () => {
  await rankDailyTask()
}
scriptStart(temp)
