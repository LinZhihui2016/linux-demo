import { videoLogTask } from "../../modules/video_log/task";

videoLogTask().then(() => process.exit(1))