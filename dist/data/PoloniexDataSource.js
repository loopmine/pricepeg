"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BaseConversionDataSource_1 = require("./BaseConversionDataSource");
var CurrencyConversion_1 = require("./CurrencyConversion");
var PoloniexDataSource = /** @class */ (function (_super) {
    __extends(PoloniexDataSource, _super);
    function PoloniexDataSource(currencyConversion, dataUrl, responseDataPath) {
        if (responseDataPath === void 0) { responseDataPath = null; }
        var _this = _super.call(this, currencyConversion.fromCurrencySymbol, currencyConversion.fromCurrencyLabel, dataUrl, responseDataPath) || this;
        _this.currencyConversion = currencyConversion;
        _this.dataUrl = dataUrl;
        _this.responseDataPath = responseDataPath;
        _this.formatCurrencyConversionData = function (rawCurrencyResponseData) {
            _this.formattedCurrencyConversionData = new CurrencyConversion_1.default(_this.baseCurrencySymbol, _this.baseCurrencyLabel, 1, _this.currencyConversion.toCurrencySymbol, _this.currencyConversion.toCurrencyLabel, rawCurrencyResponseData.bids[0][0]);
        };
        return _this;
    }
    return PoloniexDataSource;
}(BaseConversionDataSource_1.default));
exports.default = PoloniexDataSource;
//# sourceMappingURL=PoloniexDataSource.js.map