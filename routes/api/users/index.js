const
    multer = require('multer'),
    router = require('express').Router({
        mergeParams: true,
    }),
    path = require('path'),
    serverUtils = require('../../../lib/utils'),
    {
        User,
    } = require(path.join(serverUtils.getRootDirectory(), 'lib/db')),
    auth = require(path.join(serverUtils.getRootDirectory(), 'lib/auth')),
    {
        handleGetUsers,
    } = require('./get'),
    {
        handleGetUser,
    } = require('./get'),
    {
        handlePostUser,
    } = require('./post'),
    {
        handlePatchUser,
    } = require('./patch'),
    assetAccountsRoute = require('./assetAccounts'),
    verificationDetailsRoute = require('./verificationDetails'),
    statusRoute = require('./status'),
    imageStoragePath = path.join(serverUtils.getPublicDirectory(), 'images/profile_pictures');

module.exports = router;

router
    .post('/', multer({
        dest: imageStoragePath,
    }).single('image'), handlePostUser)
    .use(auth.bounceUnauthenticated)
    .get('/', auth.bounceNonAdmin, handleGetUsers)

    .param('_id', resolveUser)

    .get('/:_id', auth.bounceUnauthorised({
        owner: true,
        admin: true,
    }), handleGetUser) // admin and owner can access this route
    .patch('/:id/', auth.bounceUnauthorised({ owner: true, }), handlePatchUser)
    .use('/:_id/asset_accounts', assetAccountsRoute)
    .use('/:_id/verification_details', verificationDetailsRoute)
    .use('/:_id/status', statusRoute);

function resolveUser(req, res, next, _id) {
    req._params = req._params || {};
    if (req.user._id == _id) {
        req._params.user = req.user;
        return next();
    } // In case it's the admin or another user
        User.findOne({
            _id,
        }).populate('assetAccounts.asset', 'addressType').then((user) => {
            if (!user) {return res._sendError("item not found", new serverUtils.ErrorReport(404, {
                _id: "user not found"
            }));}
            req._params.user = user;
            return next();
        }).catch(err => next(err));
}
