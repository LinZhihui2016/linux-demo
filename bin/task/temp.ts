import { fansVideoList } from "../../modules/video_fans/mysql";

const temp = async () => {
  const a = await fansVideoList(1, {})
  console.log(a)
}
temp().then(() => process.exit(1))
