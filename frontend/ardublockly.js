'use strict';

/** Create a namespace for the application. */
var Ardublockly = Ardublockly || {};
Ardublockly.versionCode = 0;
Ardublockly.timerMap = new Map();
Ardublockly.readyShowList = false;

/** Initialize function for Ardublockly, to be called on page load. */
Ardublockly.init = function () {
  Ardublockly.designJsInit();

  Ardublockly.openProxyDashboardStatus();
  Ardublockly.openRequerimentLicense();
  Ardublockly.openRequestSystemRunConfig();
  Ardublockly.bindActionFunctions();

  // Hackish way to check if not running locally
  // if (document.location.hostname != 'localhost') {
  //   Ardublockly.openNotConnectedModal();
  //   console.log('Offline app modal opened as non localhost host name found: ' +
  //     document.location.hostname)
  // }
  //
  window.onbeforeunload = function () {
    ArdublocklyServer.closeWs();
    ArdublocklyServer.closeEvtSource();
  };
  ArdublocklyServer.createWs();

  //
  // ArdublocklyServer.createEvtSource();
  //
  //
  // ArdublocklyServer.evtSource.addEventListener('MODEM_CONNECT_REMOVE', function(event) {
  //   console.log('MODEM_CONNECT_REMOVE' + event.data);
  //   var objArray = JSON.parse(event.data);
  //   Ardublockly.removeProxyDashboardStatus(objArray);
  //
  // });
  //
  // ArdublocklyServer.evtSource.addEventListener('MODEM_CONNECT_ADDED', function(event) {
  //   console.log('MODEM_CONNECT_ADDED' + event.data);
  //   var objArray = JSON.parse(event.data);
  //   var postObject = {
  //     idKeys: objArray
  //   };
  //   Ardublockly.addNewProxyDashboardStatus(postObject);
  // });
  //
  // ArdublocklyServer.evtSource.addEventListener('HOME_NETWORK_CHANGE', function(event) {
  //   console.log('HOME_NETWORK_CHANGE' + event.data);
  //   var objArray = JSON.parse(event.data);
  //   Ardublockly.jsonUpdateTableNetwork(objArray);
  // });
  //
  // ArdublocklyServer.evtSource.addEventListener('IP_RE_NEW', function(event) {
  //   console.log('IP_RE_NEW' + event.data);
  //   var obj = JSON.parse(event.data);
  //   Ardublockly.jsonUpdateRowIp(obj);
  // });
  //
  // ArdublocklyServer.evtSource.addEventListener('SHUTDOWN_EVENT', function(event) {
  //   console.log(event.data);
  //   setTimeout(function() {
  //     ArdublocklyServer.closeEvtSource();
  //   }, 100);
  //
  // });
  Ardublockly.startRunningInfo();
};

Ardublockly.startRunningInfo = function () {

  var timer = setTimeout(function updateSystemInfo() { //cho giua cac lan la 5 giay sau khi thuc hien xong
    ArdublocklyServer.requestRunningInfo(function (jsonIpObj) {
      Ardublockly.jsonUpdateRunningInfo(jsonIpObj);
      timer = setTimeout(updateSystemInfo, 3000);
    });
  }, 3000);

}

Ardublockly.startTimerUpdate = function (proxyId) {
  //Sort table
  var proxyTimer = setTimeout(function updateProxy() { //cho giua cac lan la 5 giay sau khi thuc hien xong
    console.log("UpdateProxy:" + proxyId);
    ArdublocklyServer.requestProxyStatus(proxyId, function (jsonObj) {
      Ardublockly.jsonUpdateRowRunStatusAndNetwork(jsonObj);
      if (Ardublockly.readyShowList === true) {
        ArdublocklyServer.requestProxyInternetIp(proxyId, function (jsonObj) {
          Ardublockly.jsonUpdateRowIp(jsonObj);
          if (Ardublockly.timerMap.get(proxyId)) { //Neu chua bi xoa
            Ardublockly.timerMap.delete(proxyId); //Clear Old
            proxyTimer = setTimeout(updateProxy, 5000);
            Ardublockly.timerMap.set(proxyId, proxyTimer); //Update to new
          }
        });
      }else {
        //bo qua tim ip ngay, tranh lag
        if (Ardublockly.timerMap.get(proxyId)) { //Neu chua bi xoa
          Ardublockly.timerMap.delete(proxyId); //Clear Old
          proxyTimer = setTimeout(updateProxy, 5000);
          Ardublockly.timerMap.set(proxyId, proxyTimer); //Update to new
        }
      }

    });
  }, 5000);

  // var myVar = setInterval(myTimer, 1000);
  //   clearInterval(myVar);
  Ardublockly.timerMap.set(proxyId, proxyTimer);

}
Ardublockly.stopTimerUpdate = function (proxyId) {
  var proxyTimer = Ardublockly.timerMap.get(proxyId);
  if (proxyTimer) {
    clearTimeout(proxyTimer);
    Ardublockly.timerMap.delete(proxyId)
    console.log("StopUpdateProxy:" + proxyId);
  }
}

Ardublockly.checkLatestProductBuild = function (evt) {

  var button = evt.currentTarget;
  button.disabled = true;

  ArdublocklyServer.requestLatestBuild(function (productBuild) {
    button.disabled = false;
    console.log(JSON.stringify(productBuild));
    var sysActionMshEl = document.getElementById("actionMsg");
    if (Ardublockly.versionCode < productBuild.versionCode) {
      sysActionMshEl.innerHTML = "Found new update available!";
      document.getElementById("button_system_update").disabled = false;
    } else {
      {
        sysActionMshEl.innerHTML = "The product has been updated to the latest!";
        document.getElementById("button_system_update").disabled = true;
      }
    }
  });

}


Ardublockly.openSettings = function () {
  ArdublocklyServer.requestSettings(function (jsonObj) {
    console.log(JSON.stringify(jsonObj));
    Ardublockly.setRestoreSettingProxyAuthUsernameHtml(
      Ardublockly.jsonToHtmlTextInput(jsonObj.proxyCommonConfig, 'proxyAuthUsername')
    );
    Ardublockly.setRestoreSettingProxyAuthPasswordHtml(
      Ardublockly.jsonToHtmlTextInput(jsonObj.proxyCommonConfig, 'proxyAuthPassword')
    );
    Ardublockly.setRestoreSettingProxyPortHtml(
      Ardublockly.jsonToHtmlNumberInput(jsonObj.proxyCommonConfig, 'proxyLocalBeginPort')
    );
    Ardublockly.setRestoreSettingProxyIpHtml(
      Ardublockly.jsonToHtmlDropdown(jsonObj.localEth, jsonObj.proxyCommonConfig.localAddress)
    );

    Ardublockly.setRestoreAdvancedSettings(jsonObj.proxyCommonConfig);

    Ardublockly.setRestoreSystemInformation(jsonObj.systemInfoModel);

    Ardublockly.setRestoreSystemConfig(jsonObj.systemRunConfigModel);

  });
  Ardublockly.showPage(event, 'show_setting');
};

