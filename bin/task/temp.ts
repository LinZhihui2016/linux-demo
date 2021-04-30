import { rankDailyTask } from "../../modules/rank/task";

const temp = async () => {
  await rankDailyTask()
}
temp().then(() => process.exit(1))

