import PricePeg from "./PricePeg";
import {CurrencyConversionType} from "./data/CurrencyConversion";
import {getCurrencyData, numberWithCommas, capitalizeFirstLetterLowercaseWordPerWord} from "./data/Utils";
import {getConfig} from "./config";

export const getHistoryPage = (req, res, peg: PricePeg) => {
  const config = getConfig();
  const updateTime = (config.updateInterval / 60).toFixed(2).indexOf(".00") == -1 ? (config.updateInterval / 60).toFixed(2) : (config.updateInterval / 60);
  const formattedUpdateThreshold = (config.updateThresholdPercentage * 100).toString().indexOf(".") == -1 ? (config.updateThresholdPercentage * 100).toString() : (config.updateThresholdPercentage * 100).toString().substr(0, (config.updateThresholdPercentage * 100).toString().indexOf(".") + 4);
  const pageSize = 10;
  const maxPages = 7;
  res.writeHead(200, {'Content-Type': 'text/html'});

  res.write(`<!DOCTYPE html>
  <html lang="en">
    <head>
      <link rel="stylesheet" href="style.css">
         
      <!-- Required meta tags -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  
      <!-- Material Design for Bootstrap fonts and icons -->
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons">
  
      <!-- Material Design for Bootstrap CSS -->
      <link rel="stylesheet" href="bootstrap-material-design.css" crossorigin="anonymous">
    
      <!-- jQuery first, then Popper.js, then Bootstrap JS -->
      <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
      <script src="https://unpkg.com/popper.js@1.12.5/dist/umd/popper.js" integrity="sha384-KlVcf2tswD0JOTQnzU4uwqXcbAy57PvV48YUiLjqpk/MJ2wExQhg9tuozn5A1iVw" crossorigin="anonymous"></script>
      <script src="https://unpkg.com/bootstrap-material-design@4.0.0-beta.3/dist/js/bootstrap-material-design.js" integrity="sha384-hC7RwS0Uz+TOt6rNG8GX0xYCJ2EydZt1HeElNwQqW+3udRol4XwyBfISrNDgQcGA" crossorigin="anonymous"></script>
      
      <script src="highcharts3/highcharts.js"></script>
      <script src="highcharts3/modules/series-label.js"></script>
      <script src="highcharts3/modules/exporting.js"></script>

      
      <title>Syscoin Price Peg History</title> 
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
      <meta name="viewport" content="width=device-width, initial-scale=1">
       
      <link rel="icon" href="http://i1.wp.com/syscoin.org/wp-content/uploads/2016/03/cropped-White-Logo-640x130.png?fit=32%2C32" sizes="32x32" /> 
      <link rel="icon" href="http://i1.wp.com/syscoin.org/wp-content/uploads/2016/03/cropped-White-Logo-640x130.png?fit=192%2C192" sizes="192x192" />  
      <link rel="apple-touch-icon-precomposed" href="http://i1.wp.com/syscoin.org/wp-content/uploads/2016/03/cropped-White-Logo-640x130.png?fit=180%2C180" /> 
      <meta name="msapplication-TileImage" content="http://i1.wp.com/syscoin.org/wp-content/uploads/2016/03/cropped-White-Logo-640x130.png?fit=270%2C270" /> 
    </head>
    <body>
      <script >
        window.pageSize = ${pageSize};
        window.maxPages = ${maxPages};
        window.updateHistory = ${JSON.stringify(peg.updateHistory)};
      </script>
      <script src="/js/scripts.js"></script>
      <div class="container">
        <div class="row">
          <div class="col">
            <!-- gutter -->
          </div>
          <div class="card col-12">
            <h4 class="card-header">
              <a href="http://syscoin.org"><img src="syscoin_icon.png" width="50" height="50" style="" /></a> Syscoin Price Peg
            </h4>
            <div class="card-body" style="overflow: scroll">
              <p class="card-text">
                <p>
                  The Syscoin Team price peg uses the "${config.pegalias}" alias on the Syscoin blockchain and is the default price peg for all items being sold on the 
                  Syscoin Decentralized Marketplace. The price peg uses averages rates from Bittrex and Poloniex for each supported cryptocurrency, USD/BTC rates from Coinbase, and USD/Fiat rates from <a href="http://fixer.io">Fixer.io.</a> <br><br>
                  The "${config.pegalias}" price peg is automatically updated when any of the supported currency's exchange rates change by +/- ${formattedUpdateThreshold}% of the current rates stored on the blockchain. This check is performed every ${updateTime} minutes.
                  
                  For more information on how price pegging works in Syscoin please <a href="http://syscoin.org/faqs/price-pegging-work/">see the FAQ.</a><br><br>
                  Values in the below are trimmed to 2 decimals. Full value can be seen in history here or on the blockchain. To support the Syscoin team price peg please send SYS to "${config.pegalias}", all funds are used to cover alias update costs.
                </p>`);

  let displayRates = peg.sysRates.rates.filter(item => {
    return item.currency != CurrencyConversionType.CRYPTO.SYS.symbol;
  });

  for (let i = 0; i < displayRates.length; i++) {
    let rate = displayRates[i];

    const formattedValue = rate.rate.toString().indexOf(".") == -1 ? numberWithCommas(rate.rate.toString()) : numberWithCommas(rate.rate.toString().substr(0, rate.rate.toString().indexOf(".") + 3));
    const currencyData = getCurrencyData(rate.currency);
    const cols = 3;
    const colSize = (12 / cols);

    if(i+1 == 1) {
      res.write('<div class="row">');
    }

    res.write(`<div class="col-12 col-md-3" style="cursor: pointer; text-align: center; padding-bottom: 20px" data-toggle="tooltip" data-placement="top" title="${formattedValue} Syscoin = 1 ${capitalizeFirstLetterLowercaseWordPerWord(currencyData.label)}">
                <h4><b>${formattedValue}</b></h4>
                <span style="font-size: 16px" class="badge badge-pill badge-primary">${rate.currency}/SYS</b></span>
              </div>`);

    if((i > 0 && (i+1) % colSize == 0) || i == displayRates.length-1) {
      res.write('</div>');
      if(displayRates.length > i+1) {
        res.write('<div class="row">');
      }
    }
  }


  res.write(`   
                <div id="chart-container"></div>
                
                <div class="form-group">
                  <label for="exampleFormControlTextarea1">Current Raw Value</label>
                  <textarea class="form-control" rows="3" style="font-size: 11px">${JSON.stringify(peg.sysRates)}</textarea>
                </div>
                
                <div class="alert alert-info" role="alert">
                  <small>
                    <b>Disclaimer:</b> The Syscoin Team does its best to ensure the price peg is running properly 24/7/365 and that rates produced by the peg are accurate based on market rates. By using the Syscoin Team price peg you acknowledge this and release the team for any liability related to inaccuracies or erroneous peg values.
                  </small>
                </div>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody id="pageContent">
                  </tbody>
                </table>
                <div>
                  <nav aria-label="...">
                    <ul class="pagination" id="pagination">
                    </ul>
                  </nav>
                </div>
              </p>
            </div>
            <div class="main-footer">
              <small><a href="http://syscoin.org">Syscoin</a> Price Peg Server v${config.version} by <a href="http://blockchainfoundry.co">Blockchain Foundry.</a></small>
            </div>
          </div>
          <div class="col">
            <!-- gutter -->
          </div>
        </div>
      </div>
    </body>
  </html>`);
  res.end();
};

export const timeConverter = (UNIX_timestamp: number) => {
  let a = new Date(UNIX_timestamp);
  let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let year = a.getFullYear();
  let month = months[a.getMonth()];
  let date = a.getDate();
  let hour = a.getHours();
  let min = a.getMinutes();
  let sec = a.getSeconds();
  //let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  let time = date + ' ' + month + ' ' + year + ' ' + formatAMPM(a);

  return time;
};

export const formatAMPM = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

  return strTime;
};

export default getHistoryPage;
