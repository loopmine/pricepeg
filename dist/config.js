"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./data/Utils");
var logLevel = {
    logNetworkEvents: false,
    logBlockchainEvents: true,
    logPriceCheckEvents: true,
    logUpdateLoggingEvents: true
};
exports.defaultConfig = {
    currencies: [],
    maxUpdatesPerPeriod: 6,
    updatePeriod: 60 * 60 * 1,
    updateThresholdPercentage: 0.01,
    updateInterval: 10,
    enableLivePegUpdates: true,
    enablePegUpdateDebug: false,
    debugPegUpdateInterval: 5,
    debugPegUpdateIncrement: 50,
    rpcserver: "localhost",
    rpcuser: "u",
    rpcpassword: "p",
    rpcport: 8336,
    rpctimeout: 30000,
    pegalias: "pegtest1",
    pegalias_aliaspeg: "pegtest1",
    httpport: 8080,
    logLevel: logLevel,
    debugLogFilename: "peg.log",
    updateLogFilename: "peg-update-history.log",
    version: "1.4.0"
};
var config = exports.defaultConfig;
//should always use the below functions for accessing config.
exports.getConfig = function () {
    return config;
};
exports.setConfig = function (newConfig) {
    Utils_1.copyFields(config, newConfig);
    //run through and make sure all the types of new config are proper
    config.debugPegUpdateIncrement = parseFloat(config.debugPegUpdateIncrement.toString());
    config.debugPegUpdateInterval = parseFloat(config.debugPegUpdateInterval.toString());
    config.maxUpdatesPerPeriod = parseInt(config.maxUpdatesPerPeriod.toString());
    config.httpport = parseInt(config.httpport.toString());
    config.rpcport = parseInt(config.rpcport.toString());
    config.rpctimeout = parseInt(config.rpctimeout.toString());
    config.updateThresholdPercentage = parseFloat(config.updateThresholdPercentage.toString());
    config.updateInterval = parseInt(config.updateInterval.toString());
    config.updatePeriod = parseInt(config.updatePeriod.toString());
};
//# sourceMappingURL=config.js.map