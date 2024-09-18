import { Router } from "express";
import { 
  getAllVideos,
  publishAVideo,

 } from "../controllers/video.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { upload } from "../middleware/multer.middleware";

const router  = Router();
router.use(verifyJWT); //Applied verifyJWT middlewares to all routers


router.route.post(
    upload.fields([
      {
        name:"videoFile",
        maxCount:1
      },
      {
        name:"thumbnail",
        maxCount:1 
      }
    ]),
    publishAVideo
);