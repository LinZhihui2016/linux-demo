import { scriptStart } from "../../helper";
import { checkUp } from "../../modules/up/task";

const temp = async () => {
  await checkUp()
}
scriptStart(temp)