/**
 * Sets the compiler location form data retrieve from an updated element.
 * @param {element} jsonResponse JSON data coming back from the server.
 * @return {undefined} Might exit early if response is null.
 */
Ardublockly.setRestoreSettingProxyAuthUsernameHtml = function (newEl) {
  Ardublockly.setBaseRestoreHtml(newEl, 'settings_proxy_auth_username');
};

Ardublockly.setRestoreSettingProxyAuthPasswordHtml = function (newEl) {
  Ardublockly.setBaseRestoreHtml(newEl, 'settings_proxy_auth_password');
};


Ardublockly.setRestoreSettingProxyPortHtml = function (newEl) {
  Ardublockly.setBaseRestoreHtml(newEl, 'settings_port_begin');
};

Ardublockly.setRestoreSettingProxyIpHtml = function (newEl) {
  if (newEl === null)
    return Ardublockly.openNotConnectedModal();

  var boardDropdown = document.getElementById('settings_proxy_ip');
  if (boardDropdown !== null) {
    newEl.name = 'proxy_ip';
    newEl.id = 'settings_proxy_ip';
    newEl.className = 'w3-select w3-border w3-round';
    // newEl.onchange = Ardublockly.setBoard;
    boardDropdown.parentNode.replaceChild(newEl, boardDropdown);
    // Refresh the materialize select menus
  }
};

Ardublockly.setRestoreSingleProxyAuthUsernameHtml = function (newEl) {
  Ardublockly.setBaseRestoreHtml(newEl, 'single_settings_proxy_auth_username');
};

Ardublockly.setRestoreSingleProxyAuthPasswordHtml = function (newEl) {
  Ardublockly.setBaseRestoreHtml(newEl, 'single_settings_proxy_auth_password');
};


Ardublockly.setRestoreSingleProxyPortHtml = function (newEl) {
  Ardublockly.setBaseRestoreHtml(newEl, 'single_settings_port_begin');
};


Ardublockly.setRestoreAdvancedSettings = function (proxyCommonConfig) {
  if (proxyCommonConfig != null) {
    var clientToProxyAcceptorThreads = document.getElementById("adv_settings_clientToProxyAcceptorThreads");
    clientToProxyAcceptorThreads.value = proxyCommonConfig.clientToProxyAcceptorThreads;

    var clientToProxyWorkerThreads = document.getElementById("adv_settings_clientToProxyWorkerThreads");
    clientToProxyWorkerThreads.value = proxyCommonConfig.clientToProxyWorkerThreads;

    var proxyToServerWorkerThreads = document.getElementById("adv_settings_proxyToServerWorkerThreads");
    proxyToServerWorkerThreads.value = proxyCommonConfig.proxyToServerWorkerThreads;

    var maxChunkSize = document.getElementById("adv_settings_maxChunkSize");
    maxChunkSize.value = proxyCommonConfig.maxChunkSize;


    var transparent = document.getElementById("adv_cb_proxy_transparent");
    transparent.checked = proxyCommonConfig.transparent;

    var allowLocalOnly = document.getElementById("adv_cb_proxy_allowLocalOnly");
    allowLocalOnly.checked = proxyCommonConfig.allowLocalOnly;

    var allowRequestToOriginServer = document.getElementById("adv_cb_proxy_allowRequestToOriginServer");
    allowRequestToOriginServer.checked = proxyCommonConfig.allowRequestToOriginServer;

    var acceptProxyProtocol = document.getElementById("adv_cb_proxy_acceptProxyProtocol");
    acceptProxyProtocol.checked = proxyCommonConfig.acceptProxyProtocol;

    var sendProxyProtocol = document.getElementById("adv_cb_proxy_sendProxyProtocol");
    sendProxyProtocol.checked = proxyCommonConfig.sendProxyProtocol;

    var enableProxySocks = document.getElementById("cb_proxy_socks");
    enableProxySocks.checked = proxyCommonConfig.socksEnable;

    var resetChangeIpMode = document.getElementById("adv_settings_change_ip_mode");
    resetChangeIpMode.value = proxyCommonConfig.changeIpMode;

    var includeIpInChangeResult = document.getElementById("cb_proxy_include_result_ip");
    includeIpInChangeResult.checked = proxyCommonConfig.includeIpResult;

    var settings_modem_admin_password = document.getElementById("settings_modem_admin_password");
    settings_modem_admin_password.value = proxyCommonConfig.modemAdminPassword;

    var settings_modem_network_wait_connected = document.getElementById("settings_modem_network_wait_connected");
    settings_modem_network_wait_connected.value = proxyCommonConfig.networkWaitConnected;

    var settings_modem_timeout_wait_connected = document.getElementById("settings_modem_timeout_wait_connected");
    settings_modem_timeout_wait_connected.value = proxyCommonConfig.timeoutWaitConnected;
  }

};


Ardublockly.setRestoreSystemInformation = function (systemInfoModel) {
  if (systemInfoModel != null) {
    // var sysInfo=document.getElementById("sysInfo");
    var sysInfoProxyVersion = document.getElementById("sysInfoProxyVersion");
    sysInfoProxyVersion.innerHTML = systemInfoModel.productBuild.versionName;
    var sysInfoJvm = document.getElementById("sysInfoJvm");
    sysInfoJvm.innerHTML = systemInfoModel.javaVersion + "/" + systemInfoModel.javaVM;
    var sysInfoUptime = document.getElementById("sysInfoUptime");
    sysInfoUptime.innerHTML = systemInfoModel.uptime;
    var sysInfoOs = document.getElementById("sysInfoOs");
    sysInfoOs.innerHTML = systemInfoModel.os;
    var sysInfoCpu = document.getElementById("sysInfoCpu");
    sysInfoCpu.innerHTML = systemInfoModel.cpu;
    var sysInfoRam = document.getElementById("sysInfoRam");
    sysInfoRam.innerHTML = systemInfoModel.physicalMemory;

    Ardublockly.versionCode = systemInfoModel.productBuild.versionCode;
  }

};

