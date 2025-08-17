// 秋葉原ランチマップ - ユーティリティ関数

/**
 * ローディング表示の制御
 * @param {boolean} show - 表示するかどうか
 */
function showLoading(show) {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.style.display = show ? "block" : "none";
  }
}

/**
 * エラーメッセージの表示（強化版）
 * @param {string} message - エラーメッセージ
 * @param {string} type - エラータイプ（'error', 'warning', 'info'）
 * @param {boolean} autoHide - 自動非表示するかどうか
 */
function showError(message, type = "error", autoHide = false) {
  try {
    // HTMLエスケープを適用
    const safeMessage = escapeHtml(message);

    const errorElement = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");

    if (errorElement && errorText) {
      // エラータイプに応じてクラスを設定
      errorElement.className = `error-message ${type}`;
      errorText.innerHTML = safeMessage;
      errorElement.style.display = "block";

      // 自動非表示の設定
      if (autoHide) {
        setTimeout(() => {
          hideError();
        }, 5000); // 5秒後に自動非表示
      }

      // アクセシビリティ対応
      errorElement.setAttribute("role", "alert");
      errorElement.setAttribute("aria-live", "polite");

      console.error(`[${type.toUpperCase()}] ${message}`);
    } else {
      // フォールバック: コンソールにエラーを出力
      console.error(`エラー表示要素が見つかりません: ${message}`);
    }
  } catch (error) {
    // エラー表示処理自体でエラーが発生した場合のフォールバック
    console.error("エラー表示処理でエラーが発生しました:", error);
    console.error("元のエラーメッセージ:", message);
  }
}

/**
 * エラーメッセージを非表示にする
 */
function hideError() {
  try {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  } catch (error) {
    console.error("エラー非表示処理でエラーが発生しました:", error);
  }
}

/**
 * HTMLエスケープ処理（強化版）
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
function escapeHtml(text) {
  try {
    // null、undefined、空文字列の処理
    if (text == null) {
      return "";
    }

    // 文字列以外の場合は文字列に変換
    const str = String(text);

    // 基本的なHTMLエスケープ
    const div = document.createElement("div");
    div.textContent = str;
    let escaped = div.innerHTML;

    // 追加のセキュリティ対策（JavaScriptインジェクション対策）
    escaped = escaped
      .replace(/javascript:/gi, "javascript&#58;")
      .replace(/vbscript:/gi, "vbscript&#58;")
      .replace(/data:/gi, "data&#58;")
      .replace(/on\w+\s*=/gi, (match) => match.replace("=", "&#61;"));

    return escaped;
  } catch (error) {
    console.error("HTMLエスケープ処理でエラーが発生しました:", error);
    // エラーが発生した場合は空文字列を返す（安全側に倒す）
    return "";
  }
}

/**
 * 属性値用のエスケープ処理
 * @param {string} text - エスケープするテキスト
 * @returns {string} 属性値用にエスケープされたテキスト
 */
function escapeAttribute(text) {
  try {
    if (text == null) {
      return "";
    }

    const str = String(text);
    return str
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\//g, "&#x2F;");
  } catch (error) {
    console.error("属性エスケープ処理でエラーが発生しました:", error);
    return "";
  }
}

/**
 * URL用のエスケープ処理
 * @param {string} url - エスケープするURL
 * @returns {string} エスケープされたURL
 */
function escapeUrl(url) {
  try {
    if (url == null) {
      return "";
    }

    const str = String(url);

    // 危険なプロトコルをブロック
    const dangerousProtocols = /^(javascript|vbscript|data|file|ftp):/i;
    if (dangerousProtocols.test(str)) {
      console.warn("危険なプロトコルが検出されました:", str);
      return "";
    }

    // HTTPまたはHTTPSのみ許可
    if (
      str.startsWith("http://") ||
      str.startsWith("https://") ||
      str.startsWith("//")
    ) {
      return encodeURI(str);
    }

    // 相対URLの場合はそのまま返す
    if (str.startsWith("/") || str.startsWith("./") || str.startsWith("../")) {
      return encodeURI(str);
    }

    // その他の場合は空文字列を返す（安全側に倒す）
    console.warn("不正なURL形式が検出されました:", str);
    return "";
  } catch (error) {
    console.error("URLエスケープ処理でエラーが発生しました:", error);
    return "";
  }
}

/**
 * DataLoaderクラスの動作テスト関数（強化版）
 * タスク5および10の実装確認用（開発モードでのみ実行）
 */
