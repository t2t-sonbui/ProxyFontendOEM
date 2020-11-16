'use strict';

/** Create a namespace for the application. */
var Ardublockly = Ardublockly || {};
Ardublockly.showToastTimer;
Ardublockly.toastShowing;

/** Initialises all the design related JavaScript. */
Ardublockly.designJsInit = function () {
  Ardublockly.loadFirstScreen();
};

Ardublockly.loadFirstScreen = function () {
  // Ardublockly.showPage(event, 'show_dashboad');
  // var dashboardMenu = document.getElementById('menu_dashboard');
  // dashboardMenu.style.display = "block";
  // dashboardMenu.className += " w3-blue";
};


Ardublockly.changeCronjobAdd = function () {
  var x = document.getElementById("add_job_select").value;
  var add_list_id = document.getElementById("add_list_id");


  if (x === "RENEW_IP_ALL") {
    add_list_id.disabled = true;


  } else if (x === "RENEW_IP_SPECIFY") {
    add_list_id.disabled = false;
  }
};

Ardublockly.showPage = function (evt, linkName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("myLink");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-blue", "");
  }
  document.getElementById(linkName).style.display = "block";
  evt.currentTarget.className += " w3-blue";
};
/**
 * Displays a short message for 4 seconds in the form of a Materialize toast.
 * @param {!string} message Text to be temporarily displayed.
 */
Ardublockly.MaterialToast = function (message) {

  var x = document.getElementById("snackbar");
  if (Ardublockly.toastShowing) {
    window.clearInterval(Ardublockly.showToastTimer);
    x.className = x.className.replace("show", "");
    Ardublockly.toastShowing = false;
  }

  if (message) x.innerHTML = message;
  x.className = "show";
  Ardublockly.toastShowing = true;
  Ardublockly.showToastTimer = setTimeout(function () {
    x.className = x.className.replace("show", "");
    Ardublockly.toastShowing = false;
  }, 4000);
};


Ardublockly.jsonUpdateRunningInfo = function (jsonObj) {
  if (jsonObj) {
    var run_info_memory = document.getElementById("run_info_memory");
    run_info_memory.innerHTML = jsonObj.memoryUse;
    var run_info_cpu = document.getElementById("run_info_cpu");
    run_info_cpu.innerHTML = jsonObj.cpuLoad;
  }
};



Ardublockly.showDashboadLoading = function (message) {
  var x = document.getElementById("dashboard_loading");
  if (message) {
    var conttentEl = document.getElementById("dashboard_loading_content");
    conttentEl.innerHTML = message;
  }

  if (x.className.indexOf("w3-show") == -1) {
    x.className += " w3-show";
  }
};
Ardublockly.hideDashboadLoading = function () {
  var x = document.getElementById("dashboard_loading");
  x.className = x.className.replace(" w3-show", "");
};
Ardublockly.showDashboadProxyStatus = function () {
  var x = document.getElementById("dashboard_list_proxy");
  if (x.className.indexOf("w3-show") == -1) {
    x.className += " w3-show";
  }
};


Ardublockly.hideDashboadProxyStatus = function () {
  var x = document.getElementById("dashboard_list_proxy");
  x.className = x.className.replace(" w3-show", "");
};

Ardublockly.startGettingIPSpin = function (row) {
  var areNew = row.getElementsByTagName("td")[7];
  var td = areNew.getElementsByClassName("a-renew")[0];
  var actionEl = td.lastChild;
  if (actionEl.className.indexOf("w3-spin") == -1) {
    actionEl.className += " w3-spin";
  }
};
Ardublockly.stopGettingIPSpin = function (row) {
  var areNew = row.getElementsByTagName("td")[7];
  var td = areNew.getElementsByClassName("a-renew")[0];
  var actionEl = td.lastChild;
  actionEl.className = actionEl.className.replace(" w3-spin", "");
};


/** Opens the modal that displays the "not connected to server" message. */
Ardublockly.openNotConnectedModal = function () {
  document.getElementById('modal_notify').style.display = 'block';
};

