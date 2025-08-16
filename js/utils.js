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
 * エラーメッセージの表示
 * @param {string} message - エラーメッセージ
 */
function showError(message) {
  const errorElement = document.getElementById("error-message");
  const errorText = document.getElementById("error-text");

  if (errorElement && errorText) {
    errorText.textContent = message;
    errorElement.style.display = "block";
  }
}

/**
 * HTMLエスケープ処理
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * DataLoaderクラスの動作テスト関数
 * タスク5の実装確認用（開発モードでのみ実行）
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
      DataLoader.validateRestaurantData(invalidCoordData);
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
