const router = require('express').Router();
const imageUtils = require('../../lib/imageUtils');

router
    .post(
        '',
        imageUtils.multer.array('files'),
        imageUtils.sendUploadToGCS,
        (req, res) => {
            res._success(req.files);
        },
    );

module.exports = router;