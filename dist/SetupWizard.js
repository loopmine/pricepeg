"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var ini = require("ini");
var Utils_1 = require("./data/Utils");
var common_1 = require("./common");
var CurrencyConversion_1 = require("./data/CurrencyConversion");
var CryptoConverter_1 = require("./data/CryptoConverter");
var ConversionDataSource_1 = require("./data/ConversionDataSource");
var PoloniexDataSource_1 = require("./data/PoloniexDataSource");
var config_1 = require("./config");
var SetupWizard = /** @class */ (function () {
    function SetupWizard() {
        var _this = this;
        this.setup = function (configJsonFilePath, configOverride) {
            if (configOverride === void 0) { configOverride = null; }
            var deferred = Q.defer();
            if (!configOverride) {
                Utils_1.logPegMessage("Reading config from file: " + configJsonFilePath);
                Utils_1.readFromFile(configJsonFilePath).then(function (contents) {
                    var currencyConfig;
                    try {
                        currencyConfig = ini.parse(contents);
                        //walk thru the config from ini and change currencies to supported validator format
                        var currencyArr = [];
                        for (var key in currencyConfig.currencies) {
                            var currencyConfigEntry = currencyConfig.currencies[key];
                            //convert strings to numbers
                            if (currencyConfigEntry.fee)
                                currencyConfigEntry.fee = parseFloat(currencyConfigEntry.fee.toString());
                            if (currencyConfigEntry.escrowFee)
                                currencyConfigEntry.escrowFee = parseFloat(currencyConfigEntry.escrowFee.toString());
                            if (currencyConfigEntry.precision)
                                currencyConfigEntry.precision = parseInt(currencyConfigEntry.precision.toString());
                            currencyConfigEntry.currencySymbol = key;
                            currencyArr.push(currencyConfigEntry);
                        }
                        currencyConfig.currencies = currencyArr;
                    }
                    catch (e) {
                        Utils_1.logPegMessage("ERROR: Error parsing JSON from config: " + JSON.stringify(e));
                    }
                    _this.parseConfig(currencyConfig, deferred);
                }, function (err) {
                    Utils_1.logPegMessage("Error reading currency config file! " + JSON.stringify(err));
                    deferred.reject(err);
                });
            }
            else {
                Utils_1.logPegMessage("Using config override.");
                _this.parseConfig(configOverride, deferred);
            }
            return deferred.promise;
        };
        this.applyDefaultConfig = function (config) {
            Utils_1.logPegMessage("Applying default config values.");
            config = Utils_1.copyFields(config_1.defaultConfig, config);
            return config;
        };
        this.parseConfig = function (config, setupPromise) {
            Utils_1.logPegMessage("Parsing config." + JSON.stringify(config));
            //prevent changes to version thru config
            config.version = config_1.defaultConfig.version;
            config_1.setConfig(config);
            config = config_1.getConfig();
            if (_this.validateCurrencyConfig(config)) {
                Utils_1.logPegMessage("VALID CONFIG.");
                setupPromise.resolve({ config: config, converters: _this.generatePegDataSourceObject(config) });
            }
            else {
                Utils_1.logPegMessage("INVALID CONFIG." + JSON.stringify(config));
                setupPromise.reject("INVALID CONFIG.");
            }
        };
        this.validateCurrencyConfig = function (config) {
            var configObj = config.currencies;
            if (configObj && configObj.length) {
                for (var i = 0; i < configObj.length; i++) {
                    var configEntry = configObj[i];
                    var currencySupported = false;
                    for (var x = 0; x < common_1.supportedCurrencies.length; x++) {
                        if (common_1.supportedCurrencies[x].symbol == configEntry.currencySymbol) {
                            currencySupported = true;
                            break;
                        }
                    }
                    if (!currencySupported) {
                        _this.invalidConfigError("Unsupported currency symbol: " + configEntry.currencySymbol);
                        return false;
                    }
                    if (typeof configEntry.isFiat != 'boolean') {
                        _this.invalidConfigError("isFiat must be true or false, current value " + configEntry.isFiat + " is invalid.");
                        return false;
                    }
                    if (!configEntry.isFiat && configEntry.currencySymbol != CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.symbol) {
                        if (configEntry.dataSources) {
                            var dataSourcesArr = configEntry.dataSources.split(",");
                            for (var x = 0; x < dataSourcesArr.length; x++) {
                                var value = dataSourcesArr[x].trim().toLowerCase();
                                if (value != common_1.DATA_SOURCE.BITTREX && value != common_1.DATA_SOURCE.POLONIEX) {
                                    _this.invalidConfigError("Only data sources of " + common_1.DATA_SOURCE.BITTREX + " or " + common_1.DATA_SOURCE.POLONIEX + " are supported - " + value + " is invalid.");
                                    return false;
                                }
                            }
                        }
                        else {
                            _this.invalidConfigError("Datasources must be specified for non-fiat currencies. No datasources found for " + configEntry.currencySymbol);
                            return false;
                        }
                    }
                    if (configEntry.escrowFee && typeof configEntry.escrowFee != 'number') {
                        _this.invalidConfigError("escrowFee must be number, is invalid type for symbol " + configEntry.currencySymbol);
                        return false;
                    }
                    if (configEntry.fee && typeof configEntry.fee != 'number') {
                        _this.invalidConfigError("fee must be number, is invalid type for symbol " + configEntry.currencySymbol);
                        return false;
                    }
                    if (configEntry.precision && typeof configEntry.precision != 'number') {
                        _this.invalidConfigError("precision must be number, is invalid type for symbol " + configEntry.currencySymbol);
                        return false;
                    }
                    if (configEntry.precision < 0 || configEntry.precision > 8) {
                        _this.invalidConfigError("precision for symbol " + configEntry.currencySymbol + " out of range - must be between 0 and 8");
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        this.invalidConfigError = function (reason) {
            Utils_1.logPegMessage("ERROR: Invalid currencies.conf file, details: " + reason);
        };
        this.getDataSourcesFromConfig = function (dataSourceConfigStr, currencyConversion) {
            var dataSourcesArr = dataSourceConfigStr.split(",");
            var conversionDataSources = [];
            for (var i = 0; i < dataSourcesArr.length; i++) {
                switch (dataSourcesArr[i].toLowerCase()) {
                    case common_1.DATA_SOURCE.BITTREX:
                        conversionDataSources.push(new ConversionDataSource_1.default(currencyConversion, "https://bittrex.com/api/v1.1/public/getticker?market=BTC-" + currencyConversion.fromCurrencySymbol, "result.Bid"));
                        break;
                    case common_1.DATA_SOURCE.POLONIEX:
                        conversionDataSources.push(new PoloniexDataSource_1.default(currencyConversion, "https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_" + currencyConversion.fromCurrencySymbol + "&depth=1", "bids"));
                        break;
                }
            }
            return conversionDataSources;
        };
        this.generatePegDataSourceObject = function (config) {
            var configObj = config.currencies;
            var currencyConversionDataSources = [];
            for (var i = 0; i < configObj.length; i++) {
                var configEntry = configObj[i];
                //first build conversion object;
                var currencyConversion = void 0;
                var currencyData = Utils_1.getCurrencyData(configEntry.currencySymbol);
                if (configEntry.isFiat) {
                    currencyConversion = new CurrencyConversion_1.default(CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.symbol, CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.label, 1, currencyData.symbol, currencyData.label, 1);
                    var coinbaseDataSource = new ConversionDataSource_1.default(currencyConversion, "https://coinbase.com/api/v1/currencies/exchange_rates", "btc_to_usd");
                    var dataSourcesArr = currencyData.symbol == CurrencyConversion_1.CurrencyConversionType.FIAT.USD.symbol ? [coinbaseDataSource] : [];
                    currencyConversionDataSources.push(new CryptoConverter_1.default(currencyConversion, dataSourcesArr, configEntry));
                }
                else {
                    if (configEntry.currencySymbol != CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.symbol) {
                        if (configEntry.currencySymbol == CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.symbol) {
                            //if the conversion is to BTC the currencyConversion object needs to be from SYS to BTC
                            currencyConversion = new CurrencyConversion_1.default(CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.symbol, CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.label, 1, CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.symbol, CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.label, 1);
                            currencyConversionDataSources.push(new CryptoConverter_1.default(currencyConversion, _this.getDataSourcesFromConfig(configEntry.dataSources, currencyConversion), configEntry));
                        }
                        else {
                            //cryptocurrencies always are converted to BTC, and converter will handle the final conversion to SYS
                            currencyConversion = new CurrencyConversion_1.default(currencyData.symbol, currencyData.label, 1, CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.symbol, CurrencyConversion_1.CurrencyConversionType.CRYPTO.BTC.label, 1);
                            currencyConversionDataSources.push(new CryptoConverter_1.default(currencyConversion, _this.getDataSourcesFromConfig(configEntry.dataSources, currencyConversion), configEntry));
                        }
                    }
                    else {
                        //if the conversion is to SYS its 1:1
                        currencyConversion = new CurrencyConversion_1.default(currencyData.symbol, currencyData.label, 1, CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.symbol, CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.label, 1);
                        currencyConversionDataSources.push(new CryptoConverter_1.default(currencyConversion, [], configEntry));
                    }
                }
            }
            return currencyConversionDataSources;
        };
    }
    ;
    return SetupWizard;
}());
exports.default = SetupWizard;
//# sourceMappingURL=SetupWizard.js.map