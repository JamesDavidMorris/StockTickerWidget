const { BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { saveConfig } = require('./config');

/**
 * Creates and returns the main application window.
 * @param {object} lastWindowState - The last saved window state from the configuration.
 * @param {boolean} alwaysOnTop - Whether the window should always be on top.
 * @returns {BrowserWindow} - The created BrowserWindow instance.
 */
function createMainWindow(lastWindowState, alwaysOnTop) {
  const mainWindow = new BrowserWindow({
    width: lastWindowState.width,
    height: lastWindowState.height,
    x: lastWindowState.x,
    y: lastWindowState.y,
    frame: false,
    transparent: true,
    resizable: true,
    skipTaskbar: true,
    alwaysOnTop: alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  if (
    typeof lastWindowState.x === 'number' &&
    typeof lastWindowState.y === 'number' &&
    typeof lastWindowState.width === 'number' &&
    typeof lastWindowState.height === 'number'
  ) {
    mainWindow.setBounds({
      x: lastWindowState.x,
      y: lastWindowState.y,
      width: lastWindowState.width,
      height: lastWindowState.height
    });
  }

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  return mainWindow;
}

/**
 * Sets up the main window's web contents, including loading widget HTML and setting appearance.
 * @param {BrowserWindow} mainWindow - The main application window.
 * @param {object} appearance - The appearance settings from the configuration.
 */
function setupMainWindowWebContents(mainWindow, appearance) {
  mainWindow.webContents.once('dom-ready', () => {
    const widgetHtmlPath = process.env.NODE_ENV === 'development' ?
      path.join(__dirname, 'widget.html') :
      path.join(process.resourcesPath, 'widget.html');

    let widgetHtml = fs.readFileSync(widgetHtmlPath, 'utf-8');

    // Manipulate the HTML to remove the specific span
    widgetHtml = widgetHtml.replace(/<span class="blue-text">Track all markets on TradingView<\/span>/, '');

    mainWindow.webContents.send('load-widget', widgetHtml);
    mainWindow.webContents.send('set-appearance', appearance);
  });
}

/**
 * Reloads the widget content from widget.html and sends it to the main window.
 * @param {BrowserWindow} mainWindow - The main application window.
 * @param {string} widgetHtmlPath - The path to the widget.html file.
 */
function reloadWidgetContent(mainWindow, widgetHtmlPath) {
  let widgetHtml = fs.readFileSync(widgetHtmlPath, 'utf-8');

  // Manipulate the HTML to remove the specific span
  widgetHtml = widgetHtml.replace(/<span class="blue-text">Track all markets on TradingView<\/span>/, '');

  mainWindow.webContents.send('load-widget', widgetHtml);
}

/**
 * Sets up the IPC handlers for the main window.
 * @param {BrowserWindow} mainWindow - The main application window.
 */
function setupIPCHandlers(mainWindow) {
  ipcMain.handle('get-bounds', () => mainWindow.getBounds());

  ipcMain.handle('move-window', (event, { x, y }) => {
    mainWindow.setBounds({ x, y, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height });
  });

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
}

/**
 * Sets up the main window event handlers for saving the window state.
 * @param {BrowserWindow} mainWindow - The main application window.
 * @param {object} config - The configuration object to update.
 * @param {function} getInputEnabled - Function to get the current inputEnabled state.
 * @param {function} getAlwaysOnTop - Function to get the current alwaysOnTop state.
 */
function setupWindowEventHandlers(mainWindow, config, getInputEnabled, getAlwaysOnTop) {
  const saveWindowState = () => {
    const bounds = mainWindow.getBounds();
    config.windowState = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      inputEnabled: getInputEnabled(),
      alwaysOnTop: getAlwaysOnTop()
    };
    saveConfig(config);
  };

  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
  mainWindow.on('close', saveWindowState);
}

module.exports = {
  createMainWindow,
  setupMainWindowWebContents,
  setupIPCHandlers,
  setupWindowEventHandlers,
  reloadWidgetContent
};
