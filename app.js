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
      await testErrorHandlingAndSecurity();
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
 * グローバル関数: 履歴から複数店舗一覧を表示する
 * HTMLのonclickイベントから呼び出される
 */
function showMultipleRestaurantsFromHistory() {
  try {
    if (!infoPanelManager) {
      throw new Error("InfoPanelManagerが初期化されていません");
    }

    infoPanelManager.showMultipleRestaurantsFromHistory();
  } catch (error) {
    console.error("複数店舗一覧の履歴表示に失敗しました:", error);
    if (infoPanelManager) {
      infoPanelManager.showErrorMessage("店舗一覧の表示に失敗しました");
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

// グローバルエラーハンドリング（強化版）

// 未処理のJavaScriptエラーをキャッチ
window.addEventListener("error", function (event) {
  const error = event.error;
  const errorInfo = {
    message: error?.message || event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
  };

  console.error("未処理のJavaScriptエラーが発生しました:", errorInfo);

  // ユーザーフレンドリーなエラーメッセージを表示
  let userMessage = "予期しないエラーが発生しました。";

  if (errorInfo.message.includes("RESTAURANT_DATA")) {
    userMessage = "レストランデータの読み込みに失敗しました。";
  } else if (
    errorInfo.message.includes("Leaflet") ||
    errorInfo.message.includes("map")
  ) {
    userMessage = "地図の表示に問題が発生しました。";
  } else if (
    errorInfo.message.includes("fetch") ||
    errorInfo.message.includes("network")
  ) {
    userMessage = "ネットワークエラーが発生しました。";
  }

  showError(`${userMessage} ページを再読み込みしてください。`, "error", true);

  // 開発モードでは詳細情報をコンソールに出力
  if (isDevelopmentMode()) {
    console.table(errorInfo);
  }
});

// 未処理のPromise拒否をキャッチ
window.addEventListener("unhandledrejection", function (event) {
  const reason = event.reason;
  const errorInfo = {
    reason: reason?.message || reason,
    stack: reason?.stack,
    timestamp: new Date().toISOString(),
  };

  console.error("未処理のPromise拒否が発生しました:", errorInfo);

  // ユーザーフレンドリーなエラーメッセージを表示
  let userMessage = "データの処理中にエラーが発生しました。";

  if (String(reason).includes("fetch") || String(reason).includes("load")) {
    userMessage = "データの読み込みに失敗しました。";
  } else if (
    String(reason).includes("coordinate") ||
    String(reason).includes("座標")
  ) {
    userMessage = "地図データに問題があります。";
  } else if (
    String(reason).includes("validation") ||
    String(reason).includes("検証")
  ) {
    userMessage = "データの検証に失敗しました。";
  }

  showError(`${userMessage} ページを再読み込みしてください。`, "error", true);

  // 開発モードでは詳細情報をコンソールに出力
  if (isDevelopmentMode()) {
    console.table(errorInfo);
  }

  // Promise拒否を処理済みとしてマーク
  event.preventDefault();
});

// リソース読み込みエラーをキャッチ
window.addEventListener(
  "error",
  function (event) {
    if (event.target !== window) {
      const target = event.target;
      const errorInfo = {
        tagName: target.tagName,
        src: target.src || target.href,
        type: event.type,
        timestamp: new Date().toISOString(),
      };

      console.error("リソース読み込みエラーが発生しました:", errorInfo);

      // 重要なリソースの読み込み失敗の場合はユーザーに通知
      if (target.tagName === "SCRIPT") {
        if (target.src.includes("leaflet")) {
          showError(
            "地図ライブラリの読み込みに失敗しました。インターネット接続を確認してください。",
            "error"
          );
        } else if (target.src.includes("data.js")) {
          showError("レストランデータの読み込みに失敗しました。", "error");
        }
      } else if (target.tagName === "LINK" && target.href.includes("leaflet")) {
        showError(
          "地図スタイルの読み込みに失敗しました。表示が正しくない可能性があります。",
          "warning",
          true
        );
      }

      // 開発モードでは詳細情報をコンソールに出力
      if (isDevelopmentMode()) {
        console.table(errorInfo);
      }
    }
  },
  true
); // キャプチャフェーズで実行

// セキュリティ関連のエラーハンドリング
window.addEventListener("securitypolicyviolation", function (event) {
  const violationInfo = {
    blockedURI: event.blockedURI,
    violatedDirective: event.violatedDirective,
    originalPolicy: event.originalPolicy,
    timestamp: new Date().toISOString(),
  };

  console.error("セキュリティポリシー違反が発生しました:", violationInfo);

  // 開発モードでは詳細情報をコンソールに出力
  if (isDevelopmentMode()) {
    console.table(violationInfo);
    showError(
      "セキュリティポリシー違反が検出されました。開発者ツールを確認してください。",
      "warning",
      true
    );
  }
});
