function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (e.method === 'OPTIONS') {
    return ContentService.createTextOutput('')
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("assets");
    
    // 處理 GET 請求（讀取數據）
    if (e.method === 'GET') {
      var wallet = e.parameter.wallet;
      var callback = e.parameter.callback;
      
      if (!wallet) {
        var response = { 
          success: false,
          error: 'Wallet address is required'
        };
        return formatResponse(response, callback, headers);
      }

      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var walletCol = 0; // 錢包地址在第一列
      var assetsCol = 1; // 資產數組在第二列

      // 查找錢包地址
      for (var i = 0; i < values.length; i++) {
        if (values[i][walletCol] === wallet) {
          var response = { 
            success: true,
            assets: values[i][assetsCol]
          };
          return formatResponse(response, callback, headers);
        }
      }

      // 如果找不到錢包地址，返回空數組
      var response = { 
        success: true,
        assets: '[]'
      };
      return formatResponse(response, callback, headers);
    }
    
    // 處理 POST 請求（寫入數據）
    var data = JSON.parse(e.postData.contents);
    var wallet = data.wallet;
    var assets = data.assets;
    var assetsJson = JSON.stringify(assets);
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var walletCol = 0;
    
    var rowIndex = -1;
    for (var i = 0; i < values.length; i++) {
      if (values[i][walletCol] === wallet) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      sheet.appendRow([wallet, assetsJson]);
    } else {
      sheet.getRange(rowIndex, 2).setValue(assetsJson);
    }
    
    var response = { 
      success: true,
      message: "Assets updated successfully"
    };
    return formatResponse(response, null, headers);
  } catch (error) {
    var response = { 
      success: false,
      error: error.toString()
    };
    return formatResponse(response, null, headers);
  }
}

function formatResponse(data, callback, headers) {
  var response = JSON.stringify(data);
  
  if (callback) {
    // 如果是 JSONP 請求，返回 JavaScript
    return ContentService.createTextOutput(callback + '(' + response + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT)
      .setHeaders(headers);
  } else {
    // 如果是普通請求，返回 JSON
    return ContentService.createTextOutput(response)
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
} 