util = require("util");
module.exports = {dynamicNumProp: 1000, staticNumProp: 100};
setInterval(function() {
    module.exports.dynamicNumProp*= 5/4 +7
    console.log("changed dynamic num prop to: ", module.exports.dynamicNumProp)
}, 12000)