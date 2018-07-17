const multer = require('multer');
const router = require('express').Router({ mergeParams: true });
const path = require('path');
const serverUtils = require('../../../../lib/utils');
const auth = require('./../../../../lib/auth');
const emailer = require('./../../../../lib/emailer');
const { User, Approval } = require('../../../../lib/db');

const verificationDetailsStoragePath = path.join(serverUtils.getPublicDirectory(), 'images/verification_details');


function resolveIndex(req, res, next, index) {
    const { user } = req._params;
    const verificationDetail = user.verificationDetails[index];
    if (!verificationDetail) {
        const error = new serverUtils.ErrorReport(404, { index: 'index not found' });
        res._sendError('item not found', error);
    } else {
        req._params.verificationDetail = verificationDetail;
        next();
    }
}

function handlePostVerificationDetail(req, res, next) {
    const { user } = req._params;
    const rawInput = req.body;
    const details = new User.verificationDetails.Fields();
    try {
        serverUtils.deepAssign(details, rawInput);
    } catch (err) {
        const unknownField = err.message.match(/property (.+),/)[1];
        const error = serverUtils.ErrorReport(400, { unknownField: `${unknownField} not recognized` });
        return res._sendError('unknown field', error);
    }
    if (req.file) {
        details.imagePath = path.join('images/verification_details', req.file.filename);
    }

    const verificationDetailIndex = user.verificationDetails.push(details) - 1;
    user
        .save()
        .then(() => {
            const approvalDetails = new Approval.Fields();
            serverUtils.deepAssign(approvalDetails, {
                user: user._id.toString(),
                userProperty: `verificationDetails[${verificationDetailIndex}]`,
            });
            const approval = new Approval(approvalDetails);
            return approval.save();
        })
        .then(() => {
            res._success(user.verificationDetails[verificationDetailIndex]);
            emailer.sendOnVerificationDetail(user);
        })
        .catch(err => next(err));
}

function handlePutVerificationDetailIsApproved(req, res, next) {
    const { isApproved } = req.body;
    const { index } = req.params;
    const { user, verificationDetail } = req._params;

    if (isApproved == null) {
        const error = new serverUtils.ErrorReport(400, {
            isApproved: 'isApproved not provided',
        });
        res._sendError('missing or invalid parameters', error);
    }


    verificationDetail.isApproved = isApproved;
    user.save()
        .then(() => Approval
            .findOneAndUpdate({
                userId: user._id,
                userProperty: `verificationDetails[${index}]`,
            }, {
                status: isApproved ? 'granted' : 'denied',
            }))
        .then(() => res._success(verificationDetail.isApproved))
        .catch(err => next(err));
}

function handleDeleteVerificationDetail(req, res, next) {
    const { verificationDetail, user } = req._params;
    const index = Number(req.params.index);

    user.verificationDetails.splice(index, 1, null);
    user.save().then(() => {
        if (!verificationDetail.isApproved) {
            return Approval
                .findOneAndUpdate({
                    user: user._id,
                    userProperty: `verificationDetails[${index}]`,
                }, { status: 'aborted' })
                .then(() =>
                    res._success(verificationDetail), err => next(err));
            // console.log('rem: ', approval, '\n user verifi ', user.verificationDetails[index]);
        }
        return res._success(verificationDetail);
    }, err => next(err));
}

router
    .post('/', auth.bounceUnauthorised({ owner: true }), multer({ dest: verificationDetailsStoragePath })
        .single('image'), handlePostVerificationDetail)
    .param('index', resolveIndex)
    .post('/:index/is_approved', auth.bounceUnauthorised({ admin: true }), handlePutVerificationDetailIsApproved)
    .delete('/:index', auth.bounceUnauthorised({ owner: true }), handleDeleteVerificationDetail);

module.exports = router;