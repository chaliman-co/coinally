const
    multer = require('multer');
const router = require('express').Router({
    mergeParams: true,
});
const path = require('path');
const serverUtils = require('../../../lib/utils');

const { User } = require('../../../lib/db');
const auth = require('../../../lib/auth');
const {
    handleGetUsers,
} = require('./get');
const {
    handleGetUser,
} = require('./get');
const {
    handlePostUser,
} = require('./post');
const {
    handlePatchUser,
} = require('./patch');
const assetAccountsRoute = require('./assetAccounts');
const verificationDetailsRoute = require('./verificationDetails');

const statusRoute = require('./status');

const imageStoragePath = path.join(serverUtils.getPublicDirectory(), 'images/profile_pictures');

function resolveUser(req, res, next, _id) {
    req._params = req._params || {};
    if (req.user._id === _id) {
        req._params.user = req.user;
        next();
    } else { // In case it's the admin or another user
        User.findOne({ _id })
            .populate('assetAccounts.asset', 'addressType')
            .then((user) => {
                if (!user) {
                    const error = new serverUtils.ErrorReport(404, {
                        _id: 'user not found',
                    });
                    res._sendError('item not found', error);
                } else {
                    req._params.user = user;
                    next();
                }
            }).catch(err => next(err));
    }
}

router
    .post('/', multer({
        dest: imageStoragePath,
    }).single('image'), handlePostUser)
    .use(auth.bounceUnauthenticated)
    .get('/', auth.bounceUnauthorised({
        admin: true,
    }), handleGetUsers)

.param('_id', resolveUser)

.get('/:_id', auth.bounceUnauthorised({
        owner: true,
        admin: true,
    }), handleGetUser) // admin and owner can access this route
    .patch('/:_id/', auth.bounceUnauthorised({
        owner: true,
    }), multer({ dest: imageStoragePath }).single('image'), handlePatchUser)
    .use('/:_id/asset_accounts', assetAccountsRoute)
    .use('/:_id/verification_details', verificationDetailsRoute)
    .use('/:_id/status', statusRoute);

module.exports = router;
