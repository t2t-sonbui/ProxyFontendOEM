'use strict';
/** Create a name space for the application. */
var ArdublocklyServer = ArdublocklyServer || {};
ArdublocklyServer.wsconnection;
ArdublocklyServer.evtSource;

ArdublocklyServer.createEvtSource = function () {
  if (typeof (EventSource) !== "undefined") {
    console.log("EventSource has support!");
    ArdublocklyServer.evtSource = new EventSource('/sse');
    ArdublocklyServer.evtSource.onopen = function () {
      console.log('Server connected :)');
    };
    ArdublocklyServer.evtSource.onmessage = function (event) {
      console.log(event.data);
    };
    ArdublocklyServer.evtSource.onerror = function (e) {
      console.log("EventSource failed.");
      ArdublocklyServer.evtSource.close();
    };

    ArdublocklyServer.evtSource.addEventListener('shutdown-event', function (event) {
      console.log(event.data);
      setTimeout(function () {
        ArdublocklyServer.closeEvtSource();
      }, 3000);

    });
  } else {
    console.log("Sorry, your browser does not support server-sent events...");
  }
}

ArdublocklyServer.closeEvtSource = function () {
  if (ArdublocklyServer.evtSource && (ArdublocklyServer.evtSource.readyState != EventSource.CLOSED)) {
    console.log("close event source");
    ArdublocklyServer.evtSource.close();
    alert("Sytem stopped connection! Please refresh page");
  }
  //  EventSource.readyState Read only A number representing the state of the connection. Possible values are CONNECTING (0), OPEN (1), or CLOSED (2).
};

ArdublocklyServer.createWs = function () {
  var array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  var id = array[0].toString();
  console.log(id);

  if ((!ArdublocklyServer.wsconnection) || (ArdublocklyServer.wsconnection.readyState === WebSocket.CLOSED)) {

    ArdublocklyServer.wsconnection = new WebSocket('ws://' + document.location.host + '/ws/' + id);

    ArdublocklyServer.wsconnection.onopen = function (event) {
      console.log("Ws Connected");
    };
    ArdublocklyServer.wsconnection.onclose = function (event) {
      console.log("WebSocket is closed.");
    };
    ArdublocklyServer.wsconnection.onerror = function (error) {

      console.log('WebSocket Error ', error);
    };
    ArdublocklyServer.wsconnection.onmessage = function (e) {
      var res = JSON.parse(e.data);
      if (res.topic === "MODEM_CONNECT_REMOVE") {
        console.log('MODEM_CONNECT_REMOVE' + res.data);
        var objArray = JSON.parse(res.data);
        Ardublockly.removeProxyDashboardStatus(objArray);
      } else if (res.topic === "MODEM_CONNECT_ADDED") {
        console.log('MODEM_CONNECT_ADDED' + res.data);
        var objArray = JSON.parse(res.data);
        var postObject = {
          idKeys: objArray
        };
        Ardublockly.addNewProxyDashboardStatus(postObject);
      }
      else if (res.topic === "MODEM_CONNECT_UPDATE") {
        console.log('MODEM_CONNECT_UPDATE' + res.data);
        var objArray = JSON.parse(res.data);
        var postObject = {
          idKeys: objArray
        };
        Ardublockly.updateProxyDashboardStatus(postObject);
      } else if (res.topic === "HOME_NETWORK_CHANGE") {
        console.log('HOME_NETWORK_CHANGE' + res.data);
        var objArray = JSON.parse(res.data);
        Ardublockly.jsonUpdateTableNetwork(objArray);
      } else if (res.topic === "IP_RE_NEW") {

        console.log('IP_RE_NEW' + res.data);
        var obj = JSON.parse(res.data);
        Ardublockly.jsonUpdateRowIp(obj);
      } else if (res.topic === "EXECUTE_ACTION_RESPONSE") {
        console.log('EXECUTE_ACTION_RESPONSE ' + res.data);

        var btn_sync_proxy = document.getElementById("btn_sync_proxy");
        btn_sync_proxy.disabled = false;

      } else if (res.topic === "SHUTDOWN_EVENT") {
        console.log('SHUTDOWN_EVENT' + res.data);
        setTimeout(function () {
          ArdublocklyServer.closeWs();
        }, 100);

        setTimeout(function () {
          location.reload()
        }, 30000);
      }

    };
  } else if (ArdublocklyServer.wsconnection.readyState === WebSocket.OPEN) {
    console.log("Ws still Connected");
  }
};

