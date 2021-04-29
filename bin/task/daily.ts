import { rankDailyTask } from "../../modules/rank/task";
import { checkVideo } from "../../modules/video/helper";
import { checkUp } from "../../modules/up/helper";

const daily = async () => {
  await rankDailyTask()
  await checkVideo()
  await checkUp()
}

daily().then(() => process.exit())