const io = require('socket.io')({
    origins: '*:*',
});
const db = require('./lib/db');

let Asset,
    Transaction;

process.nextTick(() => {
    ({
        Transaction,
        Asset,
    } = db);
});

module.exports = io;
io.of('/transaction')
    .on('connection', (client) => {
        console.log('transaction client seen');

        client.emit('seen', 'smiles..');

        const transactionId = client.handshake.query.transaction_id;

        if (!transactionId) {
            client.emit('exception', {
                transactionId: 'transaction id not provided',
            });
            return client.disconnect(true);
        }

        Transaction.findById(transactionId)
            .then((transaction) => {
                if (!transaction) {
                    client.emit('exception', {
                        transactionId: 'transaction id not found',
                    });
                    return client.disconnect(true);
                }
                client.emit('status', transaction.status);
                client.join(transactionId);
            })
            .catch((err) => {
                if (err.name === 'CastError') {
                    client.emit('exception', {
                        transactionId: 'transaction id not found',
                    });
                } else {
                    client.emit('exception', {
                        server: 'internal server error',
                    });
                }
                return client.disconnect(true);
            });
    });

io.of('/rates')
    .on('connection', (client) => {
        console.log('conversion client received');
        client.emit('seen', 'smiles..');
        const { to, from } = client.handshake.query;
        const assetCodes = { to, from };
        const errorDetails = {};
        for (const asset in assetCodes) {
            const assetCode = assetCodes[asset];
            if (!assetCode) errorDetails[asset] = `${asset} not provided`;
            else if (!Asset.exists(String(assetCode).toLowerCase())) errorDetails[asset] = `${asset} not found`;
        }
        if (Object.keys(errorDetails).length) {
            client.emit('exception', errorDetails);
            return client.disconnect(true);
        }
        client.emit('new_rate', Asset.convert(assetCodes.from, assetCodes.to));
        let roomName = `${assetCodes.from}-${assetCodes.to}`;
        client.join(roomName);
        client.on(
            'parameter_change',
            ({ from, to } = {}) => {
                newAssetCodes = { from, to };
                client.leave(roomName, (err) => {
                    for (const asset in newAssetCodes) {
                        const assetCode = newAssetCodes[asset];
                        if (assetCode) {
                            if (!Asset.exists(String(assetCode).toLowerCase())) errorDetails[asset] = `${asset} not found`;
                            else assetCodes[asset] = assetCode;
                        }
                    }
                    if (Object.keys(errorDetails).length) {
                        client.emit('exception', errorDetails);
                        return client.disconnect(true);
                    }
                    client.emit('new_rate', Asset.convert(assetCodes.from, assetCodes.to));
                    roomName = `${assetCodes.from}-${assetCodes.to}`;
                    console.log(roomName, newAssetCodes, Asset.convert(assetCodes.from, assetCodes.to));
                    client.join(roomName);
                });
            },
        );
    });