Ardublockly.openAddCronjobModal = function () {
  document.getElementById('modal_add_cronjob').style.display = 'block';
};

/** Opens the modal that displays the Settings. */
Ardublockly.openSettingsModal = function (proxyId) {
  document.getElementById('modal_proxy').style.display = 'block';
};

Ardublockly.openLicensesModal = function (proxyId) {
  document.getElementById('modal_license').style.display = 'block';
};

Ardublockly.setBaseRestoreHtml = function (newEl, elementId) {
  if (newEl === null)
    return Ardublockly.openNotConnectedModal();

  var compLocIp = document.getElementById(elementId);
  if (compLocIp != null) {
    compLocIp.value = newEl.value || compLocIp.value; //|| '1880';
    compLocIp.style.cssText = newEl.style.cssText;
  }
};

Ardublockly.jsonToLicenseHtml = function (jsonObj) {
  if (jsonObj) {
    var metaObj = JSON.parse(jsonObj.metaData);
    var license_amount = document.getElementById("license_amount");
    license_amount.innerHTML = metaObj.amount;

    var license_active_type = document.getElementById("license_active_type");
    license_active_type.innerHTML = metaObj.activeType;

    var license_active_end = document.getElementById("license_active_end");
    license_active_end.innerHTML = metaObj.expDateTime;

    var license_active_status = document.getElementById("license_active_status");

    if (jsonObj.errorType === '06e4b636f9dad8a9cdd66a6b2eb36b48') {
      license_active_status.innerHTML = 'License Expired';
    }
    else if (jsonObj.errorType === '09ea096e338bd1599cc2534168c4ce21') {
      license_active_status.innerHTML = 'License Invalid';
    }
    else {
      license_active_status.innerHTML = jsonObj.errorType;
    }



    var license_active_date = document.getElementById("license_active_date");
    license_active_date.innerHTML = jsonObj.dateActive;

    var license_active_key = document.getElementById("license_active_key");
    license_active_key.innerHTML = jsonObj.keyActive;

    var license_warn = document.getElementById("license_warn");
    if (metaObj.activeType === "PRO") {
      // license_warn.style.display = 'none';
      if (license_warn.className.indexOf("w3-hide") == -1) {
        license_warn.className += " w3-hide";
      }

    } else {
      // license_warn.style.display = 'block';
      license_warn.className = license_warn.className.replace(" w3-hide", "");
    }
  }

};

Ardublockly.jsonToHtmlTextInput = function (jsonObj, jsonPath) {
  var element = null;
  if (jsonObj) {
    // Simple text input
    element = document.createElement('input');
    element.setAttribute('type', 'text');
    element.style.cssText = '';
    if (jsonObj.errors) {
      element.setAttribute('value', '');
      element.style.cssText = 'border-bottom: 1px solid #f75c51;' +
        'box-shadow: 0 1px 0 0 #d73c30;';
    } else {
      element.setAttribute('value', jsonObj[jsonPath] || '');
    }
  }
  return element;
};

Ardublockly.jsonToHtmlNumberInput = function (jsonObj, jsonPath) {
  var element = null;
  if (jsonObj) {
    // Simple text input
    element = document.createElement('input');
    element.setAttribute('type', 'number');
    element.style.cssText = '';
    if (jsonObj.errors) {
      element.setAttribute('value', '');
      element.style.cssText = 'border-bottom: 1px solid #f75c51;' +
        'box-shadow: 0 1px 0 0 #d73c30;';
    } else {
      element.setAttribute('value', jsonObj[jsonPath] || '');
    }
  }
  return element;
};

