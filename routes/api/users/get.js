const
    router = require("express").Router(),
    path = require("path"),
    serverUtils = require("../../../lib/utils"),
    { User } = require(path.join(serverUtils.getRootDirectory(), "lib/db"))
;

module.exports = {
    handleGetUsers,
    handleGetUser
}

function handleGetUsers(req, res, next) {
    const { skip = 0, limit = 20 } = req.query;
    User.find({}).limit(limit).skip(skip).exec().then( function foundUsers(users) {
        if (!users.length) return res._sendError("No matching documents", new serverUtils.ErrorReport(404, { users: "no users found found" }));
        return res._success(users)
    }, function failedToFind(err) {
        return next(err)
    })
}

function handleGetUser(req, res, next) {
    const { user } = req._params;
    return res._success(user)
}