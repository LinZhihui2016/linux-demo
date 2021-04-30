import { rankDailyTask } from "../../modules/rank/task";
import { upLogTask } from "../../modules/up_log/task";
import { videoLogTask } from "../../modules/video_log/task";
import { checkUp, upCreateTask } from "../../modules/up/task";
import { checkVideo, videoCreateTask } from "../../modules/video/task";
import { scriptLog, scriptStart } from "../../tools/log4js/log";

const daily = async () => {
  scriptLog('获取每日排行榜')
  await rankDailyTask()
  scriptLog('每日获取关注的up主信息')
  await upLogTask()
  scriptLog('每日获取关注的video信息')
  await videoLogTask()
  scriptLog('从全部的排行榜里检查video是否全部添加')
  await checkVideo()
  scriptLog('从全部的视频表里检查up主是否全部添加')
  await checkUp()
  scriptLog('开始定时更新')
  await Promise.all([upCreateTask(), videoCreateTask()])
}
scriptStart(daily)