Ardublockly.setRestoreSystemConfig = function (systemRunConfigModel) {
  if (systemRunConfigModel != null) {
    var cb_modem_connection = document.getElementById("cb_modem_connection");
    cb_modem_connection.checked = systemRunConfigModel.checkModemConnectChange;
    var cb_modem_network = document.getElementById("cb_modem_network");
    cb_modem_network.checked = systemRunConfigModel.checkModemStatusChange;

    var btn_sync_proxy = document.getElementById("btn_sync_proxy");

    if (!systemRunConfigModel.checkModemConnectChange) {
      btn_sync_proxy.className = btn_sync_proxy.className.replace(" w3-hide", "");
    } else {
      if (btn_sync_proxy.className.indexOf("w3-hide") == -1) {
        btn_sync_proxy.className += " w3-hide";
      }
    }

  }

}

Ardublockly.openSchedule = function () {

  ArdublocklyServer.requestAllSchedule(function (jsonObj) {
    console.log(JSON.stringify(jsonObj));
    Ardublockly.jsonToScheduleHtmlTableRow(jsonObj);
  });

  Ardublockly.showPage(event, 'show_schedule');
};


Ardublockly.openLicenses = function () {
  ArdublocklyServer.requestLicense(function (jsonObj) {
    console.log(JSON.stringify(jsonObj));
    Ardublockly.jsonToLicenseHtml(jsonObj);
  });
  Ardublockly.showPage(event, 'show_license');
};


Ardublockly.openRequerimentLicense = function () {

  ArdublocklyServer.requestLicense(function (jsonObj) {
    if (jsonObj) {
      console.log(JSON.stringify(jsonObj));
      //check het han
      if (jsonObj.errorType === '06e4b636f9dad8a9cdd66a6b2eb36b48') {
        Ardublockly.openLicensesModal();
      }
      if (jsonObj.errorType === '09ea096e338bd1599cc2534168c4ce21') {
        Ardublockly.openLicensesModal();
      }
    } else {
      Ardublockly.openLicensesModal();
    }
  });

};

Ardublockly.openRequestSystemRunConfig = function () {

  ArdublocklyServer.requestSystemRunConfig(function (jsonObj) {
    if (jsonObj) {
      console.log(JSON.stringify(jsonObj));
      var btn_sync_proxy = document.getElementById("btn_sync_proxy");
      if (!jsonObj.checkModemConnectChange) {
        btn_sync_proxy.className = btn_sync_proxy.className.replace(" w3-hide", "");
      } else {

      }
    }
  });

};

Ardublockly.openProxyDashboardStatus = function () {

  Ardublockly.readyShowList = false;
  Ardublockly.showDashboadLoading("Loading proxy...");
  ArdublocklyServer.requestAllProxyStatus(function (jsonObj) {

    Ardublockly.showDashboadProxyStatus();
    // console.log(JSON.stringify(jsonObj));
    Ardublockly.jsonToHtmlTableRow(jsonObj);

    // ArdublocklyServer.requestAllProxyRunStatus(function(jsonIpObj) {
    //   // console.log(JSON.stringify(jsonObj));
    //   Ardublockly.jsonUpdateTableRowRunStatus(jsonIpObj);
    // });

    // ArdublocklyServer.requestAllProxyInternetIp(function(jsonIpObj) {
    //   // console.log(JSON.stringify(jsonIpObj));
    //   Ardublockly.jsonUpdateTableRowIp(jsonIpObj);
    //   Ardublockly.hideDashboadLoading();
    // });

    Ardublockly.hideDashboadLoading();
    Ardublockly.readyShowList = true;

  });

  Ardublockly.showPage(event, 'show_dashboad');
  var dashboardMenu = document.getElementById('menu_dashboard');
  dashboardMenu.style.display = "block";
  dashboardMenu.className += " w3-blue";
};


Ardublockly.addNewProxyDashboardStatus = function (listIdObj) {
  Ardublockly.showDashboadLoading("New proxy adding...");
  ArdublocklyServer.requestListProxyStatus(listIdObj, function (jsonObj) {

    console.log(JSON.stringify(jsonObj));
    Ardublockly.jsonToHtmlTableRow(jsonObj);

    // ArdublocklyServer.requestListProxyInternetIp(listIdObj, function(jsonIpObj) {
    //   console.log(JSON.stringify(jsonIpObj));
    //   Ardublockly.jsonUpdateTableRowIp(jsonIpObj);
    //   Ardublockly.hideDashboadLoading();
    // });

    Ardublockly.hideDashboadLoading();

  });
};

Ardublockly.updateProxyDashboardStatus = function (listIdObj) {

  // var jsonObj = listIdObj[0];
  // if (jsonObj) {
  //   console.log("UpdateProxy:" + proxyId);
  //   ArdublocklyServer.requestProxyStatus(proxyId, function(jsonObj) {
  //     Ardublockly.jsonUpdateRowRunStatusAndNetwork(jsonObj);
  //     ArdublocklyServer.requestProxyInternetIp(proxyId, function(jsonObj) {
  //       Ardublockly.jsonUpdateRowIp(jsonObj);
  //     });
  //   });
  // }


};



Ardublockly.deviceReboot = function (evt) {
  var actionCmd = {
    action: "REBOOT_DEVICE"
  };
  var button = evt.currentTarget;
  button.disabled = true;
  ArdublocklyServer.requestSystemAction(actionCmd, function (jsonObj) {
    Ardublockly.shortMessage("Device rebooting...");
    button.disabled = false;
  });
};

Ardublockly.restartSystem = function (evt) {
  var actionCmd = {
    action: "RESTART_SYS"
  };
  var button = evt.currentTarget;
  button.disabled = true;
  ArdublocklyServer.requestSystemAction(actionCmd, function (jsonObj) {
    Ardublockly.shortMessage("System restarting...");
    button.disabled = false;
  });
};


Ardublockly.shutdownSystem = function (evt) {
  var actionCmd = {
    action: "SHUTDOWN_SYS"
  };
  var button = evt.currentTarget;
  button.disabled = true;
  ArdublocklyServer.requestSystemAction(actionCmd, function (jsonObj) {
    Ardublockly.shortMessage("System shuting down...");
    button.disabled = false;
  });
};

