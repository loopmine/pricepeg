"use strict";
var Utils_1 = require("../data/Utils");
exports.supportedCurrenciesToMarkdown = function (currencies) {
    var markdown = "";
    for (var i = 0; i < currencies.length; i++) {
        markdown += "**" + currencies[i].symbol + "** | " + Utils_1.capitalizeFirstLetterLowercaseWordPerWord(currencies[i].label) + " | " + currencies[i].isFiat + " | \n";
    }
    return markdown;
};
//# sourceMappingURL=DocUtils.js.map