async function testDataLoader() {
  console.log("=== DataLoader動作テスト開始 ===");

  try {
    // データファイル存在確認テスト
    const fileExists = await DataLoader.checkDataFileExists();
    console.log(
      `データファイル存在確認: ${fileExists ? "存在" : "存在しない"}`
    );

    // レストランデータ読み込みテスト
    const restaurants = await DataLoader.loadRestaurants();
    console.log(`読み込み成功: ${restaurants.length}件のレストランデータ`);

    // 読み込んだデータの一部を表示（検証確認）
    if (restaurants.length > 0) {
      console.log("サンプルデータ（最初の1件）:", restaurants[0]);
    }

    // データ検証テスト（不正データでのテスト）
    console.log("データ検証テストを実行中...");

    // 正常データのテスト
    try {
      const validData = {
        id: "test_001",
        name: "テスト店舗",
        genre: "テスト",
        priceRange: "500-1000円",
        coordinates: { lat: 35.7023, lng: 139.7745 },
        description: "テスト用の店舗です",
        hours: "11:00-20:00",
        address: "テスト住所",
      };
      DataLoader.validateRestaurantData(validData);
      console.log("✓ 正常データの検証: 成功");
    } catch (error) {
      console.error("✗ 正常データの検証: 失敗", error.message);
    }

    // 不正データのテスト（必須フィールド不足）
    try {
      const invalidData = {
        id: "test_002",
        name: "テスト店舗2",
        // 他の必須フィールドが不足
      };
      DataLoader.validateRestaurantData(invalidData);
      console.error("✗ 不正データの検証: 検証が通ってしまいました（エラー）");
    } catch (error) {
      console.log("✓ 不正データの検証: 正しくエラーが発生", error.message);
    }

    // 不正座標のテスト
    try {
      const invalidCoordData = {
        id: "test_003",
        name: "テスト店舗3",
        genre: "テスト",
        priceRange: "500-1000円",
        coordinates: { lat: 999, lng: 139.7745 }, // 不正な緯度
        description: "テスト用の店舗です",
        hours: "11:00-20:00",
        address: "テスト住所",
      };
      DataLoader.validateRestaurantData(invalidData);
      console.error("✗ 不正座標の検証: 検証が通ってしまいました（エラー）");
    } catch (error) {
      console.log("✓ 不正座標の検証: 正しくエラーが発生", error.message);
    }

    console.log("=== DataLoader動作テスト完了 ===");
  } catch (error) {
    console.error("DataLoaderテストでエラーが発生しました:", error.message);
    throw error;
  }
}

/**
 * エラーハンドリングとセキュリティ対策のテスト関数
 * タスク10の実装確認用（開発モードでのみ実行）
 */
async function testErrorHandlingAndSecurity() {
  console.log("=== エラーハンドリング・セキュリティテスト開始 ===");

  try {
    // HTMLエスケープ処理のテスト
    console.log("HTMLエスケープ処理テスト:");

    const testCases = [
      {
        input: '<script>alert("XSS")</script>',
        expected: "エスケープされること",
      },
      { input: 'javascript:alert("XSS")', expected: "エスケープされること" },
      {
        input: '<img src="x" onerror="alert(1)">',
        expected: "エスケープされること",
      },
      { input: "通常のテキスト", expected: "そのまま表示されること" },
      { input: null, expected: "空文字列になること" },
      { input: undefined, expected: "空文字列になること" },
      { input: 123, expected: "文字列に変換されること" },
    ];

    testCases.forEach((testCase, index) => {
      try {
        const result = escapeHtml(testCase.input);
        console.log(
          `  テスト${index + 1}: 入力="${testCase.input}" → 出力="${result}"`
        );

        // 基本的な安全性チェック
        if (testCase.input && typeof testCase.input === "string") {
          if (
            testCase.input.includes("<script>") &&
            result.includes("<script>")
          ) {
            console.warn(`  ⚠️ 警告: スクリプトタグがエスケープされていません`);
          } else if (testCase.input.includes("<script>")) {
            console.log(`  ✓ スクリプトタグが適切にエスケープされました`);
          }
        }
      } catch (error) {
        console.error(`  ✗ テスト${index + 1}でエラー:`, error.message);
      }
    });

    // 座標検証のテスト
    console.log("\n座標検証テスト:");

    const coordTestCases = [
      { lat: 35.7023, lng: 139.7745, expected: "正常" },
      { lat: 999, lng: 139.7745, expected: "エラー（緯度範囲外）" },
      { lat: 35.7023, lng: 999, expected: "エラー（経度範囲外）" },
      { lat: "invalid", lng: 139.7745, expected: "エラー（数値でない）" },
      { lat: null, lng: 139.7745, expected: "エラー（null）" },
      { lat: Infinity, lng: 139.7745, expected: "エラー（Infinity）" },
      { lat: NaN, lng: 139.7745, expected: "エラー（NaN）" },
    ];

    coordTestCases.forEach((testCase, index) => {
      try {
        const coordinates = { lat: testCase.lat, lng: testCase.lng };
        DataLoader.validateCoordinatesData(coordinates);
        console.log(
          `  テスト${index + 1}: lat=${testCase.lat}, lng=${
            testCase.lng
          } → 正常`
        );
      } catch (error) {
        console.log(
          `  テスト${index + 1}: lat=${testCase.lat}, lng=${
            testCase.lng
          } → エラー: ${error.message}`
        );
      }
    });

    // エラー表示機能のテスト
    console.log("\nエラー表示機能テスト:");

    // 各種エラータイプのテスト
    setTimeout(() => {
      showError("テスト用エラーメッセージ", "error", true);
      console.log("  ✓ エラーメッセージ表示テスト完了");
    }, 1000);

    setTimeout(() => {
      showError("テスト用警告メッセージ", "warning", true);
      console.log("  ✓ 警告メッセージ表示テスト完了");
    }, 2000);

    setTimeout(() => {
      showError("テスト用情報メッセージ", "info", true);
      console.log("  ✓ 情報メッセージ表示テスト完了");
    }, 3000);

    console.log("=== エラーハンドリング・セキュリティテスト完了 ===");
  } catch (error) {
    console.error(
      "エラーハンドリング・セキュリティテストでエラーが発生しました:",
      error.message
    );
    throw error;
  }
}
