const
    path = require('path'),
    serverUtils = require('../../../lib/utils'),
    {
        User,
    } = require(path.join(serverUtils.getRootDirectory(), 'lib/db'))
;

module.exports = {
    handlePatchUser,
};

function handlePatchUser(req, res, next) {
    console.log('in patch. req.body:', req.body);
    let
        rawInput = req.body,
        {
            user,
        } = req._params,
        newUserDetails = new User.Fields(),
        newUpdate;
    try {
        serverUtils.deepAssign(newUserDetails, rawInput);
    } catch (err) {
        const unknownField = err.message.match(/property (.+),/)[1];
        return res._sendError('unknown parameters', new serverUtils.ErrorReport(400, {
            [unknownField]: `${unknownField} not recognized`,
        }));
    }
    if (req.file) newUserDetails.imagePath = path.join('/images/profile_pictures', req.file.filename);
    const newEmailAddress = newUserDetails.emailAddress;
    newUserDetails.emailAddress = undefined; // Don't overwrite main emailAddress
    serverUtils.removeFrom(newUserDetails, undefined); // Don't overwrite unchanged fields
    serverUtils.deepAssign(user, newUserDetails);
    console.log({ user, newUserDetails });
    if (newEmailAddress) {
        newUpdate = {
            field: 'emailAddress',
            value: newEmailAddress,
            code: serverUtils.genVerificationCode(),
        };
        user.updates.push(newUpdate);
        validationError = user.validateSync();
        if (validationError) return next(validationError); // make sure we can perform update
        return serverUtils.sendConfirmationLink(user, newUpdate, (err) => {
            if (err) return res._sendError(new serverUtils.ServerError(err));
            user.save().then(
                user => res._success(user),
                err => next(err));
        });
    }
    user.save().then(user =>
        res._success(user)).catch(err =>
            next(err));
}
