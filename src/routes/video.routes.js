import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,

} from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.use(verifyJWT); //Applied verifyJWT middlewares to all routers

router
  .route("/").post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1
      },
      {
        name: "thumbnail",
        maxCount: 1
      }
    ]),
    publishAVideo
  );

router.route("/").get(getAllVideos);

router.route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo)

router.route("/toggle-publish/:videoId").patch(togglePublishStatus);



export default router                        
