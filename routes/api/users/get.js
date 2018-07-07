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
    let {
        page = 1,
            pageSize = 20,
            sortBy = 'date'
    } = req.query;

    sortBy = handleSort(sortBy);

    const getUsers = User.find({ role: 'user' })
        .limit(Number(pageSize))
        .skip(Number((page - 1) * pageSize))
        .sort(sortBy)
        .exec();

    const getUserCount = User.count({ role: 'user' });

    Promise.all([getUsers, getUserCount])
        .then(([users, total]) => {
            return res._success({
                items: users,
                total
            });
        }, err => next(err));
}

function handleSort(sortBy) {
    switch (sortBy) {
        case 'date':
            sortBy = { createdAt: -1 };
            break;
        case 'name':
            sortBy = {
                firstName: 1,
                lastName: 1
            };
            break;
        case 'email':
            sortBy = { emailAddress: 1 };
            break;
        case 'status':
            sortBy = { status: 1 };
            break;
        default:
            sortBy = {};
    }
    return sortBy;
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