Ardublockly.factorySystem = function (evt) {
  var actionCmd = {
    action: "FACTORY_SYS"
  };
  var button = evt.currentTarget;
  button.disabled = true;
  ArdublocklyServer.requestSystemAction(actionCmd, function (jsonObj) {
    Ardublockly.shortMessage("System factory reset...");
    button.disabled = false;
  });
};



Ardublockly.restartUpdate = function (evt) {
  var actionCmd = {
    action: "UPDATE_SYS"
  };
  var button = evt.currentTarget;
  button.disabled = true;

  ArdublocklyServer.requestSystemAction(actionCmd, function (jsonObj) {
    Ardublockly.shortMessage("System updating...");
    button.disabled = false;
  });

};

/** Binds functions to each of the buttons, nav links, and related. */
Ardublockly.bindActionFunctions = function () {

  Ardublockly.bindClick_('button_common_save_all', function () {
    Ardublockly.saveProxyCommonSetting(event, "all");
  });

  Ardublockly.bindClick_('button_common_save_new', function () {
    Ardublockly.saveProxyCommonSetting(event, "new");
  });

  Ardublockly.bindClick_('button_system_save', function () {
    Ardublockly.saveSystemConfigRun(event);
  });



  Ardublockly.bindClick_('button_system_reboot_device', function () {
    Ardublockly.deviceReboot(event);
  });

  // Ardublockly.bindClick_('button_system_check_update', Ardublockly.checkLatestProductBuild);
  Ardublockly.bindClick_('button_system_check_update', function () {
    Ardublockly.checkLatestProductBuild(event);
  });

  // Ardublockly.bindClick_('button_system_restart', Ardublockly.restartSystem);
  Ardublockly.bindClick_('button_system_restart', function () {
    Ardublockly.restartSystem(event);
  });


  // Ardublockly.bindClick_('button_system_shutdown', Ardublockly.shutdownSystem);
  Ardublockly.bindClick_('button_system_shutdown', function () {
    Ardublockly.shutdownSystem(event);
  });

  Ardublockly.bindClick_('button_system_factory', function () {
    Ardublockly.factorySystem(event);
  });

  // Ardublockly.bindClick_('button_system_update', Ardublockly.restartUpdate);
  Ardublockly.bindClick_('button_system_update', function () {
    Ardublockly.restartUpdate(event);
  });


  Ardublockly.bindClick_('button_single_proxy_save', function () {
    Ardublockly.saveProxySingleSetting(event);
  });


  Ardublockly.bindClick_('button_enable_data', function () {
    Ardublockly.proxyActionEnableMobileData(event, true);
  });

  Ardublockly.bindClick_('button_disable_data', function () {
    Ardublockly.proxyActionEnableMobileData(event, false);
  });

  Ardublockly.bindClick_('button_disable_proxy', function () {
    Ardublockly.proxyActionChangeProxyStartStop(event, false);
  });

  Ardublockly.bindClick_('button_enable_proxy', function () {
    Ardublockly.proxyActionChangeProxyStartStop(event, true);
  });



  Ardublockly.bindClick_('button_send_ussd', function () {
    Ardublockly.proxyMoreActionSendOrAnswer(event);
  });

  Ardublockly.bindClick_('button_cancel_ussd', function () {
    Ardublockly.proxyMoreActionCancelUssd(event);
  });



  // Side menu buttons, they also close the side menu
  Ardublockly.bindClick_('menu_dashboard', function () {
    Ardublockly.showPage(event, 'show_dashboad');
  });

  Ardublockly.bindClick_('menu_setting', function () {
    Ardublockly.openSettings();
  });

  Ardublockly.bindClick_('menu_schedule', function () {
    Ardublockly.openSchedule();
  });

  Ardublockly.bindClick_('btn_sync_proxy', function () {
    Ardublockly.requestCheckProxyConnection(event);
  });

  Ardublockly.bindClick_('btn_add_schedule', function () {
    var button_delete_schedule = document.getElementById("button_delete_schedule");
    button_delete_schedule.value = "None";

    if (button_delete_schedule.className.indexOf("w3-hide") == -1) {
      button_delete_schedule.className += " w3-hide";
    }

    var button_update_schedule = document.getElementById("button_update_schedule");
    button_update_schedule.value = "None";

    if (button_update_schedule.className.indexOf("w3-hide") == -1) {
      button_update_schedule.className += " w3-hide";
    }

    var button_add_schedule_save = document.getElementById("button_add_schedule_save");

    button_add_schedule_save.className = button_add_schedule_save.className.replace(" w3-hide", "");


    var add_job_cron_express = document.getElementById("add_job_cron_express");
    add_job_cron_express.value = "";

    var add_list_id = document.getElementById("add_list_id");
    add_list_id.value = "";

    Ardublockly.openAddCronjobModal(event);
  });


  Ardublockly.bindClick_('menu_license', function () {
    Ardublockly.openLicenses();
  });

  Ardublockly.bindClick_('menu_support', function () {
    Ardublockly.showPage(event, 'show_support');
  });
  Ardublockly.bindClick_('menu_api', function () {
    Ardublockly.showPage(event, 'show_api');
  });


  Ardublockly.bindClick_('button_pro_license',
    function () {
      Ardublockly.openLicenses();
      document.getElementById('modal_license').style.display = 'none';
      var dashboardMenu = document.getElementById('menu_license');
      dashboardMenu.style.display = "block";
      dashboardMenu.className += " w3-blue";
    });

  Ardublockly.bindClick_('button_trial_license', function () {
    Ardublockly.activeLicenseTrial();
  });

  Ardublockly.bindClick_('button_delete_schedule', function () {
    Ardublockly.proxyActionDeleteSchedule(event);
  });
  Ardublockly.bindClick_('button_update_schedule', function () {
    Ardublockly.proxyActionUpdateSchedule(event);
  });

  // Access the form element...
  const form = document.getElementById("activeLicenseForm");
  // ...and take over its submit event.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    Ardublockly.activeLicense();
  });

  const formAddDevice = document.getElementById("addScheduleForm");
  formAddDevice.addEventListener("submit", function (event) {
    event.preventDefault();
    Ardublockly.requestAddSchedule();
  });

};

