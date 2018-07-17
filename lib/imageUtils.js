const Storage = require('@google-cloud/storage');
const CLOUD_BUCKET = process.env.BUCKET_NAME;

const storage = Storage({
    projectId: process.env.GOOGLE_APP_ID,
    keyFilename: 'coinaly.json',
});
const bucket = storage.bucket(CLOUD_BUCKET);


const Multer = require('multer');
const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 1 * 1024 * 1024 // no larger than 1mb
    }
});

async function sendUploadToGCS(req, res, next) {
    if (!req.files.length) {
        return next();
    }

    const files = [];

    for (let i = 0; i < req.files.length; i++) {
        let inputFile = req.files[i];

        try {
            const fileUrl = await uploadFile(inputFile);
            files.push({ url: fileUrl });
        } catch (err) {
            files.push({ error: err.message });
        }
    }

    req.files = files;

    next();
}

function uploadFile(inputFile) {
    return new Promise((resolve, reject) => {
        const gcsname = Date.now() + inputFile.originalname;
        const file = bucket.file(gcsname);
        const stream = file.createWriteStream({
            metadata: {
                contentType: inputFile.mimetype
            },
            public: true,
            resumable: false
        });

        stream.on('error', (err) => {
            reject(err);
        });

        stream.on('finish', () => {
            resolve(getPublicUrl(gcsname));
        });

        stream.end(inputFile.buffer);
    })

}

function getPublicUrl(filename) {
    return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}

module.exports = {
    sendUploadToGCS,
    multer
}