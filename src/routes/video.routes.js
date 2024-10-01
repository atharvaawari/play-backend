import { Router } from "express";
import {
  getAllVideos,
  getVideoById,
  publishAVideo,
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

router.route("/:videoId").get(getVideoById)
                         .patch(upload.single("thumbnail"), updateVideo)




export default router                        
