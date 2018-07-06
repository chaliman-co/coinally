const
    multer = require('multer');
const router = require('express').Router({
    mergeParams: true,
});
const path = require('path');
const serverUtils = require('../../../lib/utils');
const {
    User,
} = require(path.join(serverUtils.getRootDirectory(), 'lib/db'));
const auth = require(path.join(serverUtils.getRootDirectory(), 'lib/auth'));
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

module.exports = router;

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
    }), handlePatchUser)
    .use('/:_id/asset_accounts', assetAccountsRoute)
    .use('/:_id/verification_details', verificationDetailsRoute)
    .use('/:_id/status', statusRoute);

function resolveUser(req, res, next, _id) {
    console.log(req._params);
    req._params = req._params || {};
    if (req.user._id == _id) {
        req._params.user = req.user;
        return next();
    } // In case it's the admin or another user
    User.findOne({
        _id,
    }).populate('assetAccounts.asset', 'addressType').then((user) => {
        if (!user) {
            return res._sendError('item not found', new serverUtils.ErrorReport(404, {
                _id: 'user not found',
            }));
        }
        req._params.user = user;
        return next();
    }).catch(err => next(err));
}