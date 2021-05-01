import { scriptStart } from "../../helper";
import { taskBranch } from "../../modules/video/task";

const temp = async () => {
  await taskBranch()
}
scriptStart(temp)
