const path = require('path');
const serverUtils = require('../../../lib/utils');

const {
    User,
} = require(path.join(serverUtils.getRootDirectory(), 'lib/db'));

module.exports = {
    handleGetUsers,
    handleGetUser,
};

function handleGetUsers(req, res, next) {
    const {
        skip = 0, limit = 20,
    } = req.query;
    User.find({}).limit(limit).skip(skip).exec()
        .then((users) => {
            if (!users.length) {
                return res._sendError('No matching documents', new serverUtils.ErrorReport(404, {
                    users: 'no users found found',
                }));
            }
            return res._success(users);
        }, err => next(err));
}

function handleGetUser(req, res, next) {
    const {
        user,
    } = req._params;
    User.count({
        referrer: user._id,
    }).then((count) => {
        const payload = user.toObject();
        payload.refCount = count;
        res._success(payload);
    });
}
