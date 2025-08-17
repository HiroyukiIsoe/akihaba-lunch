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

    // レスポンシブデザインとタッチデバイス対応の初期化
    initializeResponsiveDesign();

    // 各マネージャーインスタンスを作成
    mapManager = new MapManager("map", AKIHABARA_CENTER, DEFAULT_ZOOM);
    infoPanelManager = new InfoPanelManager("info-panel");
    restaurantManager = new RestaurantManager(mapManager, infoPanelManager);

    // 地図を初期化（要件1.1, 1.2, 1.3に対応）
    mapManager.initializeMap();
    console.log("地図の初期化が完了しました");

    // 地図の表示を確実にするための追加処理
    setTimeout(() => {
      if (mapManager && mapManager.getMap()) {
        mapManager.getMap().invalidateSize();
        console.log("地図の表示を再調整しました");
      }
    }, 500);

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
 * レスポンシブデザインとタッチデバイス対応を初期化する
 */
function initializeResponsiveDesign() {
  try {
    // デバイス情報の取得
    const deviceInfo = getDeviceInfo();
    console.log("デバイス情報:", deviceInfo);

    // ビューポートの設定確認と調整
    setupViewport();

    // 画面サイズ変更とデバイス回転の監視
    setupResponsiveListeners();

    // タッチデバイス固有の設定
    if (deviceInfo.isTouchDevice) {
      setupTouchDeviceOptimizations();
    }

    // 初期レイアウト調整
    adjustLayoutForCurrentScreen();

    console.log("レスポンシブデザインとタッチデバイス対応が初期化されました");
  } catch (error) {
    console.error("レスポンシブデザイン初期化に失敗しました:", error);
  }
}

/**
 * デバイス情報を取得する
 * @returns {Object} デバイス情報
 */
function getDeviceInfo() {
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 480;
  const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;
  const isDesktop = window.innerWidth > 768;
  const isLandscape = window.innerWidth > window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;

  return {
    isTouchDevice,
    isSmallScreen,
    isTablet,
    isDesktop,
    isLandscape,
    pixelRatio,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: navigator.userAgent,
  };
}

/**
 * ビューポートの設定を確認・調整する
 */
function setupViewport() {
  try {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      // 既存のビューポート設定を確認
      const content = viewportMeta.getAttribute("content");
      if (!content.includes("user-scalable=no")) {
        // ユーザーによるズームを許可（アクセシビリティ向上）
        console.log("ビューポート設定: ユーザーズーム許可");
      }
    }
  } catch (error) {
    console.error("ビューポート設定の確認に失敗しました:", error);
  }
}

/**
 * レスポンシブリスナーを設定する
 */
function setupResponsiveListeners() {
  try {
    // リサイズイベントのデバウンス処理
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        handleScreenResize();
      }, 250);
    });

    // デバイス回転イベント
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        handleOrientationChange();
      }, 100);
    });

    // メディアクエリの変更監視
    setupMediaQueryListeners();
  } catch (error) {
    console.error("レスポンシブリスナーの設定に失敗しました:", error);
  }
}

/**
 * メディアクエリリスナーを設定する
 */
function setupMediaQueryListeners() {
  try {
    // スマートフォンサイズの監視
    const mobileQuery = window.matchMedia("(max-width: 480px)");
    mobileQuery.addListener(handleMobileLayoutChange);

    // タブレットサイズの監視
    const tabletQuery = window.matchMedia("(max-width: 768px)");
    tabletQuery.addListener(handleTabletLayoutChange);

    // 横向き表示の監視
    const landscapeQuery = window.matchMedia("(orientation: landscape)");
    landscapeQuery.addListener(handleOrientationLayoutChange);
  } catch (error) {
    console.error("メディアクエリリスナーの設定に失敗しました:", error);
  }
}

/**
 * タッチデバイス固有の最適化を設定する
 */
function setupTouchDeviceOptimizations() {
  try {
    // タッチイベントのパッシブリスナー設定
    document.addEventListener("touchstart", () => {}, { passive: true });
    document.addEventListener("touchmove", () => {}, { passive: true });

    // iOS Safariの特別な対応
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      setupiOSOptimizations();
    }

    // Androidの特別な対応
    if (/Android/.test(navigator.userAgent)) {
      setupAndroidOptimizations();
    }

    console.log("タッチデバイス最適化が適用されました");
  } catch (error) {
    console.error("タッチデバイス最適化の設定に失敗しました:", error);
  }
}

/**
 * iOS固有の最適化を設定する
 */
