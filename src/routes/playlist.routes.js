import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
  createPlaylist, 
  getUserPlaylist,
  getPlaylistById,
  updatePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller.js";


const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist);

router
.route("/:playlistId")
.get(getPlaylistById)
.patch(updatePlaylist)
.delete(deletePlaylist)

router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);
router.route("/user/:userId").get(getUserPlaylist);

export default router