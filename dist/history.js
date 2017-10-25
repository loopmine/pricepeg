"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CurrencyConversion_1 = require("./data/CurrencyConversion");
var Utils_1 = require("./data/Utils");
var config_1 = require("./config");
exports.getHistoryPage = function (req, res, peg) {
    var config = config_1.getConfig();
    var updateTime = (config.updateInterval / 60).toFixed(2).indexOf(".00") == -1 ? (config.updateInterval / 60).toFixed(2) : (config.updateInterval / 60);
    var formattedUpdateThreshold = (config.updateThresholdPercentage * 100).toString().indexOf(".") == -1 ? (config.updateThresholdPercentage * 100).toString() : (config.updateThresholdPercentage * 100).toString().substr(0, (config.updateThresholdPercentage * 100).toString().indexOf(".") + 4);
    var pageSize = 10;
    var maxPages = 7;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write("<!DOCTYPE html>\n  <html lang=\"en\">\n    <head>\n      <link rel=\"stylesheet\" href=\"style.css\">\n         \n      <!-- Required meta tags -->\n      <meta charset=\"utf-8\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n  \n      <!-- Material Design for Bootstrap fonts and icons -->\n      <link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons\">\n  \n      <!-- Material Design for Bootstrap CSS -->\n      <link rel=\"stylesheet\" href=\"bootstrap-material-design.css\" crossorigin=\"anonymous\">\n    \n      <!-- jQuery first, then Popper.js, then Bootstrap JS -->\n      <script src=\"https://code.jquery.com/jquery-3.2.1.slim.min.js\" integrity=\"sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN\" crossorigin=\"anonymous\"></script>\n      <script src=\"https://unpkg.com/popper.js@1.12.5/dist/umd/popper.js\" integrity=\"sha384-KlVcf2tswD0JOTQnzU4uwqXcbAy57PvV48YUiLjqpk/MJ2wExQhg9tuozn5A1iVw\" crossorigin=\"anonymous\"></script>\n      <script src=\"https://unpkg.com/bootstrap-material-design@4.0.0-beta.3/dist/js/bootstrap-material-design.js\" integrity=\"sha384-hC7RwS0Uz+TOt6rNG8GX0xYCJ2EydZt1HeElNwQqW+3udRol4XwyBfISrNDgQcGA\" crossorigin=\"anonymous\"></script>\n      \n      <script src=\"highcharts3/highcharts.js\"></script>\n      <script src=\"highcharts3/modules/series-label.js\"></script>\n      <script src=\"highcharts3/modules/exporting.js\"></script>\n\n      \n      <title>Syscoin Price Peg History</title> \n      <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"> \n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n       \n      <link rel=\"icon\" href=\"http://i1.wp.com/syscoin.org/wp-content/uploads/2016/03/cropped-White-Logo-640x130.png?fit=32%2C32\" sizes=\"32x32\" /> \n      <link rel=\"icon\" href=\"http://i1.wp.com/syscoin.org/wp-content/uploads/2016/03/cropped-White-Logo-640x130.png?fit=192%2C192\" sizes=\"192x192\" />  \n      <link rel=\"apple-touch-icon-precomposed\" href=\"http://i1.wp.com/syscoin.org/wp-content/uploads/2016/03/cropped-White-Logo-640x130.png?fit=180%2C180\" /> \n      <meta name=\"msapplication-TileImage\" content=\"http://i1.wp.com/syscoin.org/wp-content/uploads/2016/03/cropped-White-Logo-640x130.png?fit=270%2C270\" /> \n    </head>\n    <body>\n      <script >\n        window.pageSize = " + pageSize + ";\n        window.maxPages = " + maxPages + ";\n        window.updateHistory = " + JSON.stringify(peg.updateHistory) + ";\n        window.currentRate = " + JSON.stringify(peg.sysRates) + ";\n      </script>\n      <script src=\"/js/scripts.js\"></script>\n      <div class=\"container\">\n        <div class=\"row\">\n          <div class=\"col\">\n            <!-- gutter -->\n          </div>\n          <div class=\"card col-12\">\n            <h4 class=\"card-header\">\n              <a href=\"http://syscoin.org\"><img src=\"syscoin_icon.png\" width=\"50\" height=\"50\" style=\"\" /></a> Syscoin Price Peg\n            </h4>\n            <div class=\"card-body\" style=\"overflow: scroll\">\n              <p class=\"card-text\">\n                <p>\n                  The Syscoin Team price peg uses the \"" + config.pegalias + "\" alias on the Syscoin blockchain and is the default price peg for all items being sold on the \n                  Syscoin Decentralized Marketplace. The price peg uses averages rates from Bittrex and Poloniex for each supported cryptocurrency, USD/BTC rates from Coinbase, and USD/Fiat rates from <a href=\"http://fixer.io\">Fixer.io.</a> <br><br>\n                  The \"" + config.pegalias + "\" price peg is automatically updated when any of the supported currency's exchange rates change by +/- " + formattedUpdateThreshold + "% of the current rates stored on the blockchain. This check is performed every " + updateTime + " minutes.\n                  \n                  For more information on how price pegging works in Syscoin please <a href=\"http://syscoin.org/faqs/price-pegging-work/\">see the FAQ.</a><br><br>\n                  Values in the below are trimmed to 2 decimals. Full value can be seen in history here or on the blockchain. To support the Syscoin team price peg please send SYS to \"" + config.pegalias + "\", all funds are used to cover alias update costs.\n                </p>");
    var displayRates = peg.sysRates.rates.filter(function (item) {
        return item.currency != CurrencyConversion_1.CurrencyConversionType.CRYPTO.SYS.symbol;
    });
    for (var i = 0; i < displayRates.length; i++) {
        var rate = displayRates[i];
        var formattedValue = rate.rate.toString().indexOf(".") == -1 ? Utils_1.numberWithCommas(rate.rate.toString()) : Utils_1.numberWithCommas(rate.rate.toString().substr(0, rate.rate.toString().indexOf(".") + 3));
        var currencyData = Utils_1.getCurrencyData(rate.currency);
        var cols = 3;
        var colSize = (12 / cols);
        if (i + 1 == 1) {
            res.write('<div class="row">');
        }
        res.write("<div class=\"col-12 col-md-3\" style=\"cursor: pointer; text-align: center; padding-bottom: 20px\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + formattedValue + " Syscoin = 1 " + Utils_1.capitalizeFirstLetterLowercaseWordPerWord(currencyData.label) + "\">\n                <h4><b>" + formattedValue + "</b></h4>\n                <span style=\"font-size: 16px\" class=\"badge badge-pill badge-primary\">" + rate.currency + "/SYS</b></span>\n              </div>");
        if ((i > 0 && (i + 1) % colSize == 0) || i == displayRates.length - 1) {
            res.write('</div>');
            if (displayRates.length > i + 1) {
                res.write('<div class="row">');
            }
        }
    }
    res.write("   \n                <div id=\"chart-container\"></div>\n                \n                <div class=\"form-group\">\n                  <label for=\"exampleFormControlTextarea1\">Current Raw Value</label>\n                  <textarea class=\"form-control\" rows=\"3\" style=\"font-size: 11px\">" + JSON.stringify(peg.sysRates) + "</textarea>\n                </div>\n                \n                <div class=\"alert alert-info\" role=\"alert\">\n                  <small>\n                    <b>Disclaimer:</b> The Syscoin Team does its best to ensure the price peg is running properly 24/7/365 and that rates produced by the peg are accurate based on market rates. By using the Syscoin Team price peg you acknowledge this and release the team for any liability related to inaccuracies or erroneous peg values.\n                  </small>\n                </div>\n                <table class=\"table\">\n                  <thead>\n                    <tr>\n                      <th>Time</th>\n                      <th>Value</th>\n                    </tr>\n                  </thead>\n                  <tbody id=\"pageContent\">\n                  </tbody>\n                </table>\n                <div>\n                  <nav aria-label=\"...\">\n                    <ul class=\"pagination\" id=\"pagination\">\n                    </ul>\n                  </nav>\n                </div>\n              </p>\n            </div>\n            <div class=\"main-footer\">\n              <small><a href=\"http://syscoin.org\">Syscoin</a> Price Peg Server v" + config.version + " by <a href=\"http://blockchainfoundry.co\">Blockchain Foundry.</a></small>\n            </div>\n          </div>\n          <div class=\"col\">\n            <!-- gutter -->\n          </div>\n        </div>\n      </div>\n    </body>\n  </html>");
    res.end();
};
exports.timeConverter = function (UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    //let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    var time = date + ' ' + month + ' ' + year + ' ' + exports.formatAMPM(a);
    return time;
};
exports.formatAMPM = function (date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
};
exports.default = exports.getHistoryPage;
//# sourceMappingURL=history.js.map