Ardublockly.requestAddSchedule = function () {
  const form = document.getElementById("addScheduleForm");
  // Bind the FormData object and the form element
  const data = new FormData(form);
  console.log(JSON.stringify(data));
  var button_add_schedule_save = document.getElementById("button_add_schedule_save");
  button_add_schedule_save.disabled = true;

  var modems = [];
  var list = data.get('add_list_id');
  if (list) {
    var lines = list.split('\n');
    var length = lines.length;
    for (var i = 0; i < length; i++) {
      var lineContent = lines[i].trim();
      if (lineContent) {
        modems.push(lineContent);
      }
    }
  }

  var scheduleAddedExecute = {
    scheduleId: "id",
    listModem: modems,
    cronExpress: data.get('add_job_cron_express'),
    type: data.get('add_job_select')
  };

  ArdublocklyServer.requestAddSchedule(scheduleAddedExecute, function (jsonObj) {
    if (jsonObj) {
      document.getElementById('modal_add_cronjob').style.display = 'none';
      Ardublockly.addOrUpdateScheduleHtmlTableRow(jsonObj);
    } else {
      alert('Failure!');
    }
    button_add_schedule_save.disabled = false;
  });
}

Ardublockly.requestCheckProxyConnection = function (evt) {
  var button = evt.currentTarget;
  button.disabled = true;
  ArdublocklyServer.requestSyncModemConnect(function (jsonObj) {
    console.log(jsonObj);
    // button.disabled = false;
  });
}


Ardublockly.activeLicenseTrial = function () {

  var button_active_license = document.getElementById("button_trial_license");
  button_active_license.disabled = true;
  var userInfo = {
    name: 'Demo',
    phone: '',
    address: ''
  };

  var licenseExecute = {
    userInfo: userInfo,
    key: "123456789",
    type: "TRIAL"
  };

  ArdublocklyServer.requestActiveLicense(licenseExecute, function (jsonObj) {
    console.log(JSON.stringify(jsonObj));
    if (jsonObj) {
      alert('Success!');
      Ardublockly.openLicenses();
      document.getElementById('modal_license').style.display = 'none';
      var dashboardMenu = document.getElementById('menu_license');
      dashboardMenu.style.display = "block";
      dashboardMenu.className += " w3-blue";
    } else {
      alert('Failure!');
    }
    button_active_license.disabled = false;
  });
}

Ardublockly.activeLicense = function () {
  const form = document.getElementById("activeLicenseForm");
  // Bind the FormData object and the form element
  const data = new FormData(form);
  for (var value of data.values()) {
    console.log(value);
  }

  var button_active_license = document.getElementById("button_active_license");
  button_active_license.disabled = true;

  var userInfo = {
    name: data.get('name'),
    phone: data.get('phone'),
    address: data.get('address')
  };

  var licenseExecute = {
    userInfo: userInfo,
    key: data.get('key'),
    type: "PRO",
    amount: data.get('amount')
  };

  ArdublocklyServer.requestActiveLicense(licenseExecute, function (jsonObj) {
    console.log(JSON.stringify(jsonObj));
    if (jsonObj) {
      alert('Success!');
      Ardublockly.jsonToLicenseHtml(jsonObj);
    } else {
      alert('Failure!');
    }
    button_active_license.disabled = false;
  });
}

Ardublockly.proxyMoreActionSendOrAnswer = function (evt) {
  var id = evt.currentTarget.value;

  var button_cancel_ussd = document.getElementById("button_cancel_ussd");
  button_cancel_ussd.disabled = true;

  var button_send_ussd = document.getElementById("button_send_ussd");
  button_send_ussd.disabled = true;

  var modem_ussd_command = document.getElementById('modem_ussd_command');
  var ussd_content = modem_ussd_command.value;
  var commonSend = {
    content: ussd_content,
    idKey: id
  };

  ArdublocklyServer.requestSendOrAnswerUssd(commonSend, function (jsonObj) {
    console.log(jsonObj);
    var ussd_response = document.getElementById('ussd_response');
    ussd_response.innerHTML = "";
    if (jsonObj) {
      if (jsonObj.needAnswer === true) {
        button_send_ussd.innerHTML = "Answer";
        button_cancel_ussd.disabled = false;
      } else {
        button_send_ussd.innerHTML = "Send";
      }
      ussd_response.innerHTML = jsonObj.content;
    }
    button_send_ussd.disabled = false;
  });

};

Ardublockly.proxyMoreActionGetUssdRes = function (id) {

  var button_cancel_ussd = document.getElementById("button_cancel_ussd");
  button_cancel_ussd.disabled = true;

  var button_send_ussd = document.getElementById("button_send_ussd");
  button_send_ussd.disabled = true;

  var modem_ussd_command = document.getElementById('modem_ussd_command');
  modem_ussd_command.innerHTML = "";

  ArdublocklyServer.requestModemUssd(id, function (jsonObj) {
    var ussd_response = document.getElementById('ussd_response');
    ussd_response.innerHTML = "";
    if (jsonObj) {
      if (jsonObj.needAnswer === true) {
        button_send_ussd.innerHTML = "Answer";
        button_cancel_ussd.disabled = false;
      } else {
        button_send_ussd.innerHTML = "Send";
      }
      ussd_response.innerHTML = jsonObj.content;

      button_send_ussd.disabled = false;
    }

  });

};
Ardublockly.proxyMoreActionCancelUssdStart = function (id) {

  var button_cancel_ussd = document.getElementById("button_cancel_ussd");
  button_cancel_ussd.disabled = true;

  var button_send_ussd = document.getElementById("button_send_ussd");

  var modem_ussd_command = document.getElementById('modem_ussd_command');


  ArdublocklyServer.requestModemCancelUssd(id, function (jsonObj) {
    var ussd_response = document.getElementById('ussd_response');
    ussd_response.innerHTML = "";
    if (jsonObj) {
      ussd_response.innerHTML = jsonObj.content;
    }
    button_send_ussd.disabled = false;
  });

};

Ardublockly.proxyMoreActionCancelUssd = function (evt) {

  var id = evt.currentTarget.value;

  var button_cancel_ussd = document.getElementById("button_cancel_ussd");
  button_cancel_ussd.disabled = true;

  var button_send_ussd = document.getElementById("button_send_ussd");

  var modem_ussd_command = document.getElementById('modem_ussd_command');


  ArdublocklyServer.requestModemCancelUssd(id, function (jsonObj) {
    var ussd_response = document.getElementById('ussd_response');
    ussd_response.innerHTML = "";
    if (jsonObj) {
      ussd_response.innerHTML = jsonObj.content;
    }
    button_send_ussd.disabled = false;
  });

};


