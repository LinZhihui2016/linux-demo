import { rankDailyTask } from "../../modules/rank/task";
import { checkVideo } from "../../modules/video/helper";
import { checkUp } from "../../modules/up/helper";
import { upLogTask } from "../../modules/up_log/task";
import { videoLogTask } from "../../modules/video_log/task";
import { infoLog } from "../../util/chalk";

const daily = async () => {
  infoLog('rankDailyTask')
  await rankDailyTask()
  infoLog('checkVideo')
  await checkVideo()
  infoLog('checkUp')
  await checkUp()
  infoLog('upLogTask')
  await upLogTask()
  infoLog('videoLogTask')
  await videoLogTask()
}

daily().then(() => process.exit())