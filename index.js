const express = require("express")
const app = express()
require("dotenv").config()
const {connect} = require("mongoose")
const {notFound,errorHandler} = require("./middleware/errorMiddleware")
const upload = require("express-fileupload")

const userRoutes = require("./routes/userRoutes")
const postRoutes = require("./routes/postRoutes")

app.use(express.json())
app.use(upload())
app.use("/uploads",express.static(__dirname + "/uploads"))

app.use("/api/users/",userRoutes)
app.use("/api/posts/",postRoutes)

app.use(notFound)
app.use(errorHandler)

connect(process.env.MONGO_URI)
.then(app.listen(3000,() => console.log(`listening on port ${process.env.PORT}`)))
.catch((err) => console.log(err))