const fs = require('fs');
const path = require('path');
const ini = require('ini');

const configFilePath = process.env.NODE_ENV === 'development' ?
    path.join(__dirname, 'config.ini') :
    path.join(process.resourcesPath, 'config.ini');

const defaultConfig = {
  windowState: {
    width: 400,
    height: 100,
    x: undefined,
    y: undefined,
    inputEnabled: true,
    alwaysOnTop: true
  },
  appearance: {
    transparency: 50,
    backgroundColor: '#000000',
    borderRadius: 15
  }
};

/**
 * Clamps a value between a minimum and maximum range.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum range.
 * @param {number} max - The maximum range.
 * @returns {number} - The clamped value.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Loads the configuration from the config.ini file.
 * If the file does not exist, it creates a default configuration file.
 * @returns {object} - The loaded configuration object.
 */
function loadConfig() {
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, ini.stringify(defaultConfig));
    return defaultConfig;
  }

  const config = ini.parse(fs.readFileSync(configFilePath, 'utf-8'));

  config.windowState.width = Number(config.windowState.width) || defaultConfig.windowState.width;
  config.windowState.height = Number(config.windowState.height) || defaultConfig.windowState.height;
  config.windowState.x = config.windowState.x !== undefined ? Number(config.windowState.x) : defaultConfig.windowState.x;
  config.windowState.y = config.windowState.y !== undefined ? Number(config.windowState.y) : defaultConfig.windowState.y;

  config.windowState.inputEnabled = (String(config.windowState.inputEnabled).toLowerCase() === 'true');
  config.windowState.alwaysOnTop = (String(config.windowState.alwaysOnTop).toLowerCase() === 'true');

  const transparencyValue = Number(config.appearance.transparency);
  config.appearance.transparency = !isNaN(transparencyValue) ? clamp(transparencyValue, 0.01, 100) : defaultConfig.appearance.transparency;
  config.appearance.borderRadius = Number(config.appearance.borderRadius) || defaultConfig.appearance.borderRadius;
  config.appearance.backgroundColor = config.appearance.backgroundColor || defaultConfig.appearance.backgroundColor;

  return config;
}

/**
 * Saves the current configuration to the config.ini file.
 * @param {object} config - The configuration object to save.
 */
function saveConfig(config) {
  const configString = ini.stringify(config);
  fs.writeFileSync(configFilePath, configString);
}

module.exports = { loadConfig, saveConfig };
