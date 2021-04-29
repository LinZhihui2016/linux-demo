import { rankDailyTask } from "../../modules/rank/task";
import { checkVideo } from "../../modules/video/helper";
import { checkUp } from "../../modules/up/helper";
import { upLogTask } from "../../modules/up_log/task";
import { videoLogTask } from "../../modules/video_log/task";

const daily = async () => {
  await rankDailyTask()
  await checkVideo()
  await checkUp()
  await upLogTask()
  await videoLogTask()
}

daily().then(() => process.exit())