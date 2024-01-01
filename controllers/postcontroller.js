const HttpError = require("../models/errorModel")
const {v4: uuid} = require("uuid")
const path = require("path")
const fs = require("fs")
const Post = require("../models/postModel")
const User = require("../models/userModel")

const createPost = async (req,res,next) => {
    try {
        let {title,category,description} = req.body
        if(!title || !category || !description || !req.files){
            return next(new HttpError("fill all fields",422))
        }

        const {thumbnail} = req.files

        if(thumbnail.size > 2000000){
            return next(new HttpError("thumbnail size is too big",422))
        }
        let fileName;
        fileName = thumbnail.name
        const splittedFilename = fileName.split(".")
        const newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
        thumbnail.mv(path.join(__dirname,"..","/uploads",newFilename), async (err) => {
            if(err){
                return next(new HttpError(err))
            }else{
                const newPost = await Post.create({title,description,category,thumbnail: newFilename,creator: req.user.id})
                if(!newPost){
                    return next(new HttpError("unable to create post"))
                }
                const currentUser = await User.findById(req.user.id)
                const postCount = currentUser.posts + 1
                await User.findByIdAndUpdate(req.user.id,{posts: postCount})
                res.status(201).json(newPost)
            }
        })
    } catch (error) {
        return next(new HttpError(error))
    }
}

const getPosts = async(req,res,next) => {
    try {
        const post = await Post.find().sort({updatedAt: -1})
        if(!post){
            return next(new HttpError("cannot get post",422))
        }
        res.status(200).json(post)      
    } catch (error) {
        return next(new HttpError(error))
    }
}

const getPost = async (req,res,next) => {
    try {
        const post = await Post.find().sort({updatedAt: -1})
        if(!post){
            return next(new HttpError("cannot get user post"))
        }
        res.status(200).json(post)
    } catch (error) {
        return next(new HttpError(error))
    }
}

const getCatPost = async (req,res,next) => {
    try {
        const {category} = req.params
        const post = await Post.find({category}).sort({createdAt: -1})
        if(!post){
            return next(new HttpError("cannot get post",422))
        }
        res.status(200).json(post)
    } catch (error) {
        return next(new HttpError(error))
    }
}

const getUserPost = async (req,res,next) => {
    try {
        const {id} = req.params
        const post = await Post.find({creator: id}).sort({createdAt: -1})
        if(!post){
            return next(new HttpError("cannot get post",422))
        }
        res.status(200).json(post)
    } catch (error) {
        return next(new HttpError(error))
    }
}

const editPost = async (req,res,next) => {
    try {
        const postId = req.params.id
        let updatedPost;
        const {title,category,description} = req.body
        if(!title || !category || description.length < 12){
            return next(new HttpError("fill all fields",422))
        }
        
        if(!req.files){
            updatedPost = await Post.findByIdAndUpdate(postId,{title,category,description},{new: true})
        }else{
            const oldPost = await Post.findById(postId)

            fs.unlink(path.join(__dirname,"..","/uploads",oldPost.thumbnail),(err) => {
                if(err){
                    return next(new HttpError(err))
                }
            })
            const {thumbnail} = req.files;
        
                if(thumbnail.size > 2000000){
                    return next(new HttpError("thumbnail size is too big"))
                }

                let fileName;
                fileName = thumbnail.name
                const splittedFilename = fileName.split(".")
                const newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
                thumbnail.mv(path.join(__dirname,"..","/uploads",newFilename), async (err) => {
                    if(err){
                        return next(new HttpError(err))
                    }
                })
                updatedPost = await Post.findByIdAndUpdate(postId,{title,category,description,thumbnail: newFilename},{new: true})
        }
        if(!updatedPost){
            return next(new HttpError("cannot edit post",422))
        }
        res.status(200).json(updatedPost)
    } catch (error) {
        return next(new HttpError(error))
    }
}

const deletePost = async (req,res,next) => {
    try {
        const postId = req.param.id
        if(!postId){
            return next(new HttpError("Post unavailable"))
        }
        const post = await Post.findById(postId)
        const fileName = post?.thumbnail
        fs.unlink(path.join(__dirname,"..","/uploads",fileName),async (err) => {
            if(err){
                return next(new HttpError(err))
            }else{
                await Post.findByIdAndDelete(postId)
                const currentUser = await User.findById(req.user.id)
                const postCount = currentUser.posts - 1
                await User.findByIdAndUpdate(req.user.id,{posts: postCount})
                res.status(202).json(`Post ${postId} has been deleted successfully`)
            }
        })
    } catch (error) {
        return next(new HttpError(error))
    }
}

module.exports = {
    createPost,
    getPosts,
    getPost,
    getCatPost,
    getUserPost,
    editPost,
    deletePost
}