const express = require("express")
const router = express.Router()
const {register,login,getAuthors,getUser,changeAvatar,editUser} = require("../controllers/userController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/register",register)
router.post("/login",login)
router.get("/",getAuthors)
router.get("/:id",getUser)
router.post("/change-avatar",authMiddleware,changeAvatar)
router.patch("/edit-user",authMiddleware,editUser)

module.exports = router