function setupiOSOptimizations() {
  try {
    // iOS Safariのバウンススクロール対策
    document.body.style.webkitOverflowScrolling = "touch";

    // iOS Safariのズーム無効化（必要に応じて）
    document.addEventListener("gesturestart", (e) => {
      e.preventDefault();
    });

    console.log("iOS固有の最適化が適用されました");
  } catch (error) {
    console.error("iOS最適化の設定に失敗しました:", error);
  }
}

/**
 * Android固有の最適化を設定する
 */
function setupAndroidOptimizations() {
  try {
    // Android Chromeの特別な対応（必要に応じて追加）
    console.log("Android固有の最適化が適用されました");
  } catch (error) {
    console.error("Android最適化の設定に失敗しました:", error);
  }
}

/**
 * 画面リサイズ時の処理
 */
function handleScreenResize() {
  try {
    adjustLayoutForCurrentScreen();

    // 地図のサイズを再計算
    if (mapManager && mapManager.getMap()) {
      mapManager.getMap().invalidateSize();
    }

    console.log("画面リサイズに対応しました");
  } catch (error) {
    console.error("画面リサイズ処理に失敗しました:", error);
  }
}

/**
 * デバイス回転時の処理
 */
function handleOrientationChange() {
  try {
    adjustLayoutForCurrentScreen();

    // 地図のサイズを再計算
    if (mapManager && mapManager.getMap()) {
      mapManager.getMap().invalidateSize();
    }

    console.log("デバイス回転に対応しました");
  } catch (error) {
    console.error("デバイス回転処理に失敗しました:", error);
  }
}

/**
 * モバイルレイアウト変更時の処理
 */
function handleMobileLayoutChange(mq) {
  try {
    if (mq.matches) {
      // スマートフォンレイアウトに切り替え
      document.body.classList.add("mobile-layout");
      console.log("スマートフォンレイアウトに切り替えました");
    } else {
      document.body.classList.remove("mobile-layout");
    }
  } catch (error) {
    console.error("モバイルレイアウト変更処理に失敗しました:", error);
  }
}

/**
 * タブレットレイアウト変更時の処理
 */
function handleTabletLayoutChange(mq) {
  try {
    if (mq.matches) {
      // タブレットレイアウトに切り替え
      document.body.classList.add("tablet-layout");
      console.log("タブレットレイアウトに切り替えました");
    } else {
      document.body.classList.remove("tablet-layout");
    }
  } catch (error) {
    console.error("タブレットレイアウト変更処理に失敗しました:", error);
  }
}

/**
 * 横向きレイアウト変更時の処理
 */
function handleOrientationLayoutChange(mq) {
  try {
    if (mq.matches) {
      // 横向きレイアウトに切り替え
      document.body.classList.add("landscape-layout");
      console.log("横向きレイアウトに切り替えました");
    } else {
      document.body.classList.remove("landscape-layout");
    }
  } catch (error) {
    console.error("横向きレイアウト変更処理に失敗しました:", error);
  }
}

/**
 * 現在の画面サイズに応じてレイアウトを調整する
 */
function adjustLayoutForCurrentScreen() {
  try {
    const deviceInfo = getDeviceInfo();

    // 画面サイズに応じたクラスを追加
    document.body.className = document.body.className.replace(
      /\b(mobile|tablet|desktop)-layout\b/g,
      ""
    );

    if (deviceInfo.isSmallScreen) {
      document.body.classList.add("mobile-layout");
    } else if (deviceInfo.isTablet) {
      document.body.classList.add("tablet-layout");
    } else if (deviceInfo.isDesktop) {
      document.body.classList.add("desktop-layout");
    }

    if (deviceInfo.isLandscape) {
      document.body.classList.add("landscape-layout");
    } else {
      document.body.classList.remove("landscape-layout");
    }

    if (deviceInfo.isTouchDevice) {
      document.body.classList.add("touch-device");
    }

    // 地図のサイズ再計算（モバイルデバイスでの表示問題対応）
    if (mapManager && mapManager.getMap()) {
      setTimeout(() => {
        mapManager.getMap().invalidateSize();
        // 地図コンテナの強制リサイズ
        const mapContainer = document.getElementById("map");
        if (mapContainer && deviceInfo.isTouchDevice) {
          mapContainer.style.width = "100%";
          mapContainer.style.height = "100%";
          mapManager.getMap().invalidateSize();
        }
      }, 100);
    }
  } catch (error) {
    console.error("レイアウト調整に失敗しました:", error);
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
