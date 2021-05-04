import { scriptStart } from "../../helper";
import { getList, postAdd, postDeadline } from "../../yezi/work/api";
import { format } from "../../util";
import dayjs from "dayjs";

const temp = async () => {
  // SELECT * from up_log LEFT JOIN up on up_log.up_id = up.id WHERE date = 1619625600000
  // const a = await getList({ label: '6' })
  // console.log(a.json.body)
  await postDeadline({ id: 1, deadline: format(dayjs().add(2, 'month')) })
  await postDeadline({ id: 4, deadline: format(dayjs().subtract(2, 'day')) })
  await postAdd({ content: '测试一下' })
  const a = await getList({})
  console.log(a.json.body)
}
scriptStart(temp)
