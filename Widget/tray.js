const { app, Menu, Tray, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');

/**
 * Creates the system tray icon and context menu.
 * @param {BrowserWindow} mainWindow - The main application window.
 * @param {Function} getInputEnabled - Function to get the current inputEnabled state.
 * @param {Function} getAlwaysOnTop - Function to get the current alwaysOnTop state.
 * @param {Function} toggleInput - Function to toggle inputEnabled state.
 * @param {Function} toggleAlwaysOnTop - Function to toggle alwaysOnTop state.
 * @param {Function} loadConfig - Function to load the configuration.
 * @param {Function} saveConfig - Function to save the configuration.
 * @returns {Tray} - The created Tray instance.
 */
function createTray(mainWindow, getInputEnabled, getAlwaysOnTop, toggleInput, toggleAlwaysOnTop, loadConfig, saveConfig) {
  const iconPath = path.join(__dirname, 'icon/tradingview_widget_icon.png');
  const tray = new Tray(iconPath);

  const widgetHtmlPath = process.env.NODE_ENV === 'development' ?
    path.join(__dirname, 'widget.html') :
    path.join(process.resourcesPath, 'widget.html');

  let contextMenu = Menu.buildFromTemplate([
    {
      label: 'Hide App',
      click: () => {
        mainWindow.hide();
        updateContextMenu();
      }
    },
    {
      label: 'Change Tickers',
      click: () => {
        openFileInTextEditor(widgetHtmlPath);
      }
    },
    {
      label: getInputEnabled() ? 'Disable Input' : 'Enable Input',
      click: () => {
        toggleInput();
        updateContextMenu();
      }
    },
    {
      label: getAlwaysOnTop() ? 'Disable Always On Top' : 'Enable Always On Top',
      click: () => {
        toggleAlwaysOnTop();
        updateContextMenu();
      }
    },
    {
      label: 'Quit',
      click: () => {
        // Save the current state before quitting
        const config = loadConfig();
        config.windowState.inputEnabled = getInputEnabled();
        config.windowState.alwaysOnTop = getAlwaysOnTop();
        saveConfig(config);
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Trading View Widget');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
    updateContextMenu();
  });

  tray.on('double-click', () => {
    mainWindow.show();
    updateContextMenu();
  });

  /**
   * Opens a file in the OS preferred text editor.
   * @param {string} filePath - The path to the file to open.
   */
  function openFileInTextEditor(filePath) {
    let command;

    switch (process.platform) {
      case 'win32':
        command = `notepad.exe "${filePath}"`;
        break;
      case 'darwin':
        command = `open -e "${filePath}"`;
        break;
      default:
        command = `xdg-open "${filePath}"`;
        break;
    }

    exec(command, (error) => {
      if (error) {
        console.error('Failed to open file:', error);
      }
    });
  }

  /**
   * Updates the context menu based on the current application state.
   */
  function updateContextMenu() {
    contextMenu = Menu.buildFromTemplate([
      {
        label: mainWindow.isVisible() ? 'Hide App' : 'Show App',
        click: () => {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
          }
          updateContextMenu();
        }
      },
      {
        label: 'Change Tickers',
        click: () => {
          openFileInTextEditor(widgetHtmlPath);
        }
      },
      {
        label: getInputEnabled() ? 'Disable Input' : 'Enable Input',
        click: () => {
          toggleInput();
          updateContextMenu();
        }
      },
      {
        label: getAlwaysOnTop() ? 'Disable Always On Top' : 'Enable Always On Top',
        click: () => {
          toggleAlwaysOnTop();
          updateContextMenu();
        }
      },
      {
        label: 'Quit',
        click: () => {
          // Save the current state before quitting
          const config = loadConfig();
          config.windowState.inputEnabled = getInputEnabled();
          config.windowState.alwaysOnTop = getAlwaysOnTop();
          saveConfig(config);
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
  }

  return tray;
}

module.exports = { createTray };
