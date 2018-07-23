const { User } = require('../../../lib/db');

function handleSort(sortBy) {
    switch (sortBy) {
        case 'date':
            sortBy = { createdAt: -1 };
            break;
        case 'name':
            sortBy = {
                firstName: 1,
                lastName: 1,
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

function handleGetUsers(req, res, next) {
    const {
        page = 1,
            pageSize = 20,
    } = req.query;
    let { sortBy = 'date' } = req.query;

    sortBy = handleSort(sortBy);

    const getUsers = User.aggregate([{
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: 'referrer',
                as: 'referrals',
            },
        },
        {
            $lookup: {
                from: 'transactions',
                localField: '_id',
                foreignField: 'user',
                as: 'transactions',
            },
        },
        { $skip: Number((page - 1) * pageSize) },
        { $limit: Number(pageSize) },
        { $sort: sortBy },
        {
            $addFields: {
                referrals: { $size: '$referrals' },
                transactions: { $size: '$transactions' },
            },
        },
    ]);

    // const getUsers = User.find({ /* role: 'user' */ })
    //     .limit(Number(pageSize))
    //     .skip(Number((page - 1) * pageSize))
    //     .sort(sortBy)
    //     .exec();

    const getUserCount = User.count({ role: 'user' });

    Promise.all([getUsers, getUserCount])
        .then(([users, total]) => res._success({
            items: users,
            total,
        }), err => next(err));
}

function handleGetUser(req, res, next) {
    const { user } = req._params;
    User.count({
            referrer: user._id,
        }).then((count) => {
            const payload = user.toObject();
            payload.refCount = count;
            res._success(payload);
        })
        .catch(next);
}

module.exports = {
    handleGetUsers,
    handleGetUser,
};