ArdublocklyServer.closeWs = function () {
  if ((ArdublocklyServer.wsconnection)) {
    ArdublocklyServer.wsconnection.onclose = function () { }; // disable onclose handler first
    ArdublocklyServer.wsconnection.close();
  }
};

ArdublocklyServer.sendWsRequest = function (sketchFolder, code) {
  console.log(code);
  if ((!ArdublocklyServer.wsconnection) || (ArdublocklyServer.wsconnection.readyState === WebSocket.CLOSED)) {

    Ardublockly.largeIdeButtonSpinner(true);
    ArdublocklyServer.wsconnection = new WebSocket('ws://' + document.location.host + '/ws/' + sketchFolder);

    ArdublocklyServer.wsconnection.onopen = function (event) {
      console.log("Ws Connected");
      var dataBack = ArdublocklyServer.prepareCompileStateUpdate();
      Ardublockly.arduinoIdeOutput(dataBack);
      var reqId = Math.round(new Date().getTime() / 1000).toString(16);

      var msg = {
        action: "compile",
        data: code,
        requestId: reqId
      };
      ArdublocklyServer.wsconnection.send(JSON.stringify(msg));
    };
    ArdublocklyServer.wsconnection.onclose = function (event) {
      Ardublockly.largeIdeButtonSpinner(false);
      console.log("WebSocket is closed now.");
    };
    ArdublocklyServer.wsconnection.onerror = function (error) {
      Ardublockly.largeIdeButtonSpinner(false);
      console.log('WebSocket Error ', error);
    };
    ArdublocklyServer.wsconnection.onmessage = function (e) {
      var res = JSON.parse(e.data);
      if (res.code === "UPDATE") {
        ArdublocklyServer.updateCompileState(res);
      } else if (res.code === "ERROR") {
        Ardublockly.largeIdeButtonSpinner(false);
        ArdublocklyServer.updateErrorState(res);

      } else if (res.code === "DONE") {
        Ardublockly.largeIdeButtonSpinner(false);
        ArdublocklyServer.downloadHex("/code?folder=" + sketchFolder);
      } else if (res.code === "CANCEL") {
        Ardublockly.largeIdeButtonSpinner(false);
      }
    };

  } else if (ArdublocklyServer.wsconnection.readyState === WebSocket.OPEN) {
    console.log("Ws still Connected");
    Ardublockly.largeIdeButtonSpinner(true);
    var dataBack = ArdublocklyServer.prepareCompileStateUpdate();
    Ardublockly.arduinoIdeOutput(dataBack);

    var reqId = Math.round(new Date().getTime() / 1000).toString(16);
    var msg = {
      action: "compile",
      data: code,
      requestId: reqId
    };
    ArdublocklyServer.wsconnection.send(JSON.stringify(msg));
  }

};

ArdublocklyServer.downloadFile = function (url) {
  var request = ArdublocklyServer.createRequest();
  var onReady = function () {
    if (request.readyState == 4) {
      if (request.status == 200) {
        var filename = "";
        var disposition = request.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        var type = request.getResponseHeader('Content-Type');

        var blob = typeof File === 'function' ?
          new File([this.response], filename, {
            type: type
          }) :
          new Blob([this.response], {
            type: type
          });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          } else {
            window.location = downloadUrl;
          }
          setTimeout(function () {
            URL.revokeObjectURL(downloadUrl);
          }, 100); // cleanup
        }
      }
    }
  };

  try {
    request.open("GET", url, true);
    request.responseType = 'arraybuffer';
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.onreadystatechange = onReady;
    request.send();
  } catch (e) {
    // Nullify callback to indicate error
    throw e;
  }

};

