// 秋葉原ランチマップ - 設定ファイル

/**
 * アプリケーション設定
 */
const APP_CONFIG = {
  // 開発モード設定
  development: {
    enableDebugLogs: true,
    enableTestFunctions: true,
    enablePerformanceMonitoring: true,
    showDetailedErrors: true,
  },

  // 本番モード設定
  production: {
    enableDebugLogs: false,
    enableTestFunctions: false,
    enablePerformanceMonitoring: false,
    showDetailedErrors: false,
  },

  // 地図設定
  map: {
    center: {
      lat: 35.7017929,
      lng: 139.7703092,
    },
    defaultZoom: 18,
    minZoom: 10,
    maxZoom: 19,
  },

  // UI設定
  ui: {
    loadingTimeout: 10000, // 10秒
    errorDisplayDuration: 5000, // 5秒
  },
};

/**
 * 現在の環境設定を取得する
 * @returns {Object} 環境設定
 */
function getCurrentConfig() {
  const isDev = isDevelopmentMode();
  return isDev ? APP_CONFIG.development : APP_CONFIG.production;
}

/**
 * デバッグログを出力する（開発モードのみ）
 * @param {string} message - ログメッセージ
 * @param {...any} args - 追加の引数
 */
function debugLog(message, ...args) {
  const config = getCurrentConfig();
  if (config.enableDebugLogs) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

/**
 * パフォーマンス測定を開始する（開発モードのみ）
 * @param {string} label - 測定ラベル
 */
function startPerformanceTimer(label) {
  const config = getCurrentConfig();
  if (config.enablePerformanceMonitoring && performance && performance.mark) {
    performance.mark(`${label}-start`);
  }
}

/**
 * パフォーマンス測定を終了する（開発モードのみ）
 * @param {string} label - 測定ラベル
 */
function endPerformanceTimer(label) {
  const config = getCurrentConfig();
  if (
    config.enablePerformanceMonitoring &&
    performance &&
    performance.mark &&
    performance.measure
  ) {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);

    const measure = performance.getEntriesByName(label)[0];
    if (measure) {
      debugLog(`Performance: ${label} took ${measure.duration.toFixed(2)}ms`);
    }
  }
}
