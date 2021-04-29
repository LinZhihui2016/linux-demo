import { checkUp } from "../../modules/up/helper";

const temp = async () => {
  await checkUp()
}
temp().then(() => process.exit(1))

