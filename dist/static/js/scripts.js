//NOTE: intentionally cheating on the TS here, this was intended to be light
var Highcharts;
var pageSize = window.pageSize;
var maxPages = window.maxPages;
var historyCollection = window.updateHistory;
console.log("History:", historyCollection);
var currentPage = 1;
var totalPages = Math.ceil(historyCollection.length / pageSize);
var halfPage = Math.floor(maxPages / 2);
var formatAMPM = function (date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    if (seconds.toString().length == 1) {
        seconds = "0" + seconds;
    }
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
};
var timeConverter = function (UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    //let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    var time = date + ' ' + month + ' ' + year + ' ' + formatAMPM(a);
    return time;
};
function getPage(num) {
    //use reverse-order
    var reverseHistory = historyCollection.reverse();
    var startIndex = pageSize * (num - 1);
    var endIndex = pageSize * num;
    console.log("getPage ", startIndex, endIndex);
    var page = reverseHistory.slice(startIndex, endIndex);
    var markup = "";
    for (var i = 0; i < page.length; i++) {
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
    var markup = getPage(pagenum);
    $('#pageContent').html(markup);
    $('#pagination').html(getPagination());
}
function getPagination() {
    var markup = "";
    console.log("half", halfPage);
    var startPage;
    if (currentPage - halfPage > 1) {
        startPage = currentPage - halfPage;
    }
    else {
        startPage = 1;
    }
    var endPage;
    if (currentPage + halfPage > totalPages || totalPages < maxPages) {
        endPage = totalPages;
    }
    else {
        if (currentPage < halfPage && totalPages > halfPage + 1) {
            endPage = maxPages;
        }
        else {
            endPage = currentPage + halfPage;
        }
    }
    console.log("pages", startPage, endPage);
    if (endPage - startPage < maxPages) {
        console.log("less than maxPages");
        var tmpStart = void 0, tmpEnd = void 0;
        if (maxPages - (endPage - startPage) < maxPages - 1) {
            tmpStart = endPage - (maxPages - 1);
        }
        else {
            tmpStart = endPage - (maxPages - (endPage - startPage) - 1);
        }
        if (tmpStart >= 1) {
            startPage = tmpStart;
        }
        else if (tmpStart <= 0) {
            startPage = 1;
        }
        else {
            tmpEnd = endPage + (maxPages - (endPage - startPage) - 1);
            if (tmpEnd < totalPages) {
                endPage = tmpEnd;
            }
            else {
                endPage = totalPages;
            }
        }
    }
    console.log("final pages", startPage, endPage);
    var pages = totalPages > maxPages ? maxPages : totalPages;
    if (totalPages > maxPages && (startPage - halfPage > 1 || currentPage - halfPage > 1)) {
        markup += '<li class="page-item" onclick="handlePrevPage()"><a class="page-link" href="#" tabindex="-1">Previous</a></li>';
    }
    for (var i = startPage; i <= endPage; i++) {
        if (i == currentPage) {
            markup += ' <li class="page-item active"><a class="page-link" href="#">' + i + '<span class="sr-only">(current)</span></a></li>';
        }
        else {
            markup += '<li class="page-item" onclick="handlePageChange(' + i + ')"><a class="page-link" href="#">' + i + '</a></li>';
        }
    }
    if (endPage < totalPages) {
        markup += '<li class="page-item" onclick="handleNextPage()"><a class="page-link" href="#">Next</a></li>';
    }
    return markup;
}
function handleNextPage() {
    if (currentPage + (halfPage * 2) < totalPages) {
        handlePageChange(currentPage + halfPage * 2);
    }
    else {
        handlePageChange(totalPages);
    }
}
function handlePrevPage() {
    if (currentPage - (halfPage * 2) < 1) {
        handlePageChange(1);
    }
    else {
        handlePageChange(currentPage - halfPage * 2);
    }
}
function convertToChartSeries(history) {
    var series = [];
    for (var i = 0; i < history.length; i++) {
        for (var j = 0; j < history[i].value.rates.length; j++) {
            if (history[i].value.rates[j].currency == "USD") {
                series.push([history[i].date, history[i].value.rates[j].rate]);
                break;
            }
        }
    }
    return series;
}
$(document).ready(function () {
    $('body').bootstrapMaterialDesign();
    $('[data-toggle="tooltip"]').tooltip();
    handlePageChange(1);
    var chartSeries = convertToChartSeries(historyCollection);
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
//# sourceMappingURL=scripts.js.map