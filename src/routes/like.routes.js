import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
  toggleTweetLike,
  toggleVideoLike,
  toggleCommentLike,
  getLikedVideos
 } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route('/c/:commentId').post(toggleCommentLike);
router.route('/t/:tweetId').post(toggleTweetLike);
router.route('/v/:videoId').post(toggleVideoLike);
router.route('/').get(getLikedVideos);

export default router