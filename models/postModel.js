const {model,Schema} = require("mongoose")

const postSchema = new Schema({
    title:{type: String, required: true},
    category:{type: String, enum: ["Technology","Art","Agriculture","Business","Education","Entertainment","Investment","Uncategorized","Weather"]},
    description:{type: String, required: true},
    creator:{type: Schema.Types.ObjectId, ref: "User"},
    thumbnail:{type: String, required: true}
},{timestamps: true})

module.exports = model("Post",postSchema)