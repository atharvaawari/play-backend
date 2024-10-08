import { Router } from "express";
import { 
  createTweet, 
  deleteTweet, 
  getUserTweet, 
  updateTweet 
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);  //Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweet);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);



export default router