const
    multer = require("multer"),
    router = require("express").Router({ mergeParams: true }),
    path = require("path"),
    serverUtils = require("../../../../lib/utils"),
    db = require(path.join(serverUtils.getRootDirectory(), "lib/db")),
    imageStoragePath = path.join(serverUtils.getPublicDirectory(), "images/profile_pictures")
;

module.exports = router;

router
    .post("/", multer({ dest: imageStoragePath }).single("image"), handlePostImage)
;

function handlePostImage(req, res, next) {
    if (!req.file) return res._sendError("missing or invalid parameters", {image: "image not provided"})
    const
        { filename } = req.file,
        user = req._params.user,
        imagePath = path.posix.join("/images/profile_pictures", filename)
        ; 
    user.imagePath = imagePath; console.log("egheeee")
    user.save().then(function updatedUser(user) {
        console.log({ filename, user })
        return res._success(imagePath)
    }, function failedToUpdate(err) {
        console.log("errerrrrrrr")
        return next(err)
    })
}