import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers
} from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);


router.route("/").post(toggleSubscription);
router.route("/:subscriberId").get(getUserChannelSubscribers);
router.route("/:channelId").get(getSubscribedChannels);
