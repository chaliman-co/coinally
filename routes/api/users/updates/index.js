const
    router = new require("express").Router();
serverUtils = require("../../../../lib/utils"),
    path = require("path"),
    {
        User
    } = require(path.join(serverUtils.getRootDirectory() + "/lib/db"));

module.exports = router;

router
    .patch("/", handlePatchUpdate)
;

function handlePatchUpdate(req, res, next) {
    const
        { code } = req.body;
}