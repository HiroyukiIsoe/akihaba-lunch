// 秋葉原ランチマップ - メインアプリケーション

// アプリケーション設定を取得
const AKIHABARA_CENTER = APP_CONFIG.map.center;
const DEFAULT_ZOOM = APP_CONFIG.map.defaultZoom;

// グローバル変数
let mapManager = null;
let restaurantManager = null;
let infoPanelManager = null;

// アプリケーション初期化
document.addEventListener("DOMContentLoaded", async function () {
  console.log("秋葉原ランチマップを初期化中...");

  try {
    // ローディング表示
    showLoading(true);

    // 各マネージャーインスタンスを作成
    mapManager = new MapManager("map", AKIHABARA_CENTER, DEFAULT_ZOOM);
    infoPanelManager = new InfoPanelManager("info-panel");
    restaurantManager = new RestaurantManager(mapManager, infoPanelManager);

    // 地図を初期化（要件1.1, 1.2, 1.3に対応）
    mapManager.initializeMap();
    console.log("地図の初期化が完了しました");

    // 情報パネルにデフォルトメッセージを表示
    infoPanelManager.showDefaultMessage();

    // DataLoaderのテスト実行（開発環境のみ）
    if (isDevelopmentMode()) {
      await testDataLoader();
    }

    // レストランデータを読み込んで表示
    await restaurantManager.loadRestaurants();
    restaurantManager.displayRestaurants();

    // ローディング非表示
    showLoading(false);

    console.log("アプリケーションの初期化が完了しました");
  } catch (error) {
    console.error("アプリケーションの初期化に失敗しました:", error);
    showLoading(false);
    showError(
      "アプリケーションの初期化に失敗しました。ページを再読み込みしてください。"
    );
  }
});

/**
 * グローバル関数: レストラン詳細を表示する
 * HTMLのonclickイベントから呼び出される
 * @param {string} restaurantId - レストランID
 */
function showRestaurantDetails(restaurantId) {
  try {
    if (!restaurantManager) {
      throw new Error("RestaurantManagerが初期化されていません");
    }

    const restaurant = restaurantManager.findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new Error(`レストラン（ID: ${restaurantId}）が見つかりません`);
    }

    restaurantManager.showRestaurantInfo(restaurant);
  } catch (error) {
    console.error("レストラン詳細表示に失敗しました:", error);
    if (infoPanelManager) {
      infoPanelManager.showErrorMessage("店舗情報の表示に失敗しました");
    }
  }
}

/**
 * 開発モードかどうかを判定する
 * @returns {boolean} 開発モードの場合true
 */
function isDevelopmentMode() {
  // URLパラメータで開発モードを判定
  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get("debug");

  // localhost または file:// プロトコルの場合は開発モード
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  // ?debug=true パラメータがある場合は開発モード
  const isDebugMode = debugParam === "true";

  return isLocalhost || isDebugMode;
}

/**
 * グローバル関数: アプリケーションの状態を取得する（デバッグ用）
 * 開発モードでのみ利用可能
 * @returns {Object} アプリケーションの状態
 */
function getAppState() {
  if (!isDevelopmentMode()) {
    console.warn("getAppState()は開発モードでのみ利用可能です");
    return null;
  }

  return {
    mapManager: mapManager,
    restaurantManager: restaurantManager,
    infoPanelManager: infoPanelManager,
    restaurants: restaurantManager ? restaurantManager.getRestaurants() : [],
    restaurantGroups: restaurantManager
      ? restaurantManager.getRestaurantGroups()
      : new Map(),
  };
}

// エラーハンドリング: 未処理のエラーをキャッチ
window.addEventListener("error", function (event) {
  console.error("未処理のエラーが発生しました:", event.error);
  showError("予期しないエラーが発生しました。ページを再読み込みしてください。");
});

// エラーハンドリング: 未処理のPromise拒否をキャッチ
window.addEventListener("unhandledrejection", function (event) {
  console.error("未処理のPromise拒否が発生しました:", event.reason);
  showError("データの読み込みに失敗しました。ページを再読み込みしてください。");
});