Ardublockly.proxyMoreActionGetProxyStatus = function (id) {

  var button_disable_proxy = document.getElementById("button_disable_proxy");
  button_disable_proxy.disabled = true;

  var button_enable_proxy = document.getElementById("button_enable_proxy");
  button_enable_proxy.disabled = true;

  var button_disable_data = document.getElementById("button_disable_data");
  button_disable_data.disabled = true;

  var button_enable_data = document.getElementById("button_enable_data");
  button_enable_data.disabled = true;

  ArdublocklyServer.requestProxyStatus(id, function (jsonObj) {
    var modem_received = document.getElementById('modem_received');
    var modem_sent = document.getElementById('modem_sent');
    var modem_active_time = document.getElementById('modem_active_time');
    var more_proxy_status = document.getElementById('more_proxy_status');
    var modem_network_op = document.getElementById('modem_network_op');
    var modem_data_en = document.getElementById('modem_data_en');

    modem_received.innerHTML = "";
    modem_sent.innerHTML = "";
    modem_active_time.innerHTML = "";
    more_proxy_status.innerHTML = "";
    modem_network_op.innerHTML = "";
    modem_data_en.innerHTML = "";

    if (jsonObj) {

      if (jsonObj.modemStatus.dataEnableStatus) {
        if (jsonObj.modemStatus.dataEnableStatus === "Connected") {
          button_disable_data.disabled = false;
        } else if (jsonObj.modemStatus.dataEnableStatus === "Disconnected") {
          button_enable_data.disabled = false;
        }
      }

      if (jsonObj.proxyStatus) {
        console.log(jsonObj.proxyStatus);
        if ((jsonObj.proxyStatus.toUpperCase() === "RUNNING") || (jsonObj.proxyStatus.toUpperCase() === "ERROR")) {
          button_enable_proxy.disabled = true;
          button_disable_proxy.disabled = false;
        } else if (jsonObj.proxyStatus.toUpperCase() === "STOPPED") {
          button_enable_proxy.disabled = false;
          button_disable_proxy.disabled = true;
        }
      }

      modem_received.innerHTML = jsonObj.modemStatus.received;
      modem_sent.innerHTML = jsonObj.modemStatus.sent;
      modem_active_time.innerHTML = jsonObj.modemStatus.activeTime;
      more_proxy_status.innerHTML = jsonObj.proxyStatus;
      modem_network_op.innerHTML = jsonObj.modemStatus.netWorkOp;
      modem_data_en.innerHTML = jsonObj.modemStatus.dataEnableStatus;

    }
  });

};

Ardublockly.proxyMoreActionGetModemDeviceInfo = function (id) {

  ArdublocklyServer.requestDeviceInfo(id, function (jsonObj) {
    var modem_device_name = document.getElementById('modem_device_name');
    var modem_phone_number = document.getElementById('modem_phone_number');
    var modem_network = document.getElementById('modem_network');
    var modem_software = document.getElementById('modem_software');
    var modem_hardware = document.getElementById('modem_hardware');
    var modem_imei = document.getElementById('modem_imei');
    var modem_mac = document.getElementById('modem_mac');
    var modem_imsi = document.getElementById('modem_imsi');
    // var modem_wan = document.getElementById('modem_wan');
    modem_device_name.innerHTML = "";
    modem_phone_number.innerHTML = "";
    modem_network.innerHTML = "";
    modem_software.innerHTML = "";
    modem_hardware.innerHTML = "";
    modem_imei.innerHTML = "";
    modem_mac.innerHTML = "";
    modem_imsi.innerHTML = "";
    // modem_wan.innerHTML = "";
    if (jsonObj) {
      modem_device_name.innerHTML = jsonObj.deviceName;
      modem_phone_number.innerHTML = jsonObj.phoneNumber;
      modem_network.innerHTML = jsonObj.opMode;
      modem_software.innerHTML = jsonObj.softwareVersion;
      modem_hardware.innerHTML = jsonObj.hardwareVersion;
      modem_imei.innerHTML = jsonObj.imei;
      modem_mac.innerHTML = jsonObj.macAddress;
      modem_imsi.innerHTML = jsonObj.imsi;
      // modem_wan.innerHTML = jsonObj.wanAddress;
    }
  });

};

Ardublockly.proxyMoreActionGetProxyConfig = function (id) {
  ArdublocklyServer.requestProxyConfig(id, function (jsonObj) {

    var single_settings_port_begin = document.getElementById('single_settings_port_begin');
    var single_settings_proxy_auth_username = document.getElementById('single_settings_proxy_auth_username');
    var single_settings_proxy_auth_password = document.getElementById('single_settings_proxy_auth_password');

    single_settings_port_begin.value = "";
    single_settings_proxy_auth_username.value = "";
    single_settings_proxy_auth_password.value = "";


    if (jsonObj) {
      Ardublockly.setRestoreSingleProxyAuthUsernameHtml(
        Ardublockly.jsonToHtmlTextInput(jsonObj, 'userNameProxyAuthenticator')
      );
      Ardublockly.setRestoreSingleProxyAuthPasswordHtml(
        Ardublockly.jsonToHtmlTextInput(jsonObj, 'passwordProxyAuthenticator')
      );
      Ardublockly.setRestoreSingleProxyPortHtml(
        Ardublockly.jsonToHtmlNumberInput(jsonObj, 'addressPort')
      );
    }
  });

};


Ardublockly.proxyMoreActionGetPublicIp = function (id) {
  var row = document.getElementById(id);
  Ardublockly.startGettingIPSpin(row);
  ArdublocklyServer.requestProxyInternetIp(id, function (jsonObj) {
    Ardublockly.jsonUpdateRowIp(jsonObj);
    Ardublockly.stopGettingIPSpin(row);
  });

};

Ardublockly.proxyActionRenewPublicIp = function (id) {

  var rowTable = document.getElementById(id);
  Ardublockly.startGettingIPSpin(rowTable);
  var actionExecute = {
    idKey: id,
    action: "ACTION_RENEW_IP"
  };

  ArdublocklyServer.requestNewProxyInternetIp(actionExecute, function (jsonObj) {
    console.log(JSON.stringify(jsonObj));
    // if (jsonObj) {
    //   var row = document.getElementById(jsonObj.proxyId);
    //   var td = row.getElementsByTagName("td")[3];
    //   td.innerHTML = jsonObj.ipAddress;
    // }
    Ardublockly.jsonUpdateRowIp(jsonObj);
    Ardublockly.stopGettingIPSpin(rowTable);
  });
};

