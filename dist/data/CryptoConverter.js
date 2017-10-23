"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CurrencyConversion_1 = require("./CurrencyConversion");
var Q = require("q");
var Utils_1 = require("./Utils");
var PricePeg_1 = require("../PricePeg");
var config_1 = require("../config");
var CryptoConverter = /** @class */ (function () {
    function CryptoConverter(currencyConversion, dataSources, currencyConfig) {
        if (currencyConfig === void 0) { currencyConfig = null; }
        var _this = this;
        this.currencyConversion = currencyConversion;
        this.dataSources = dataSources;
        this.currencyConfig = currencyConfig;
        this.fetchRateData = function () {
            var requests = [];
            _this.dataSources.map(function (conversionDataSource) {
                requests.push(conversionDataSource.fetchCurrencyConversionData());
            });
            return Q.all(requests);
        };
        this.refreshAverageExchangeRate = function () {
            var deferred = Q.defer();
            _this.fetchRateData().then(function (results) {
                deferred.resolve(_this.getAveragedExchangeRate());
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        this.getAveragedExchangeRate = function () {
            //first get the average across all the conversions
            var avgSum = 0;
            for (var i = 0; i < _this.dataSources.length; i++) {
                avgSum += _this.dataSources[i].formattedCurrencyConversionData.toCurrencyAmount;
            }
            var avgVal = avgSum / _this.dataSources.length;
            return avgVal;
        };
        /*
          Assumes toCurrencyBTCValue is in satoshi
         */
        this.getAmountToEqualOne = function (toCurrencyBTCValue) {
            var one = toCurrencyBTCValue / _this.getAveragedExchangeRate();
            return one;
        };
        this.getPegCurrency = function () {
            var currency = _this.currencyConversion.fromCurrencySymbol;
            //if fiat then use the to currency symbol
            if ((_this.currencyConfig && _this.currencyConfig.isFiat) ||
                (_this.currencyConfig == null && _this.currencyConversion.fromCurrencySymbol == CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.symbol) ||
                (_this.currencyConfig && _this.key == PricePeg_1.conversionKeys.SYSBTC))
                currency = _this.currencyConversion.toCurrencySymbol;
            return currency;
        };
        this.getSYSPegFormat = function (conversionDataSources, fiatDatSource) {
            var pegEntry = {
                currency: _this.getPegCurrency(),
                rate: _this.getCalculatedExchangeRate(conversionDataSources, fiatDatSource),
                precision: _this.currencyConfig.precision ? _this.currencyConfig.precision : 2
            };
            if (_this.currencyConfig.fee)
                pegEntry.fee = _this.currencyConfig.fee;
            if (_this.currencyConfig.escrowFee)
                pegEntry.escrowfee = _this.currencyConfig.escrowFee;
            return pegEntry;
        };
        this.getCalculatedExchangeRate = function (conversionDataSources, fiatDataSource) {
            var exchangedRate = -1;
            var precision = _this.currencyConfig ? _this.currencyConfig.precision : 2;
            //there will always be a conversion BTC/USD, even if not displayed
            if (_this.key == CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.symbol + CurrencyConversion_1.CurrencyConversionType.FIAT.USD.symbol) {
                //return early
                return Utils_1.getFixedRate(_this.getSYSFiatValue(CurrencyConversion_1.CurrencyConversionType.FIAT.USD.symbol, conversionDataSources), precision);
            }
            //there will always be a conversion SYS/BTC, even if not displayed
            if (_this.key == CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.symbol + CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.symbol) {
                //return early
                return Utils_1.getFixedRate(1 / conversionDataSources[_this.key].getAveragedExchangeRate(), _this.currencyConfig.precision);
            }
            if (_this.currencyConfig.isFiat) {
                exchangedRate = Utils_1.getFiatExchangeRate(_this.getSYSFiatValue(CurrencyConversion_1.CurrencyConversionType.FIAT.USD.symbol, conversionDataSources), fiatDataSource.formattedCurrencyConversionData[_this.currencyConfig.currencySymbol], precision);
            }
            else if (_this.key == CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.symbol + CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.symbol) {
                exchangedRate = 1;
            }
            else {
                exchangedRate = Utils_1.getFixedRate(parseFloat(conversionDataSources[PricePeg_1.conversionKeys.SYSBTC].getAmountToEqualOne(conversionDataSources[_this.key].getAveragedExchangeRate()).toString()), precision);
            }
            if (exchangedRate == -1) {
                throw new Error("No currency config defined for getCalculatedExchangeRate or not found- " + _this.key);
            }
            return exchangedRate;
        };
        this.getSYSFiatValue = function (fiatType, conversionDataSources) {
            var convertedValue;
            switch (fiatType) {
                case CurrencyConversion_1.CurrencyConversionType.FIAT.USD.symbol:
                    convertedValue = 1 / conversionDataSources[CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.symbol + CurrencyConversion_1.CurrencyConversionType.FIAT.USD.symbol].getAveragedExchangeRate();
                    convertedValue = convertedValue / conversionDataSources[CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.symbol + CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.symbol].getAveragedExchangeRate();
                    //if debug is enabled artificially increment USD only by config'd amount
                    if (config_1.getConfig().enablePegUpdateDebug) {
                        convertedValue += config_1.getConfig().debugPegUpdateIncrement;
                    }
                    break;
            }
            return convertedValue;
        };
        this.key = currencyConversion.fromCurrencySymbol + currencyConversion.toCurrencySymbol;
    }
    return CryptoConverter;
}());
exports.default = CryptoConverter;
//# sourceMappingURL=CryptoConverter.js.map