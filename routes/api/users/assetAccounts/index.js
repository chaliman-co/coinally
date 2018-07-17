const router = require('express').Router({
    mergeParams: true,
});
const serverUtils = require('../../../../lib/utils');

const auth = require('../../../../lib/auth');
const { Approval, User } = require('../../../../lib/db');
const emailer = require('../../../../lib/emailer');

function resolveIndex(req, res, next, index) {
    const { user } = req._params;
    const assetAccount = user.assetAccounts[index];

    if (!assetAccount) {
        const error = serverUtils.ErrorReport(404, {
            index: 'index not found',
        });
        res._sendError('item not found', error);
    } else {
        req._params.assetAccount = assetAccount;
        next();
    }
}

function handlePostAssetAccount(req, res, next) {
    const rawInput = req.body;
    const details = new User.assetAccounts.Fields();
    const { user } = req._params;

    try {
        serverUtils.deepAssign(details, rawInput);
        const assetAccountIndex = user.assetAccounts.push(details) - 1;
        user.save()
            .then(() => {
                const approvalDetails = new Approval.Fields();
                Object.assign(approvalDetails, {
                    user: user._id,
                    userProperty: `assetAccounts[${assetAccountIndex}]`,
                });
                const approval = new Approval(approvalDetails);
                return approval.save();
            }).then(() => {
                res._success(user.assetAccounts[assetAccountIndex]);
                emailer.sendOnNewAccount(user);
            })
            .catch((err) => {
                next(err);
            });
    } catch (err) {
        const unknownField = err.message.match(/property (.+),/)[1];
        res._sendError('unknown field', new serverUtils.ErrorReport(400, {
            [unknownField]: `${unknownField} not recognized`,
        }));
    }
}

function handlePutAssetAccountIsVerified(req, res, next) {
    const { isVerified } = req.body;
    const { index } = req.params;
    const { user, assetAccount } = req._params;

    if (isVerified != null) {
        res._sendError('missing or invalid parameters', {
            isVerified: 'isVerified not provided',
        });
    } else {
        assetAccount.isVerified = isVerified;
        user.save()
            .then(() => Approval.findOneAndUpdate({
                    userId: user._id,
                    userProperty: `AssetAccounts[${index}]`,
                }, {
                    status: isVerified ? 'granted' : 'denied',
                })
                .exec())
            .then(() => {
                res._success(assetAccount.isVerified);
            })
            .catch(err => next(err));
    }
}

function handleDeleteAssetAccount(req, res, next) {
    const { index } = req.params;
    const { user } = req._params;
    const { assetAccount } = req._params;

    user.assetAccounts.splice(index, 1, null);
    user.save()
        .then(() => {
            if (!assetAccount.isVerified) {
                Approval.findOneAndUpdate({
                        userId: user._id,
                        userProperty: `AssetAccounts[${index}]`,
                    }, {
                        status: 'aborted',
                    })
                    .then(() => {
                        res._success(assetAccount);
                    });
            } else {
                res._success(assetAccount);
            }
        })
        .catch(next);
}

router
    .post('/', auth.bounceUnauthorised({ owner: true }), handlePostAssetAccount)
    .param('index', resolveIndex)
    .delete('/:index', auth.bounceUnauthorised({ owner: true }), handleDeleteAssetAccount)
    .post('/:index/is_Verified', auth.bounceUnauthorised({ admin: true }), handlePutAssetAccountIsVerified);

module.exports = router;
