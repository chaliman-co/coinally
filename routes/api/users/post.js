const
    router = require("express").Router(),
    path = require("path"),
    serverUtils = require("../../../lib/utils"),
    { User } = require(path.join(serverUtils.getRootDirectory(), "lib/db")),
    multer = require("multer"),
    imageStoragePath = path.join(serverUtils.getPublicDirectory(), "images/profile_pictures"),
    verificationDetailsStoragePath = path.join(serverUtils.getPublicDirectory(), "images/verification_details")
;

module.exports = {
    handlePostUser
}

function handlePostUser(req, res, next) {
    let
        rawInput = req.body,
        userDetails = new User.Fields()
        ;
    try {
        serverUtils.deepAssign(userDetails, rawInput);
    } catch (err) {
        let unknownField = err.message.match(/property (.+),/)[1];
        return res._sendError("unknown parameters", new serverUtils.ErrorReport(400, { [unknownField]: `${unknownField} not recognized` }))
    } console.log(req.body)
    if (req.files) {
        for (file of req.files) {
            let match
            if (file.fieldname === "image") userDetails.imagePath = path.join("/images/profile_pictures", file.filename);
            else if (match = file.fieldname.match(/verificationDetails\[(\d+)\]\[value\]/)) {
                let index = match[1];
                if (!userDetails.verificationDetails) userDetails.verificationDetails = [];
                let verificationDetails = userDetails.verificationDetails;
                if (!verificationDetails[index]) verificationDetails[index] = {};
                userDetails.verificationDetails[index].value = path.join("/images/verification_details", file.filename);
            }
        }
    }
    user = new User(userDetails);
    user.save().then(function savedUser(user) {
        res.redirect("/auth/new")
    }, function failedToSave(err) {
        return next(err)
    })
}