Ardublockly.jsonToHtmlDropdown = function (jsonObj, ipSelected) {
  var element = null;
  if (!jsonObj) {
    console.error('Invalid JSON received from server.');
  } else if (jsonObj.errors) {
    console.error('There are errors in the JSON response from server.');
    console.error(jsonObj);
  } else {
    // Drop down list of unknown length with a selected item
    element = document.createElement('select');
    element.name = jsonObj.settings_type; //Will change later
    var defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.text = "Select one IP address";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    element.appendChild(defaultOption);

    for (var i = 0; i < jsonObj.length; i++) {
      if (jsonObj[i].name && jsonObj[i].ipAddress) {
        var option = document.createElement('option');
        option.value = jsonObj[i].ipAddress;
        option.text = jsonObj[i].ipAddress;
        // Check selected option and mark it
        if (option.value == ipSelected) {
          defaultOption.selected = false;
          option.selected = true;
        }
        element.appendChild(option);
      } else {
        console.error('Missing required JSON keys for Drop Down conversion.');
      }
    }
  }

  return element;
};
/**
<tr>
  <td><b class="w3-text-blue">1</b></td>
  <td>eth10/ABCDEF</td>
  <td>Vinaphone-4G,LTE-5/5</td>
  <td>123.456.78.9.10</td>
  <td>192.168.0.9:8001</td>
  <td>Running</td>
  <td class="w3-center"><a onclick="syncTime()" href="#"><i class="material-icons w3-spin w3-text-red">refresh</i></a></td>
</tr>

*/

Ardublockly.jsonToHtmlTableRow = function (jsonArray) {
  if (jsonArray) {
    var table = document.getElementById("proxy_table");
    for (var i = 0; i < jsonArray.length; i++) {
      var jsonObj = jsonArray[i];
      if (jsonObj) {
        var tableLength = table.rows.length;
        // Create an empty <tr> element and add it to the 1st position of the table:
        var row = table.insertRow(tableLength);
        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
        var cellIndex = row.insertCell(0);
        var cellDeviceName = row.insertCell(1);
        var cellDeviceNetwork = row.insertCell(2);
        var cellPublicIp = row.insertCell(3);
        var cellProxyAddr = row.insertCell(4);
        var cellProxyStats = row.insertCell(5);
        var cellUpTime = row.insertCell(6);
        var cellAction = row.insertCell(7);
        //
        row.setAttribute("id", jsonObj.idKey); // idKey value as Element Id
        row.className = "w3-large";

        //
        //Css
        var boldBlueTextEl = document.createElement('b');
        boldBlueTextEl.className = "w3-text-blue";
        boldBlueTextEl.innerHTML = tableLength;
        cellIndex.appendChild(boldBlueTextEl);

        // cellDeviceName.innerHTML = jsonObj.name + "/" + jsonObj.idKey; //eth10/ABCDEF
        cellDeviceName.innerHTML = jsonObj.idKey; //eth10/ABCDEF

        cellDeviceNetwork.innerHTML = jsonObj.modemStatus.netWorkOp + "-" + jsonObj.modemStatus.dataNetworkType + "-" + jsonObj.modemStatus.signalStatus + "-" + jsonObj.modemStatus.dataEnableStatus; //Vinaphone-4G,LTE-5/5


        cellPublicIp.className = "pubip";
        cellPublicIp.innerHTML = "...."

        if (jsonObj.socksEnable) {
          cellProxyAddr.innerHTML = jsonObj.proxyAddress + " [Socks:" + jsonObj.sockPort + "]";
        } else {
          cellProxyAddr.innerHTML = jsonObj.proxyAddress;
        }

        cellProxyStats.innerHTML = jsonObj.proxyStatus;

        cellUpTime.innerHTML = jsonObj.modemStatus.activeTime;

        cellAction.className = "w3-center";

        var areNew = document.createElement('a');
        areNew.setAttribute('href', '#');
        areNew.className = "w3-margin-right w3-text-red a-renew";
        areNew.innerHTML = '<i class="fa fa-sync"></i>'; // w3-spin

        var renewClickHandler = function (row) {
          return function () {
            Ardublockly.proxyActionRenewPublicIp(row.id);
          };
        };

        areNew.addEventListener('ontouchend', renewClickHandler(row));
        areNew.addEventListener('click', renewClickHandler(row));

        cellAction.appendChild(areNew);
        //
        var aSetting = document.createElement('a');
        aSetting.setAttribute('href', '#');
        aSetting.className = "w3-text-green a-setting";
        aSetting.innerHTML = '<i class="fa fa-cog"></i>';


        var moreSettingClickHandler = function (row) {
          return function () {
            Ardublockly.proxyActionMoreSetting(row.id);
          };
        };
        aSetting.addEventListener('ontouchend', moreSettingClickHandler(row));
        aSetting.addEventListener('click', moreSettingClickHandler(row));

        cellAction.appendChild(aSetting);

        Ardublockly.startTimerUpdate(jsonObj.idKey);
      }
    }
  }
};

