const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Force disable lazy bundling - fixes 99.9% hang
process.env.EXPO_NO_METRO_LAZY = "1";

const config = getDefaultConfig(__dirname);

// Critical: Disable unstable package exports that cause build hangs
config.resolver.unstable_enablePackageExports = false;

// Polyfill react-native-reanimated on web (it doesn't support web)
const reanimatedPolyfill = path.resolve(
  __dirname,
  "src/web/reanimated.polyfill.ts",
);
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, alias react-native-reanimated to our polyfill
  if (platform === "web" && moduleName === "react-native-reanimated") {
    return { filePath: reanimatedPolyfill, type: "sourceFile" };
  }
  // Keep expo-sqlite out of the web bundle
  if (platform === "web" && moduleName === "expo-sqlite") {
    const sqliteWebStub = path.resolve(
      __dirname,
      "src/database/sqlite.web.stub.ts",
    );
    return { filePath: sqliteWebStub, type: "sourceFile" };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

console.log("Metro config loaded for web build");
module.exports = config;
