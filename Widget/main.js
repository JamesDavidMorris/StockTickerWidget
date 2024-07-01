const { app, BrowserWindow, ipcMain, shell, Tray, Menu } = require('electron');
const path = require('path');
const AutoLaunch = require('auto-launch');
const fs = require('fs');

const { loadConfig, saveConfig } = require('./config');
const { createMainWindow, setupMainWindowWebContents, setupIPCHandlers, setupWindowEventHandlers, reloadWidgetContent } = require('./window');
const { createTray } = require('./tray');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('no-sandbox');

let mainWindow;
let tray = null;
let inputEnabled = true;
let alwaysOnTop = true;

/**
 * Creates the main application window, initializes it, and sets up necessary handlers.
 */
function createWindow() {
  const config = loadConfig();
  const lastWindowState = config.windowState;
  const { transparency, backgroundColor, borderRadius } = config.appearance;

  inputEnabled = lastWindowState.inputEnabled;
  alwaysOnTop = lastWindowState.alwaysOnTop;

  mainWindow = createMainWindow(lastWindowState, alwaysOnTop);

  setupMainWindowWebContents(mainWindow, { transparency, backgroundColor, borderRadius });
  setupIPCHandlers(mainWindow);
  setupWindowEventHandlers(mainWindow, config, () => inputEnabled, () => alwaysOnTop);

  tray = createTray(mainWindow, () => inputEnabled, () => alwaysOnTop, toggleInput, toggleAlwaysOnTop, loadConfig, saveConfig);

  mainWindow.setAlwaysOnTop(alwaysOnTop);
  mainWindow.setIgnoreMouseEvents(!inputEnabled, { forward: inputEnabled });

  setupAutoLaunch();

  // Set up file watcher to monitor changes to widget.html
  const widgetHtmlPath = process.env.NODE_ENV === 'development' ?
    path.join(__dirname, 'widget.html') :
    path.join(process.resourcesPath, 'widget.html');

  fs.watchFile(widgetHtmlPath, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      reloadWidgetContent(mainWindow, widgetHtmlPath);
    }
  });
}

/**
 * Toggles the input enabled state.
 */
function toggleInput() {
  inputEnabled = !inputEnabled;
  mainWindow.setIgnoreMouseEvents(!inputEnabled, { forward: inputEnabled });

  const config = loadConfig();
  config.windowState.inputEnabled = inputEnabled;
  saveConfig(config);
}

/**
 * Toggles the always on top state.
 */
function toggleAlwaysOnTop() {
  alwaysOnTop = !alwaysOnTop;
  mainWindow.setAlwaysOnTop(alwaysOnTop);

  const config = loadConfig();
  config.windowState.alwaysOnTop = alwaysOnTop;
  saveConfig(config);
}

/**
 * Sets up the application to run on startup.
 */
function setupAutoLaunch() {
  const autoLaunch = new AutoLaunch({
    name: 'Trading View Widget',
    path: app.getPath('exe'),
  });

  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
  }).catch((err) => {
    console.error('Failed to enable auto-launch:', err);
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
