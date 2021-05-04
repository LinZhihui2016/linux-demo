import { scriptStart } from "../../helper";
import { getCountByDate } from "../../modules/up/mysql";
import dayjs from "dayjs";

const temp = async () => {
  const res = await getCountByDate(dayjs(), dayjs().add(1, 'day'))
  console.log(res)
}
scriptStart(temp)
