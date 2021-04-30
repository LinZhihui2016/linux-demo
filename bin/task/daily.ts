import { rankDailyTask } from "../../modules/rank/task";
import { upLogTask } from "../../modules/up_log/task";
import { videoLogTask } from "../../modules/video_log/task";
import { infoLog } from "../../util/chalk";
import { checkUp, upCreateTask } from "../../modules/up/task";
import { checkVideo, videoCreateTask } from "../../modules/video/task";

const daily = async () => {
  infoLog('获取每日排行榜')
  await rankDailyTask()
  infoLog('每日获取关注的up主信息')
  await upLogTask()
  infoLog('每日获取关注的video信息')
  await videoLogTask()
  infoLog('从全部的排行榜里检查video是否全部添加')
  await checkVideo()
  infoLog('从全部的视频表里检查up主是否全部添加')
  await checkUp()
  infoLog('开始定时更新')
  await Promise.all([upCreateTask(), videoCreateTask()])
}

daily().then(() => process.exit())