ArdublocklyServer.getTextFileContent = function (url, cb) {
  var request = ArdublocklyServer.createRequest();
  var onReady = function () {
    if (request.readyState == 4) {
      if (request.status == 200) {
        cb(request.responseText);
      } else {
        // return a null element which will be dealt with in the front end
        cb(null);
      }
    }
  };

  try {
    request.open("GET", url, true);
    request.setRequestHeader('Content-type', "text/html; charset=utf-8");
    request.onreadystatechange = onReady;
    request.send();
  } catch (e) {
    // Nullify callback to indicate error
    cb(null);
    throw e;
  }
};


/**
 * Reads JSON data from the server and forwards formatted JavaScript object.
 * @param {!string} url Location for the JSON data.
 * @param {!function} jsonDataCb Callback with JSON object or null for error.
 */
ArdublocklyServer.getJson = function (url, callback) {
  ArdublocklyServer.sendRequest(url, 'GET', 'application/json', null, callback);
};

/**
 * Sends JSON data to the ArduBlocklyServer.
 * @param {!string} url Requestor URL.
 * @param {!string} json JSON string.
 * @param {!function} callback Request callback function.
 */
ArdublocklyServer.putJson = function (url, json, callback) {
  ArdublocklyServer.sendRequest(url, 'PUT', 'application/json', json, callback);
};

/**
 * Sends a request to the Ardubloockly Server that returns a JSON response.
 * @param {!string} url Requestor URL.
 * @param {!string} method HTTP method.
 * @param {!string} contentType HTTP content type.
 * @param {string} jsonObjSend JavaScript object to be parsed into JSON to send.
 * @param {!function} cb Request callback function, takes a single input for a
 *     parsed JSON object.
 */
ArdublocklyServer.sendRequest = function (
  url, method, contentType, jsonObjSend, cb) {
  var request = ArdublocklyServer.createRequest();

  // The data received is JSON, so it needs to be converted into the right
  // format to be displayed in the page.
  var onReady = function () {
    if (request.readyState == 4) {
      if (request.status == 200) {
        var jsonObjReceived = null;
        try {
          jsonObjReceived = JSON.parse(request.responseText);
        } catch (e) {
          console.error('Incorrectly formatted JSON data from ' + url);
          throw e;
        }
        cb(jsonObjReceived);
      } else {
        // return a null element which will be dealt with in the front end
        cb(null);
      }
    }
  };

  try {
    request.open(method, url, true);
    request.setRequestHeader('Content-type', contentType);
    request.onreadystatechange = onReady;
    request.send(JSON.stringify(jsonObjSend));
  } catch (e) {
    // Nullify callback to indicate error
    cb(null);
    throw e;
  }
};

/** @return {XMLHttpRequest} An XML HTTP Request multi-browser compatible. */
ArdublocklyServer.createRequest = function () {
  var request = null;
  try {
    // Firefox, Chrome, IE7+, Opera, Safari
    request = new XMLHttpRequest();
  } catch (e) {
    // IE6 and earlier
    try {
      request = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {
      try {
        request = new ActiveXObject('Microsoft.XMLHTTP');
      } catch (e) {
        throw 'Your browser does not support AJAX. You will not be able to' +
        'use all of features.';
        request = null;
      }
    }
  }
  return request;
};

ArdublocklyServer.requestSystemRunConfig = function (callback) {
  ArdublocklyServer.getJson('/system/config', callback);
};

ArdublocklyServer.saveSystemRunConfig = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/system/config', 'POST', 'application/json', configObj, callback);
};


ArdublocklyServer.requestSyncModemConnect = function (callback) {
  ArdublocklyServer.getJson('/proxy/sync', callback);
};

ArdublocklyServer.requestRunningInfo = function (callback) {
  ArdublocklyServer.getJson('/system/info', callback);
};

ArdublocklyServer.requestDeviceInfo = function (deviceId, callback) {
  ArdublocklyServer.getJson('/proxy/device/' + deviceId, callback);
};

ArdublocklyServer.requestDeviceNetworkInfo = function (deviceId, callback) {
  ArdublocklyServer.getJson('/proxy/network/' + deviceId, callback);
};

ArdublocklyServer.requestProxyStatus = function (proxyId, callback) {
  ArdublocklyServer.getJson('/proxy/info/' + proxyId, callback);
};

ArdublocklyServer.requestProxyInternetIp = function (proxyId, callback) {
  ArdublocklyServer.getJson('/proxy/ip/' + proxyId, callback);
};


