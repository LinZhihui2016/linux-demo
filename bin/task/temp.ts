import { scriptStart } from "../../helper";
import { getCreatedInWeek } from "../../modules/up/api";

const temp = async () => {
  const res = await getCreatedInWeek({})
  console.log(res)
}
scriptStart(temp)
