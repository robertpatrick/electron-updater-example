// This is free and unencumbered software released into the public domain.
// See LICENSE for details

const {app, BrowserWindow, dialog, Menu, protocol, ipcMain} = require('electron');
if (process.platform === 'linux') {
  let proxy;
  if (process.env.HTTPS_PROXY) {
    proxy = process.env.HTTPS_PROXY;
  } else if (process.env.HTTP_PROXY) {
    proxy = process.env.HTTP_PROXY;
  }

  if (proxy) {
    app.commandLine.appendSwitch('proxy-server', proxy);
    if (process.env.NO_PROXY) {
      app.commandLine.appendSwitch('proxy-bypass-list', process.env.NO_PROXY);
    }
  }
}

const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//-------------------------------------------------------------------
// Define the menu
//
// THIS SECTION IS NOT REQUIRED
//-------------------------------------------------------------------
let template = []
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
}


//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}
function createDefaultWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });

  if (process.platform === 'linux' && process.env.HTTPS_PROXY) {
    const bypassProxyHosts = process.env.NO_PROXY;
    win.webContents.session.setProxy({
      proxyRules: process.env.HTTPS_PROXY,
      proxyBypassRules: bypassProxyHosts
    });
  }
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available: ' + JSON.stringify(info));
  autoUpdater.downloadUpdate().then();
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available: ' + JSON.stringify(info));
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
  dialog.showMessageBox({
    title: 'Install Now?',
    message: 'Would you like to install now or on exit?',
    type: 'question',
    buttons: [ 'On Exit', 'Now' ],
    defaultId: 1,
    cancelId: 0
  }).then(dialogResponse => {
    if (dialogResponse.response) {
      sendStatusToWindow('Starting Installation and Relaunch process');
      autoUpdater.quitAndInstall();
    } else {
      sendStatusToWindow('Will install on exit');
    }
  })
});
app.on('ready', function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createDefaultWindow();
});
app.on('window-all-closed', () => {
  app.quit();
});

//
// CHOOSE one of the following options for Auto updates
//

//-------------------------------------------------------------------
// Auto updates - Option 1 - Simplest version
//
// This will immediately download an update, then install when the
// app quits.
//-------------------------------------------------------------------
// app.on('ready', function()  {
//   autoUpdater.checkForUpdatesAndNotify();
// });

//-------------------------------------------------------------------
// Auto updates - Option 2 - More control
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------

app.on('ready', function()  {
  autoUpdater.checkForUpdates().then();
});

// autoUpdater.on('checking-for-update', (foo) => {
//   log.info('got checking-for-update event: %s', JSON.stringify(foo));
// });
// autoUpdater.on('update-available', (info) => {
//   log.info('got update-available event: %s', JSON.stringify(info));
// })
// autoUpdater.on('update-not-available', (info) => {
//   log.info('got update-not-available event: %s', JSON.stringify(info));
// })
// autoUpdater.on('error', (err) => {
//   log.info('got error event: %s', JSON.stringify(err));
// })
// autoUpdater.on('download-progress', (progressObj) => {
//   log.info('got download-progress event: %s', JSON.stringify(progressObj));
// })
// autoUpdater.on('update-downloaded', (info) => {
//   log.info('got update-downloaded event: %s', JSON.stringify(info));
//   autoUpdater.autoInstallOnAppQuit = true;
// })