ArdublocklyServer.requestProxyConfig = function (proxyId, callback) {
  ArdublocklyServer.getJson('/proxy/config/' + proxyId, callback);
};

ArdublocklyServer.requestModemUssd = function (proxyId, callback) {
  ArdublocklyServer.getJson('/proxy/ussd/' + proxyId, callback);
};

ArdublocklyServer.requestModemCancelUssd = function (proxyId, callback) {
  ArdublocklyServer.getJson('/proxy/ussd/' + proxyId + '/cancel', callback);
};

ArdublocklyServer.requestSendOrAnswerUssd = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/proxy/ussd', 'POST', 'application/json', configObj, callback);
};

ArdublocklyServer.requestAllProxyStatus = function (callback) {
  ArdublocklyServer.getJson('/proxy', callback);
};

ArdublocklyServer.requestAllSingleProxyConfig = function (callback) {
  ArdublocklyServer.getJson('/proxy/config', callback);
};

ArdublocklyServer.saveSettingsSingle = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/proxy/config', 'POST', 'application/json', configObj, callback);
};

ArdublocklyServer.requestListProxyStatus = function (listObj, callback) {

  ArdublocklyServer.sendRequest(
    '/proxy/info', 'POST', 'application/json', listObj, callback);
};

ArdublocklyServer.requestAllProxyInternetIp = function (callback) {
  ArdublocklyServer.getJson('/proxy/ip', callback);
};

ArdublocklyServer.requestAllProxyRunStatus = function (callback) {
  ArdublocklyServer.getJson('/proxy/status', callback);
};

ArdublocklyServer.requestListProxyInternetIp = function (listObj, callback) {
  ArdublocklyServer.sendRequest(
    '/proxy/ip', 'POST', 'application/json', listObj, callback);
};


ArdublocklyServer.requestNewProxyInternetIp = function (newIpObj, callback) {
  ArdublocklyServer.sendRequest(
    '/proxy', 'POST', 'application/json', newIpObj, callback);
};

ArdublocklyServer.requestEnableProxyInternetData = function (newIpObj, callback) {
  ArdublocklyServer.sendRequest(
    '/proxy?data=enable', 'POST', 'application/json', newIpObj, callback);
};

ArdublocklyServer.requestDisableProxyInternetData = function (newIpObj, callback) {
  ArdublocklyServer.sendRequest(
    '/proxy?data=disable', 'POST', 'application/json', newIpObj, callback);
};

ArdublocklyServer.requestEnableProxyRunning = function (cmdObj, callback) {
  ArdublocklyServer.sendRequest(
    '/proxy', 'POST', 'application/json', cmdObj, callback);
};

ArdublocklyServer.requestSettings = function (callback) {
  ArdublocklyServer.getJson('/system/setting', callback);
};

ArdublocklyServer.saveSettings = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/system/proxy_common?apply=all', 'POST', 'application/json', configObj, callback);
};

ArdublocklyServer.saveSettingsOnlyNew = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/system/proxy_common?apply=new', 'POST', 'application/json', configObj, callback);
};



ArdublocklyServer.requestLicense = function (callback) {
  ArdublocklyServer.getJson('/system/license/active', callback);
};

ArdublocklyServer.requestActiveLicense = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/system/license/active', 'POST', 'application/json', configObj, callback);
};

ArdublocklyServer.requestLatestBuild = function (callback) {
  ArdublocklyServer.getJson('/system/latest', callback);
};

ArdublocklyServer.requestSystemAction = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/system/action', 'POST', 'application/json', configObj, callback);
};

ArdublocklyServer.requestAddSchedule = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/system/schedule/create', 'POST', 'application/json', configObj, callback);
};

ArdublocklyServer.requestDeleteSchedule = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/system/schedule/delete', 'POST', 'application/json', configObj, callback);
};
ArdublocklyServer.requestUpdateSchedule = function (configObj, callback) {
  ArdublocklyServer.sendRequest(
    '/system/schedule/update', 'POST', 'application/json', configObj, callback);
};

ArdublocklyServer.requestAllSchedule = function (callback) {
  ArdublocklyServer.getJson('/system/schedule', callback);
};
