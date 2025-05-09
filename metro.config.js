const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Pour gérer les extensions .cjs si tu utilises Firebase
defaultConfig.resolver.sourceExts.push('cjs');

// La ligne importante à ajouter
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