Ardublockly.proxyActionEnableMobileData = function (evt, enable) {

  var button_disable_data = document.getElementById("button_disable_data");
  button_disable_data.disabled = true;

  var button_enable_data = document.getElementById("button_enable_data");
  button_enable_data.disabled = true;

  var id = evt.currentTarget.value;
  var actionExecute = {
    idKey: id,
    action: "ACTION_DATA_CHANGE"
  };

  if (enable) {
    ArdublocklyServer.requestEnableProxyInternetData(actionExecute, function (jsonObj) {
      if (jsonObj) {
        if (jsonObj.data) {
          if (jsonObj.data === "Connected") {
            button_disable_data.disabled = false;
          } else if (jsonObj.data === "Disconnected") {
            button_enable_data.disabled = false;
          }
        }
      }
    });
  } else {
    ArdublocklyServer.requestDisableProxyInternetData(actionExecute, function (jsonObj) {
      if (jsonObj) {
        if (jsonObj.data) {
          if (jsonObj.data === "Connected") {
            button_disable_data.disabled = false;
          } else if (jsonObj.data === "Disconnected") {
            button_enable_data.disabled = false;
          }
        }
      }
    });
  }

};


Ardublockly.proxyActionChangeProxyStartStop = function (evt, start) {

  var button_enable_proxy = document.getElementById("button_enable_proxy");
  button_enable_proxy.disabled = true;

  var button_disable_proxy = document.getElementById("button_disable_proxy");
  button_disable_proxy.disabled = true;

  var id = evt.currentTarget.value;
  var actionExecute = {
    idKey: id,
    action: start ? "ACTION_START" : "ACTION_STOP"
  };
  ArdublocklyServer.requestEnableProxyRunning(actionExecute, function (jsonObj) {
    if (jsonObj) {
      if (jsonObj.status) {
        if (jsonObj.status === "PROXY_STOPPED") {
          button_enable_proxy.disabled = false;
          button_disable_proxy.disabled = true;
        } else if (jsonObj.status === "PROXY_RUNNING") {
          button_enable_proxy.disabled = true;
          button_disable_proxy.disabled = false;
        }
      }
    }
  });

};

Ardublockly.proxyActionMoreSetting = function (id) {
  console.log('proxyActionMoreSetting:' + id);

  var title = document.getElementById("gen_id_title");
  title.innerHTML = id + " config";

  var button_single_proxy_save = document.getElementById("button_single_proxy_save");
  button_single_proxy_save.value = id;

  var button_disable_proxy = document.getElementById("button_disable_proxy");
  button_disable_proxy.value = id;

  var button_enable_proxy = document.getElementById("button_enable_proxy");
  button_enable_proxy.value = id;

  var button_send_ussd = document.getElementById("button_send_ussd");
  button_send_ussd.value = id;

  var button_cancel_ussd = document.getElementById('button_cancel_ussd');
  button_cancel_ussd.value = id;

  var button_disable_data = document.getElementById("button_disable_data");
  button_disable_data.value = id;

  var button_enable_data = document.getElementById("button_enable_data");
  button_enable_data.value = id;

  var ussd_response = document.getElementById('ussd_response');
  ussd_response.innerHTML = "";

  var modem_ussd_command = document.getElementById('modem_ussd_command');
  modem_ussd_command.value = "";

  Ardublockly.openSettingsModal(id);
  Ardublockly.proxyMoreActionGetModemDeviceInfo(id);
  Ardublockly.proxyMoreActionGetProxyConfig(id);
  Ardublockly.proxyMoreActionGetProxyStatus(id);
  Ardublockly.proxyMoreActionGetUssdRes(id);
  // Ardublockly.proxyMoreActionCancelUssdStart(id);
};


Ardublockly.scheduleActionMoreSetting = function (id) {
  console.log('scheduleActionMoreSetting:' + id);

  var title = document.getElementById("gen_schedule_title");

  title.innerHTML = "Edit schedule job";

  var button_delete_schedule = document.getElementById("button_delete_schedule");
  button_delete_schedule.value = id;

  button_delete_schedule.className = button_delete_schedule.className.replace(" w3-hide", "");

  var button_update_schedule = document.getElementById("button_update_schedule");
  button_update_schedule.value = id;

  button_update_schedule.className = button_update_schedule.className.replace(" w3-hide", "");

  var button_add_schedule_save = document.getElementById("button_add_schedule_save");
  if (button_add_schedule_save.className.indexOf("w3-hide") == -1) {
    button_add_schedule_save.className += " w3-hide";
  }

  Ardublockly.openAddCronjobModal();

  ArdublocklyServer.requestAllSchedule(function (jsonArray) {
    if (jsonArray) {
      for (var i = 0; i < jsonArray.length; i++) {
        var jsonObj = jsonArray[i];
        if (jsonObj.scheduleId === id) {
          Ardublockly.showScheduleModelInfo(jsonObj);
          break;
        }
      }
    }
  });
};


Ardublockly.proxyActionDeleteSchedule = function (evt) {
  var button_delete_schedule = document.getElementById("button_delete_schedule");
  button_delete_schedule.disabled = true;

  var id = evt.currentTarget.value;
  var actionExecute = {
    idKey: id,
    action: "ACTION_DELETE"
  };

  ArdublocklyServer.requestDeleteSchedule(actionExecute, function (jsonObj) {
    if (jsonObj) {
      document.getElementById('modal_add_cronjob').style.display = 'none';
      Ardublockly.removeScheduleHtmlTableRow(id);
    }
    button_delete_schedule.disabled = false;
  });

};

Ardublockly.proxyActionUpdateSchedule = function (evt) {
  var button_update_schedule = document.getElementById("button_update_schedule");
  button_update_schedule.disabled = true;

  var id = evt.currentTarget.value;

  var modems = [];
  var list = document.getElementById('add_list_id').value;
  if (list) {
    var lines = list.split('\n');
    var length = lines.length;
    for (var i = 0; i < length; i++) {
      var lineContent = lines[i].trim();
      if (lineContent) {
        modems.push(lineContent);
      }
    }
  }

  var scheduleUpdateExecute = {
    scheduleId: id,
    listModem: modems,
    cronExpress: document.getElementById('add_job_cron_express').value,
    type: document.getElementById('add_job_select').value
  };

  console.log(scheduleUpdateExecute);
  ArdublocklyServer.requestUpdateSchedule(scheduleUpdateExecute, function (jsonObj) {
    if (jsonObj) {
      document.getElementById('modal_add_cronjob').style.display = 'none';
      Ardublockly.addOrUpdateScheduleHtmlTableRow(jsonObj);
    }
    button_update_schedule.disabled = false;
  });

};



