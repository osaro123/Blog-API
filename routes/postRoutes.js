const express = require("express")
const { createPost, getPosts, getPost, getCatPost, getUserPost, editPost, deletePost } = require("../controllers/postcontroller")
const authMiddleware = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/",authMiddleware,createPost)
router.get("/",getPosts)
router.get("/:id",getPost)
router.get("/categories/:category",getCatPost)
router.get("/users/:id",getUserPost)
router.patch("/:id",authMiddleware,editPost)
router.delete("/:id",authMiddleware,deletePost)

module.exports = router