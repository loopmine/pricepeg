import {PegConfig} from "./common";
import {copyFields} from "./data/Utils";
export interface LogLevel {
  logNetworkEvents?: boolean;
  logBlockchainEvents?: boolean;
  logPriceCheckEvents?: boolean;
  logUpdateLoggingEvents?: boolean;
}

const logLevel:LogLevel = {
  logNetworkEvents: false,
  logBlockchainEvents: true,
  logPriceCheckEvents: true,
  logUpdateLoggingEvents: true
};

export const defaultConfig: PegConfig = {
  currencies: [],

  maxUpdatesPerPeriod: 6, // maximum number of peg updates that will be allowed to occur in a single period
  updatePeriod: 60 * 60 * 1, //defintion of the duration of a single period in seconds
  updateThresholdPercentage: 0.01, //percentage at which an update is attempted, if value of peg fluctuates +/- this range
  updateInterval: 10, //time in second to check for price change updates

  enableLivePegUpdates: true, //debug mode, disables live updates to peg on network
  enablePegUpdateDebug: false, //debug mode, enables debug mode which updates peg on set interval w fixed update rather than market rates
  debugPegUpdateInterval: 5, //debug mode, how frequently to update peg
  debugPegUpdateIncrement: 50, //debug mode, how much to increment USD conversion

  rpcserver: "localhost",
  rpcuser: "username",
  rpcpassword: "password",
  rpcport: 8336,
  rpctimeout: 30000,
  pegalias: "pegtest1",
  pegalias_aliaspeg: "pegtest1",

  httpport: 8080,

  logLevel: logLevel,
  debugLogFilename: "peg.log",
  updateLogFilename: "peg-update-history.log",

  version: "1.3.0"
};

let config = defaultConfig;

//should always use the below functions for accessing config.
export const getConfig = (): PegConfig => {
  return config;
};

export const setConfig = (newConfig: PegConfig) => {
  copyFields(config, newConfig);

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



