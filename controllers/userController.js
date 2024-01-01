const HttpError = require("../models/errorModel")
const bcrypt = require("bcryptjs")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const fs = require("fs")
const path = require("path")
const {v4: uuid} = require("uuid")

const register = async (req,res,next) => {
    try {
        const {name,email,password,password2} = req.body
        const emailExists = await User.findOne({email})
        if(!name || !email || !password ){
            return next(new HttpError("fill all fields",422))
        }
        if(emailExists){
            return next(new HttpError("email already exists",422))
        }
        const newEmail = email.toLowerCase()
        if((password.trim()).length < 6){
            return next(new HttpError("password is too short",422))
        }
        if(password != password2){
            return next(new HttpError("password don't match",422))
        }
        const salt = await bcrypt.genSalt()
        const hashedPwd = await bcrypt.hash(password,salt)
        const user = await User.create({name,email: newEmail,password: hashedPwd})
        if(!user){
            return next(new HttpError("unable to create user"))
        }
        res.status(201).json(user)
    } catch (error) {
        return next(new HttpError(error))
    }
}

const login = async (req,res,next) => {
    try {
        const {email,password} = req.body
        if(!email || !password){
            return next(new HttpError("fill all fields"))
        }
        const newEmail = email.toLowerCase()
        const user = await User.findOne({email: newEmail})
        if(!user){
            return next(new HttpError("could not find a user with this credentials"))
        }
        const comparePwd = await bcrypt.compare(password,user.password)
        if(!comparePwd){
            return next(new HttpError("wrong password"))
        }
        const {_id: id,name} = user
        const token = jwt.sign({name,id},process.env.JWT_SECRET_KEY,{expiresIn: "1d"})
        res.status(200).json({token})
    } catch (error) {
        return next(new HttpError(error))
    }
}

const getAuthors = async (req,res,next) => {
    try {
        const user = await User.find().select("-password")
        if(!user){
            return next(new HttpError("Cannot find users",422))
        }
        res.status(200).json(user)
    } catch (error) {
        return next(new HttpError(error))
    }
}

const getUser = async (req,res,next) => {
    try {
        const {id} = req.params
        const user = await User.findById(id).select("-password")
        if(!user){
            return next(new HttpError("Cannot find user",422))
        }
        res.status(200).json(user)
    } catch (error) {
        return next(new HttpError(error))
    }
}

const changeAvatar = async (req,res,next) => {
    try {
        if(!req.files.avatar){
            return next(new HttpError("Choose an image",422))
        }
        const user = await User.findById(req.user.id)
        if(user.avatar){
            fs.unlink(path.join(__dirname,"..","/uploads",user.avatar),(err) => {
                if(err){
                    return next(new HttpError(err))
                }
            })
        }
        const {avatar} = req.files

        if(avatar.size > 500000){
            return next(new HttpError("File size is too big",422))
        }

        let fileName;
        fileName = avatar.name
        const splittedFilename = fileName.split(".")
        const newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
        avatar.mv(path.join(__dirname,"..","/uploads",newFilename), (err) => {
            if(err){
                return next(new HttpError(err))
            }
        })
        const updatedAvatar = await User.findByIdAndUpdate(req.user.id,{avatar: newFilename},{new: true})
        if(!updatedAvatar){
            return next(new HttpError("cannot update avatar",422))
        }
        res.status(200).json(updatedAvatar)
    } catch (error) {
        return next(new HttpError(error))
    }
}

const editUser = async (req,res,next) => {
    try {
        const {name,email,currentPassword,newPassword,confirmNewPassword} = req.body
        if(!name || !email || !currentPassword || !newPassword){
            return next(new HttpError("fill all fields",422))
        }
        const newEmail = email.toLowerCase()
        const emailExist = await User.findOne({email: newEmail})
        if(emailExist && (emailExist._id !== req.user.id)){
            return next(new HttpError("Cannot edit user",422))
        }
        const user = await User.findById(req.user.id)
        const validatePassword = await bcrypt.compare(currentPassword,user.password)
        if(!validatePassword){
            return next(new HttpError("wrong password",422))
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPwd = await bcrypt.hash(newPassword,salt)

        const newInfo = await User.findByIdAndUpdate(req.user.id,{name,email: newEmail,password: hashedPwd},{new: true})
        if(!newInfo){
            return next(new HttpError("user update failed",422))
        }
        res.status(200).json(newInfo)
        
    } catch (error) {
        return next(new HttpError(error))
    }
}



module.exports = {
    register,
    login,
    getAuthors,
    getUser,
    changeAvatar,
    editUser
}