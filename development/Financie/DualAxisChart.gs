function createDualAxisChartAndSavePDF() {
  var sheet = SpreadsheetApp.getActiveSheet();
  if (!sheet) {
    SpreadsheetApp.getUi().alert('アクティブなシートが見つかりません。');
    return;
  }
  
  var raw = sheet.getDataRange()
    .offset(1, 0, sheet.getLastRow() - 1, 5)
    .getValues();
  
  if (!raw.length) {
    SpreadsheetApp.getUi().alert('データがありません。');
    return;
  }
  
  // フィルタ＆Date→タイムスタンプ変換して配列に
  var chartData = raw.reduce(function(arr, row) {
    var date = row[0],
      amount = row[1],
      tokens = row[2],
      type = row[4];
    if (!date) return arr;
    if (type === 'buy' && amount >= 100000) arr.push([date.getTime(), amount, 0]);
    if (type === 'sell' && tokens >= 250) arr.push([date.getTime(), 0, tokens]);
    return arr;
  }, []);
  
  if (!chartData.length) {
    SpreadsheetApp.getUi().alert('大口データがありません。');
    return;
  }
  

  // HTML をテンプレートリテラルで組み立て
  var htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://www.gstatic.com/charts/loader.js"></script>
  <script>
    const rawData = ${JSON.stringify(chartData)};

    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      const data = new google.visualization.DataTable();
      data.addColumn('datetime', '日時');
      data.addColumn('number', '大口購入');
      data.addColumn('number', '大口売却トークン');
      rawData.forEach(item => {
        data.addRow([new Date(item[0]), item[1], item[2]]);
      });

      const dates = rawData.map(i => new Date(i[0])).sort((a, b) => a - b);
      const minD = new Date(
        dates[0].getFullYear(),
        dates[0].getMonth(),
        dates[0].getDate()
      );
      const maxD = new Date(
        dates[dates.length - 1].getFullYear(),
        dates[dates.length - 1].getMonth(),
        dates[dates.length - 1].getDate()
      );
      const ticks = [];
      for (let d = new Date(minD); d <= maxD; d.setDate(d.getDate() + 3)) {
        ticks.push(new Date(d));
      }

      const options = {
        title: '大口分布',
        width: 900,
        height: 500,
        hAxis: {
          title: '日付',
          format: 'M/d',
          ticks: ticks,
          gridlines: { color: '#eee' }
        },
        vAxes: {
          0: { title: '購入金額', viewWindow: { min: 0 } },
          1: { title: '売却トークン数', viewWindow: { min: 0 } }
        },
        series: {
          0: { type: 'scatter', targetAxisIndex: 0, pointSize: 5, color: '#109618', displayName: '大口購入' },
          1: { type: 'scatter', targetAxisIndex: 1, pointSize: 5, color: '#dc3912', displayName: '大口売却トークン' }
        },
        chartArea: { left: 80, top: 50, right: 120, bottom: 70 },
        legend: { position: 'bottom', alignment: 'center' }
      };

      const chart = new google.visualization.ComboChart(
        document.getElementById('chart_div')
      );
      chart.draw(data, options);
      
      // SVG保存ボタンを表示
      document.getElementById('save-svg').style.display = 'block';
      
      // SVG保存処理
      document.getElementById('save-svg').addEventListener('click', function() {
        // チャートをSVGとしてエクスポート
        var svgData = chart.getImageURI();
        google.script.run
          .withSuccessHandler(function(url) {
            window.open(url, '_blank');
          })
          .saveChartAsSVG(svgData);
      });
    }
  </script>
</head>
<body>
  <div id="chart_div" style="width:900px; height:500px;"></div>
  <button id="save-svg" style="display: none; margin-top: 20px;">SVGとして保存</button>
</body>
</html>
`;

  // HTMLをBlobに変換
  var htmlBlob = Utilities.newBlob(htmlContent, 'text/html', 'chart.html');
  
  // HTMLファイルをGoogle Driveに保存
  var htmlFile = DriveApp.createFile(htmlBlob);
  
  // ダイアログを表示
  var htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(900)
    .setHeight(600);
    
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Dual Axis Chart');
}

// サーバーサイドでSVGを保存する関数
function saveChartAsSVG(svgData) {
  // SVGデータをBase64からデコード
  var svg = Utilities.base64Decode(svgData.split(',')[1]);
  
  // SVGをBlobに変換
  var svgBlob = Utilities.newBlob(svg, 'image/svg+xml', 'chart.svg');
  
  // Google DriveにSVGを保存
  var svgFile = DriveApp.createFile(svgBlob);
  
  // SVGファイルのURLを返す
  return svgFile.getUrl();
}