Ardublockly.showScheduleModelInfo = function (jsonObj) {

  var add_job_select = document.getElementById("add_job_select");
  add_job_select.value = jsonObj.cronType;
  var add_job_cron_express = document.getElementById("add_job_cron_express");
  add_job_cron_express.value = jsonObj.cronExpress;

  var add_list_id = document.getElementById("add_list_id");
  add_list_id.value = "";

  var modemIds = jsonObj.proxyList;
  if (jsonObj.cronType === "RENEW_IP_ALL") {
    add_list_id.disabled = true;
  }
  else {
    add_list_id.disabled = false;
  }
  for (var i = 0; i < modemIds.length; i++) {
    add_list_id.value += modemIds[i] + '\r\n';
  }
}

Ardublockly.jsonUpdateScheduleRow = function (jsonObj) {
  if (jsonObj) {
    var table = document.getElementById("jobs_table");
    var tableLength = table.rows.length;
    if (tableLength > 0) {
      var row = document.getElementById(jsonObj.scheduleId);
      var cellCronExpression = row.getElementsByTagName("td")[1];
      var cellDescribe = row.getElementsByTagName("td")[2];
      var cellListExecute = row.getElementsByTagName("td")[3];


      cellCronExpression.innerHTML = jsonObj.cronExpress;
      var data = jsonObj.cronExpress;
      data = fullsizeToHaftsize(data).trim();
      if (data.length > 0) {
        var result = parseCron(data);
        console.log(result);
        if (result) {
          cellDescribe.innerHTML = result;
        } else {
          emptyParsedCron();
          cellDescribe.innerHTML = "Unknown";
        }
      }
      // cellDescribe.innerHTML = "TODO";

      cellListExecute.className = "pubip";
      cellListExecute.innerHTML = jsonObj.proxyList;
      if (jsonObj.cronType === "RENEW_IP_ALL")
        cellListExecute.innerHTML = "All devices";
    }
  }
};

Ardublockly.addOrUpdateScheduleHtmlTableRow = function (jsonObj) {
  var table = document.getElementById("jobs_table");
  if (jsonObj) {
    if (document.getElementById(jsonObj.scheduleId)) {
      Ardublockly.jsonUpdateScheduleRow(jsonObj);
    }
    else {
      var tableLength = table.rows.length;
      // Create an empty <tr> element and add it to the 1st position of the table:
      var row = table.insertRow(tableLength);
      // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
      var cellIndex = row.insertCell(0);


      var cellCronExpression = row.insertCell(1);
      var cellDescribe = row.insertCell(2);
      var cellListExecute = row.insertCell(3);
      var cellAction = row.insertCell(4);
      //
      row.setAttribute("id", jsonObj.scheduleId); // scheduleId value as Element Id
      row.className = "w3-large";

      //
      //Css
      var boldBlueTextEl = document.createElement('b');
      boldBlueTextEl.className = "w3-text-blue";
      boldBlueTextEl.innerHTML = tableLength;
      cellIndex.appendChild(boldBlueTextEl);

      cellCronExpression.innerHTML = jsonObj.cronExpress;

      var data = jsonObj.cronExpress;
      data = fullsizeToHaftsize(data).trim();
      if (data.length > 0) {
        var result = parseCron(data);
        console.log(result);
        if (result) {
          cellDescribe.innerHTML = result;
        } else {
          emptyParsedCron();
          cellDescribe.innerHTML = "Unknown";
        }
      }
      // cellDescribe.innerHTML = "TODO";

      cellListExecute.className = "pubip";
      cellListExecute.innerHTML = jsonObj.proxyList;
      if (jsonObj.cronType === "RENEW_IP_ALL")
        cellListExecute.innerHTML = "All devices";

      cellAction.className = "w3-center";

      //
      var aSetting = document.createElement('a');
      aSetting.setAttribute('href', '#');
      aSetting.className = "w3-text-green a-setting";
      aSetting.innerHTML = '<i class="fa fa-cog"></i>';


      var moreSettingClickHandler = function (row) {
        return function () {
          Ardublockly.scheduleActionMoreSetting(row.id);
        };
      };

      aSetting.addEventListener('ontouchend', moreSettingClickHandler(row));
      aSetting.addEventListener('click', moreSettingClickHandler(row));
      cellAction.appendChild(aSetting);
    }
  }

};

