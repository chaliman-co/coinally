const
    mongoose = require("mongoose"),
    configMap = {},
    configSchema = new mongoose.Schema({
        key: {
            type: String,
            unique: true,
            required: [true, "key not provided"]
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, "value not provided"]
        }
    }),
    configFields = function makeFields() {
        Object.assign(this, {
            key: undefined,
            value: undefined
        });
        Object.preventExtensions(this);
    }
;

configSchema.statics.Fields = configFields;
configSchema.statics.get = function getValue(key) {
    return configMap[key]
}
configSchema.statics.set = function setConfig(config) {
    return configMap[config.key] = config.value;
}
configSchema.statics.getLive = function getLive(cb) {
    configModel.find({}).then(function foundConfigs(configs) {
        configs.forEach(function setConfigLive(config) {
            return configMap[config.key] = config.value;
        });console.log(require("util").inspect({configMap}, {depth: null}));
        if (cb) cb();
    })
}
const configModel = mongoose.model("Config", configSchema);
module.exports = configModel