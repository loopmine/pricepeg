//NOTE: intentionally cheating on the TS here, this was intended to be light
let Highcharts: any;

let pageSize = (<any>window).pageSize;
let maxPages = (<any>window).maxPages;
let historyCollection = (<any>window).updateHistory;
console.log("History:", historyCollection);
let currentPage = 1;
let totalPages = Math.ceil(historyCollection.length / pageSize);
let halfPage = Math.floor(maxPages / 2);

const formatAMPM = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  if(seconds.toString().length == 1) {
    seconds = "0" + seconds;
  }

  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

  return strTime;
};

const timeConverter = (UNIX_timestamp) => {
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

function getPage(num) {
  //use reverse-order
  let reverseHistory = historyCollection.reverse();
  let startIndex = pageSize * (num-1);
  let endIndex = pageSize * num;
  console.log("getPage ", startIndex, endIndex);
  let page = reverseHistory.slice(startIndex, endIndex);
  let markup = "";

  for(let i = 0; i < page.length; i ++) {
    markup += '<tr>';
    markup += '<th scope="row" class="table-row">' + timeConverter(historyCollection[i].date) + '</th>';
    markup += '<td>' + JSON.stringify(historyCollection[i].value) + '</td>';
    markup += '</tr>';
  }

  return markup;
}

function handlePageChange(pagenum) {
  console.log("handle page change ", pagenum);
  currentPage = pagenum;
  let markup = getPage(pagenum);
  $('#pageContent').html(markup);
  $('#pagination').html(getPagination());
}

function getPagination() {
  let markup = "";
  console.log("half", halfPage);

  let startPage;
  if(currentPage - halfPage > 1) {
    startPage = currentPage - halfPage
  }else{
    startPage = 1;
  }

  let endPage;
  if(currentPage + halfPage > totalPages || totalPages < maxPages) {
    endPage = totalPages;
  }else{
    if(currentPage < halfPage && totalPages > halfPage+1) {
      endPage = maxPages;
    }else{
      endPage = currentPage + halfPage;
    }
  }

  console.log("pages", startPage, endPage);

  if(endPage - startPage < maxPages) {
    console.log("less than maxPages");
    let tmpStart, tmpEnd;
    if(maxPages - (endPage - startPage) < maxPages-1) {
      tmpStart = endPage - (maxPages-1);
    }else{
      tmpStart = endPage - (maxPages - (endPage - startPage)-1);
    }

    if(tmpStart >= 1) {
      startPage = tmpStart;
    }else if(tmpStart <= 0) {
      startPage = 1;
    }else{ //add pages to end
      tmpEnd = endPage + (maxPages - (endPage - startPage)-1);
      if(tmpEnd < totalPages) {
        endPage = tmpEnd;
      }else{
        endPage = totalPages;
      }
    }
  }

  console.log("final pages", startPage, endPage);

  let pages = totalPages > maxPages ? maxPages : totalPages;

  if(totalPages > maxPages && (startPage - halfPage > 1 || currentPage - halfPage > 1)) {
    markup += '<li class="page-item" onclick="handlePrevPage()"><a class="page-link" href="#" tabindex="-1">Previous</a></li>';
  }

  for(let i = startPage; i <= endPage; i ++) {
    if(i == currentPage) {
      markup += ' <li class="page-item active"><a class="page-link" href="#">' + i + '<span class="sr-only">(current)</span></a></li>';
    }else{
      markup += '<li class="page-item" onclick="handlePageChange(' + i + ')"><a class="page-link" href="#">' + i + '</a></li>';
    }
  }

  if(endPage < totalPages) {
    markup += '<li class="page-item" onclick="handleNextPage()"><a class="page-link" href="#">Next</a></li>';
  }

  return markup;
}

function handleNextPage() {
  if(currentPage + (halfPage * 2) < totalPages) {
    handlePageChange(currentPage + halfPage * 2);
  }else{
    handlePageChange(totalPages);
  }
}

function handlePrevPage() {
  if(currentPage - (halfPage * 2) < 1) {
    handlePageChange(1);
  }else{
    handlePageChange(currentPage - halfPage * 2);
  }
}

function convertToChartSeries(history) {
  let series = [];

  for(let i = 0; i < history.length; i ++) { //go thru each history entry
    for(let j = 0; j < history[i].value.rates.length; j ++) { //go thru each rate
      if(history[i].value.rates[j].currency == "USD") {
        series.push([ history[i].date, history[i].value.rates[j].rate ]);
        break;
      }
    }
  }

  return series;
}

$(document).ready(function() {
  (<any>$('body')).bootstrapMaterialDesign();
  (<any>$('[data-toggle="tooltip"]')).tooltip();
  handlePageChange(1);

  let chartSeries = convertToChartSeries(historyCollection);

  Highcharts.chart('chart-container', {
    chart: {
      zoomType: 'x'
    },
    title: {
      text: 'SYS/USD exchange rate over time'
    },
    subtitle: {
      text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        text: 'Exchange rate'
      }
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1
          },
          stops: [
            [0, Highcharts.getOptions().colors[0]],
            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
          ]
        },
        marker: {
          radius: 2
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1
          }
        },
        threshold: null
      }
    },

    series: [{
      type: 'area',
      name: 'SYS/USD',
      data: chartSeries
    }]
  });
});