Ardublockly.removeScheduleHtmlTableRow = function (scheduleId) {

  var row = document.getElementById(scheduleId);
  row.remove();
  //Update Index
  var table = document.getElementById("jobs_table");
  var tableLength = table.rows.length;
  for (var i = 1; i < tableLength; i++) {
    var row = table.rows[i];
    var td = row.getElementsByTagName("td")[0];
    var boldBlueTextEl = td.children[0];
    boldBlueTextEl.innerHTML = i;
  }

};

Ardublockly.jsonToScheduleHtmlTableRow = function (jsonArray) {
  if (jsonArray) {
    var table = document.getElementById("jobs_table");
    for (var i = 0; i < jsonArray.length; i++) {
      var jsonObj = jsonArray[i];
      if (document.getElementById(jsonObj.scheduleId)) {
        Ardublockly.jsonUpdateScheduleRow(jsonObj);
      }
      else {
        if (jsonObj) {
          var tableLength = table.rows.length;
          // Create an empty <tr> element and add it to the 1st position of the table:
          var row = table.insertRow(tableLength);
          // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
          var cellIndex = row.insertCell(0);


          var cellCronExpression = row.insertCell(1);
          var cellDescribe = row.insertCell(2);
          var cellListExecute = row.insertCell(3);
          var cellAction = row.insertCell(4);
          //
          row.setAttribute("id", jsonObj.scheduleId); // scheduleId value as Element Id
          row.className = "w3-large";

          //
          //Css
          var boldBlueTextEl = document.createElement('b');
          boldBlueTextEl.className = "w3-text-blue";
          boldBlueTextEl.innerHTML = tableLength;
          cellIndex.appendChild(boldBlueTextEl);

          cellCronExpression.innerHTML = jsonObj.cronExpress;

          var data = jsonObj.cronExpress;
          data = fullsizeToHaftsize(data).trim();
          if (data.length > 0) {
            var result = parseCron(data);
            console.log(result);
            if (result) {
              cellDescribe.innerHTML = result;
            } else {
              emptyParsedCron();
              cellDescribe.innerHTML = "Unknown";
            }
          }
          // cellDescribe.innerHTML = "TODO";

          cellListExecute.className = "pubip";
          cellListExecute.innerHTML = jsonObj.proxyList;
          if (jsonObj.cronType === "RENEW_IP_ALL")
            cellListExecute.innerHTML = "All devices";

          cellAction.className = "w3-center";

          //
          var aSetting = document.createElement('a');
          aSetting.setAttribute('href', '#');
          aSetting.className = "w3-text-green a-setting";
          aSetting.innerHTML = '<i class="fa fa-cog"></i>';


          var moreSettingClickHandler = function (row) {
            return function () {
              Ardublockly.scheduleActionMoreSetting(row.id);
            };
          };

          aSetting.addEventListener('ontouchend', moreSettingClickHandler(row));
          aSetting.addEventListener('click', moreSettingClickHandler(row));
          cellAction.appendChild(aSetting);
        }
      }
    }
  }
};