Ardublockly.saveSystemConfigRun = function (evt) {
  var button = evt.currentTarget;
  button.disabled = true;

  var cb_modem_connection = document.getElementById('cb_modem_connection').checked;
  var cb_modem_network = document.getElementById('cb_modem_network').checked;

  var configSetting = {
    checkModemConnectChange: cb_modem_connection,
    checkModemStatusChange: cb_modem_network,
    checkModemConnectTime: 5,
    checkModemStatusTime: 60
  };


  ArdublocklyServer.saveSystemRunConfig(configSetting, function (jsonObj) {
    Ardublockly.shortMessage("Config Saved!")
    button.disabled = false;
  });

};


Ardublockly.saveProxyCommonSetting = function (evt, type) {
  var button = evt.currentTarget;
  button.disabled = true;

  var authUsername = document.getElementById('settings_proxy_auth_username').value;
  var authPassword = document.getElementById('settings_proxy_auth_password').value;
  var localBeginPort = document.getElementById('settings_port_begin').value;
  var el = document.getElementById('settings_proxy_ip');
  var localIp = el.options[el.selectedIndex].value;
  //Advenced
  var clientToProxyAcceptorThreads = document.getElementById("adv_settings_clientToProxyAcceptorThreads").value;
  var clientToProxyWorkerThreads = document.getElementById("adv_settings_clientToProxyWorkerThreads").value;
  var proxyToServerWorkerThreads = document.getElementById("adv_settings_proxyToServerWorkerThreads").value;
  var maxChunkSize = document.getElementById("adv_settings_maxChunkSize").value;

  var transparent = document.getElementById("adv_cb_proxy_transparent").checked;
  var allowLocalOnly = document.getElementById("adv_cb_proxy_allowLocalOnly").checked;
  var allowRequestToOriginServer = document.getElementById("adv_cb_proxy_allowRequestToOriginServer").checked;
  var acceptProxyProtocol = document.getElementById("adv_cb_proxy_acceptProxyProtocol").checked;
  var sendProxyProtocol = document.getElementById("adv_cb_proxy_sendProxyProtocol").checked;

  var enableProxySocks = document.getElementById("cb_proxy_socks").checked;

  //
  var resetChangeIpMode = document.getElementById("adv_settings_change_ip_mode").value;
  var includeIpInChangeResult = document.getElementById("cb_proxy_include_result_ip").checked;

  var adminPassword = document.getElementById("settings_modem_admin_password").value;
  var waitConnected = document.getElementById("settings_modem_network_wait_connected").value;
  var timeoutConnected = document.getElementById("settings_modem_timeout_wait_connected").value;



  //
  var commonSetting = {
    proxyAuthUsername: authUsername,
    proxyAuthPassword: authPassword,
    proxyLocalBeginPort: localBeginPort,
    //
    clientToProxyAcceptorThreads: clientToProxyAcceptorThreads,
    clientToProxyWorkerThreads: clientToProxyWorkerThreads,
    proxyToServerWorkerThreads: proxyToServerWorkerThreads,
    maxChunkSize: maxChunkSize,
    transparent: transparent,
    allowLocalOnly: allowLocalOnly,
    allowRequestToOriginServer: allowRequestToOriginServer,
    acceptProxyProtocol: acceptProxyProtocol,
    sendProxyProtocol: sendProxyProtocol,
    maxInitialLineLength: 8192,
    maxHeaderSize: 8192 * 2,
    //
    socksEnable: enableProxySocks,
    //
    changeIpMode: resetChangeIpMode,
    includeIpResult: includeIpInChangeResult,
    modemAdminPassword: adminPassword,
    networkWaitConnected: waitConnected,
    timeoutWaitConnected: timeoutConnected,
    localAddress: localIp
  };

  console.log(commonSetting);
  if (type === "new") {
    ArdublocklyServer.saveSettingsOnlyNew(commonSetting, function (jsonObj) {
      Ardublockly.shortMessage("Apply for only new device Saved!")
      button.disabled = false;
    });
  } else {
    ArdublocklyServer.saveSettings(commonSetting, function (jsonObj) {
      Ardublockly.shortMessage("Apply for all device Saved!")
      button.disabled = false;
    });
  }

};



Ardublockly.saveProxySingleSetting = function (evt) {
  var button = evt.currentTarget;
  button.disabled = true;
  var id = evt.currentTarget.value;
  var authUsername = document.getElementById('single_settings_proxy_auth_username').value;
  var authPassword = document.getElementById('single_settings_proxy_auth_password').value;
  var localBeginPort = document.getElementById('single_settings_port_begin').value;
  var el = document.getElementById('settings_proxy_ip');
  var localIp = el.options[el.selectedIndex].value;
  var commonSetting = {
    proxyAuthUsername: authUsername,
    proxyAuthPassword: authPassword,
    proxyLocalBeginPort: localBeginPort,
    proxyId: id
  };

  ArdublocklyServer.saveSettingsSingle(commonSetting, function (jsonObj) {
    Ardublockly.shortMessage("Saved!")
    button.disabled = false;
  });
};

/** Informs the user that the selected function is not yet implemented. */
Ardublockly.functionNotImplemented = function () {
  Ardublockly.shortMessage('Function not yet implemented');
};

/**
 * Interface to display messages with a possible action.
 * @param {!string} title HTML to include in title.
 * @param {!element} body HTML to include in body.
 * @param {boolean=} confirm Indicates if the user is shown a single option (ok)
 *     or an option to cancel, with an action applied to the "ok".
 * @param {string=|function=} callback If confirm option is selected this would
 *     be the function called when clicked 'OK'.
 */
Ardublockly.alertMessage = function (title, body, confirm, callback) {
  Ardublockly.materialAlert(title, body, confirm, callback);
};

/**
 * Interface to displays a short message, which disappears after a time out.
 * @param {!string} message Text to be temporarily displayed.
 */
Ardublockly.shortMessage = function (message) {
  Ardublockly.MaterialToast(message);
};

/**
 * Bind a function to a button's click event.
 * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!function} func Event handler to bind.
 * @private
 */
Ardublockly.bindClick_ = function (el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  // Need to ensure both, touch and click, events don't fire for the same thing
  var propagateOnce = function (e) {
    e.stopPropagation();
    e.preventDefault();
    func();
  };
  el.addEventListener('ontouchend', propagateOnce);
  el.addEventListener('click', propagateOnce);
};
