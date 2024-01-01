const notFound = (req,res,next) => {
    const err = new Error(`Not found - ${req.originalUrl}`)
    res.status(404)
    next(err)
}

const errorHandler = (error,req,res,next) => {
    if(req.headerSent){
        return next(error)
    }
    res.status(500 || error.code).json({message: error.message || "An unknown error occured"})
}

module.exports = { notFound,errorHandler }