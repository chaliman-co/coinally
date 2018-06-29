const router = require('express').Router();
const path = require('path');
const serverUtils = require('../../../lib/utils');

const { User } = require(path.join(serverUtils.getRootDirectory(), 'lib/db'));

async function handlePostUser(req, res, next) {
    const rawInput = req.body;
    const userDetails = new User.Fields();

    const referrerId = req.body.referrer;

    if (referrerId) {
        const user = await User.findById(referrerId);
        if (!user) {
            return res._sendError('Referrer does not exist',
                new serverUtils.ErrorReport(400, {
                    referrer: 'This referrer does not exist',
                }))
        }
        rawInput.referrer = user._id;
        rawInput.refCode = generateRefCode(`${userDetails.firstName} ${userDetails.lastName}`);
    }

    try {
        serverUtils.deepAssign(userDetails, rawInput);
    } catch (err) {
        const unknownField = err.message.match(/property (.+),/)[1];
        return res._sendError('unknown parameters',
            new serverUtils.ErrorReport(400, {
                [unknownField]: `${unknownField} not recognized`,
            }),
        );
    }
    if (req.files) {
        for (file of req.files) {
            let match;
            if (file.fieldname === 'image') userDetails.imagePath = path.join('/images/profile_pictures', file.filename);
            else if (match = file.fieldname.match(/verificationDetails\[(\d+)\]\[value\]/)) {
                const index = match[1];
                if (!userDetails.verificationDetails) userDetails.verificationDetails = [];
                const verificationDetails = userDetails.verificationDetails;
                if (!verificationDetails[index]) verificationDetails[index] = {};
                userDetails.verificationDetails[index].value = path.join('/images/verification_details', file.filename);
            }
        }
    }
    const user = new User(userDetails);

    try {
        await user.save();
        return res.redirect('/auth/new');
    } catch (err) {
        return next(err);
    }
}

async function generateRefCode(name) {
    if (!name)
        return null;

    let names = name.split(' ');
    let digits = Math.floor(100000 + Math.random() * 900000)
        .toString().split('');

    let codeArray = [];

    codeArray.push(...names.map(n => getLast(n)));
    codeArray.push(...digits);

    codeArray = shuffle(codeArray);

    const refCode = codeArray.join('');

    const user = await User.find({ refCode });

    if (user) {
        return generateRefCode(name);
    } else {
        return refCode;
    }
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function getLast(word) {
    if (word) {
        return word.toLowerCase().charAt(word.lenght - 1);
    } else {
        return '';
    }
}

module.exports = {
    handlePostUser,
};