Ardublockly.removeProxyDashboardStatus = function (jsonArray) {
  for (var i = 0; i < jsonArray.length; i++) {
    var proxyId = jsonArray[i];
    Ardublockly.stopTimerUpdate(proxyId);
    var row = document.getElementById(proxyId);
    row.remove();
  }
  //Update Index
  var table = document.getElementById("proxy_table");
  var tableLength = table.rows.length;
  for (var i = 1; i < tableLength; i++) {

    var row = table.rows[i];
    var td = row.getElementsByTagName("td")[0];
    var boldBlueTextEl = td.children[0];
    boldBlueTextEl.innerHTML = i;
  }
};


Ardublockly.jsonUpdateRowRunStatusAndNetwork = function (jsonObj) {
  if (jsonObj) {
    var row = document.getElementById(jsonObj.idKey);
    if (row) {
      var td = row.getElementsByTagName("td")[2];
      td.innerHTML = jsonObj.modemStatus.netWorkOp + "-" + jsonObj.modemStatus.dataNetworkType + "-" + jsonObj.modemStatus.signalStatus + "-" + jsonObj.modemStatus.dataEnableStatus; //Vinaphone-4G,LTE-5/5
      var tdUptime = row.getElementsByTagName("td")[6];
      tdUptime.innerHTML = jsonObj.modemStatus.activeTime;
      var td = row.getElementsByTagName("td")[5];
      td.innerHTML = jsonObj.proxyStatus;

      if ((jsonObj.modemStatus.dataEnableStatus === "Error") || (jsonObj.proxyStatus === "Error")) {
        if (row.className.indexOf(" w3-pale-red") == -1) {
          row.className += " w3-pale-red";
        }
      } else {
        {
          row.className = row.className.replace(" w3-pale-red", "");
        }
      }
    }
  }
};

Ardublockly.jsonUpdateTableNetwork = function (jsonArray) {
  var table = document.getElementById("proxy_table");
  var tableLength = table.rows.length;
  if (tableLength > 0) {
    for (var i = 0; i < jsonArray.length; i++) {
      var jsonObj = jsonArray[i];
      if (jsonObj) {
        var row = document.getElementById(jsonObj.proxyId);
        if (row) {
          var td = row.getElementsByTagName("td")[2];
          td.innerHTML = jsonObj.modemStatus.netWorkOp + "-" + jsonObj.modemStatus.dataNetworkType + "-" + jsonObj.modemStatus.signalStatus + "-" + jsonObj.modemStatus.dataEnableStatus; //Vinaphone-4G,LTE-5/5
          var tdUptime = row.getElementsByTagName("td")[6];
          tdUptime.innerHTML = jsonObj.modemStatus.activeTime;
        }
      }
    }
  }
};


Ardublockly.jsonUpdateRowIp = function (jsonObj) {
  if (jsonObj) {
    var table = document.getElementById("proxy_table");
    var tableLength = table.rows.length;
    if (tableLength > 0) {
      var row = document.getElementById(jsonObj.proxyId);
      var td = row.getElementsByTagName("td")[3];
      td.innerHTML = jsonObj.ipAddress;
    }
  }
};

Ardublockly.jsonUpdateTableRowIp = function (jsonArray) {

  // var table = document.getElementById("proxy_table");
  // var row = table.getElementsByTagName("tr")[2];
  // var td = row.getElementsByTagName("td")[3];
  // td.innerHTML = "Julius";
  if (jsonArray) {
    for (var i = 0; i < jsonArray.length; i++) {
      var jsonObj = jsonArray[i];
      if (jsonObj) {
        var row = document.getElementById(jsonObj.proxyId);
        var td = row.getElementsByTagName("td")[3];
        td.innerHTML = jsonObj.ipAddress;
      }
    }
  }
};


Ardublockly.jsonUpdateTableRowRunStatus = function (jsonArray) {
  if (jsonArray) {
    for (var i = 0; i < jsonArray.length; i++) {
      var jsonObj = jsonArray[i];
      if (jsonObj) {
        var row = document.getElementById(jsonObj.tag);
        var td = row.getElementsByTagName("td")[5];
        td.innerHTML = jsonObj.status;
      }
    }
  }
};
