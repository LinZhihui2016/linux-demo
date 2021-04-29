import { upCreateTask } from "../../modules/up/task";

const temp = async () => {
  await upCreateTask()
}
temp().then(() => process.exit(1))

