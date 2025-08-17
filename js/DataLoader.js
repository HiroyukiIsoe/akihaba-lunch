// 秋葉原ランチマップ - DataLoaderクラス

/**
 * DataLoader クラス - レストランデータの読み込みと検証を担当
 * 要件4.1, 4.2に対応
 */
class DataLoader {
  /**
   * レストランデータを読み込む（CORSエラー回避のため直接データを使用）
   * @returns {Promise<Array>} レストランデータの配列
   * @throws {Error} データ読み込みまたは検証に失敗した場合
   */
  static async loadRestaurants() {
    const startTime = performance.now();

    try {
      console.log("レストランデータの読み込みを開始します...");

      // data.jsから直接データを取得（CORSエラー回避）
      if (typeof RESTAURANT_DATA === "undefined") {
        const errorMsg =
          "レストランデータが見つかりません。data.jsファイルが読み込まれているか確認してください。";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      const data = RESTAURANT_DATA;

      // データ構造の基本検証
      if (!data || typeof data !== "object") {
        const errorMsg =
          "データファイルの形式が不正です（オブジェクトではありません）";
        console.error(errorMsg, typeof data);
        throw new Error(errorMsg);
      }

      if (!Array.isArray(data.restaurants)) {
        const errorMsg = "レストランデータが配列形式ではありません";
        console.error(errorMsg, typeof data.restaurants);
        throw new Error(errorMsg);
      }

      if (data.restaurants.length === 0) {
        const errorMsg = "レストランデータが空です";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // 各レストランデータの検証
      const validatedRestaurants = [];
      const errors = [];
      const warnings = [];

      for (let i = 0; i < data.restaurants.length; i++) {
        try {
          const restaurant = this.validateRestaurantData(data.restaurants[i]);
          validatedRestaurants.push(restaurant);
        } catch (error) {
          const errorInfo = {
            index: i,
            id: data.restaurants[i]?.id || "unknown",
            error: error.message,
          };

          // 重要なエラー（必須フィールド不足など）
          if (
            error.message.includes("必須フィールド") ||
            error.message.includes("座標データ") ||
            error.message.includes("緯度・経度")
          ) {
            errors.push(errorInfo);
            console.error(
              `レストランデータ[${i}]で重要なエラー:`,
              error.message
            );
          } else {
            // 軽微なエラー（フォーマット不正など）
            warnings.push(errorInfo);
            console.warn(`レストランデータ[${i}]で警告:`, error.message);
          }
        }
      }

      // エラー統計の表示
      if (errors.length > 0) {
        console.error(
          `${errors.length}件のデータでエラーが発生しました:`,
          errors
        );
      }

      if (warnings.length > 0) {
        console.warn(
          `${warnings.length}件のデータで警告が発生しました:`,
          warnings
        );
      }

      // 有効なデータが存在しない場合はエラー
      if (validatedRestaurants.length === 0) {
        const errorMsg = `有効なレストランデータが見つかりませんでした。${data.restaurants.length}件中0件が有効でした。`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // 座標の重複チェック
      const duplicateCheck =
        this.validateCoordinatesDuplication(validatedRestaurants);
      if (duplicateCheck.duplicateGroups > 0) {
        console.info(
          `${duplicateCheck.duplicateGroups}組の座標重複が検出されました（複数店舗対応）`
        );
      }

      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);

      console.log(
        `${validatedRestaurants.length}件のレストランデータを読み込みました ` +
          `(処理時間: ${loadTime}ms, エラー: ${errors.length}件, 警告: ${warnings.length}件)`
      );

      return validatedRestaurants;
    } catch (error) {
      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);

      console.error(
        `データ読み込みに失敗しました (処理時間: ${loadTime}ms):`,
        error.message
      );

      // ユーザーフレンドリーなエラーメッセージを生成
      let userMessage = "レストランデータの読み込みに失敗しました。";

      if (error.message.includes("data.js")) {
        userMessage +=
          " データファイルが見つからないか、正しく読み込まれていません。";
      } else if (error.message.includes("配列形式")) {
        userMessage += " データファイルの形式に問題があります。";
      } else if (
        error.message.includes("有効なレストランデータが見つかりません")
      ) {
        userMessage +=
          " すべてのデータに問題があり、表示できる店舗がありません。";
      } else {
        userMessage += " 詳細はコンソールを確認してください。";
      }

      // エラーオブジェクトにユーザーメッセージを追加
      const enhancedError = new Error(userMessage);
      enhancedError.originalError = error;
      enhancedError.technicalMessage = error.message;

      throw enhancedError;
    }
  }

  /**
   * 個別のレストランデータを検証する
   * @param {Object} restaurant - 検証するレストランデータ
   * @returns {Object} 検証済みのレストランデータ
   * @throws {Error} データが不正な場合
   */
  static validateRestaurantData(restaurant) {
    // 必須フィールドの定義
    const requiredFields = [
      "id",
      "name",
      "genre",
      "priceRange",
      "coordinates",
      "description",
      "hours",
      "address",
    ];

    // データがオブジェクトかどうか確認
    if (!restaurant || typeof restaurant !== "object") {
      throw new Error("レストランデータがオブジェクト形式ではありません");
    }

    // 必須フィールドの存在確認
    for (const field of requiredFields) {
      if (!(field in restaurant)) {
        throw new Error(`必須フィールド '${field}' が見つかりません`);
      }

      // 空文字列や null の確認（coordinates以外）
      if (
        field !== "coordinates" &&
        (!restaurant[field] || restaurant[field].toString().trim() === "")
      ) {
        throw new Error(`必須フィールド '${field}' が空です`);
      }
    }

    // ID の重複チェック用（文字列かつ空でない）
    if (typeof restaurant.id !== "string" || restaurant.id.trim() === "") {
      throw new Error("IDは空でない文字列である必要があります");
    }

    // 座標データの詳細検証
    this.validateCoordinatesData(restaurant.coordinates);

    // オプションフィールドの検証
    if (restaurant.floor && typeof restaurant.floor !== "string") {
      throw new Error("floorフィールドは文字列である必要があります");
    }

    if (
      restaurant.buildingName &&
      typeof restaurant.buildingName !== "string"
    ) {
      throw new Error("buildingNameフィールドは文字列である必要があります");
    }

    if (restaurant.tags && !Array.isArray(restaurant.tags)) {
      throw new Error("tagsフィールドは配列である必要があります");
    }

    // 検証済みデータを返す（必要に応じて正規化）
    return {
      ...restaurant,
      id: restaurant.id.trim(),
      name: restaurant.name.trim(),
      genre: restaurant.genre.trim(),
      priceRange: restaurant.priceRange.trim(),
      description: restaurant.description.trim(),
      hours: restaurant.hours.trim(),
      address: restaurant.address.trim(),
      floor: restaurant.floor ? restaurant.floor.trim() : null,
      buildingName: restaurant.buildingName
        ? restaurant.buildingName.trim()
        : null,
      tags: restaurant.tags || [],
    };
  }

  /**
   * 座標データを検証する（強化版）
   * @param {Object} coordinates - 座標データ
   * @throws {Error} 座標データが不正な場合
   */
  static validateCoordinatesData(coordinates) {
    if (!coordinates || typeof coordinates !== "object") {
      throw new Error("座標データがオブジェクト形式ではありません");
    }

    if (!("lat" in coordinates) || !("lng" in coordinates)) {
      throw new Error("座標データにlatまたはlngフィールドがありません");
    }

    const lat = coordinates.lat;
    const lng = coordinates.lng;

    // null、undefined、空文字列の確認
    if (lat == null || lng == null) {
      throw new Error("緯度・経度にnullまたはundefinedが含まれています");
    }

    // 数値型の確認（文字列数値も考慮）
    const numLat = Number(lat);
    const numLng = Number(lng);

    if (isNaN(numLat) || isNaN(numLng)) {
      throw new Error(
        `緯度・経度が数値に変換できません: lat=${lat}, lng=${lng}`
      );
    }

    // 有効な範囲の確認
    if (numLat < -90 || numLat > 90) {
      throw new Error(`緯度が有効範囲外です: ${numLat} (有効範囲: -90 ～ 90)`);
    }

    if (numLng < -180 || numLng > 180) {
      throw new Error(
        `経度が有効範囲外です: ${numLng} (有効範囲: -180 ～ 180)`
      );
    }

    // NaN や Infinity の確認
    if (!isFinite(numLat) || !isFinite(numLng)) {
      throw new Error(
        "緯度・経度に無効な数値が含まれています（Infinity、-Infinity、NaN）"
      );
    }

    // 秋葉原エリア周辺の妥当性チェック（警告レベル）
    const akihabaraLat = 35.7023;
    const akihabaraLng = 139.7745;
    const maxDistance = 0.05; // 約5km圏内

    const latDiff = Math.abs(numLat - akihabaraLat);
    const lngDiff = Math.abs(numLng - akihabaraLng);

    if (latDiff > maxDistance || lngDiff > maxDistance) {
      console.warn(
        `座標が秋葉原エリアから離れています: lat=${numLat}, lng=${numLng} ` +
          `(秋葉原中心: lat=${akihabaraLat}, lng=${akihabaraLng})`
      );
    }

    // 精度チェック（小数点以下の桁数）
    const latStr = String(lat);
    const lngStr = String(lng);
    const latDecimals = latStr.includes(".") ? latStr.split(".")[1].length : 0;
    const lngDecimals = lngStr.includes(".") ? lngStr.split(".")[1].length : 0;

    if (latDecimals > 10 || lngDecimals > 10) {
      console.warn(
        `座標の精度が高すぎます（小数点以下${Math.max(
          latDecimals,
          lngDecimals
        )}桁）: ` + `lat=${lat}, lng=${lng}`
      );
    }

    // 座標の重複チェック用のハッシュ値を生成
    const coordHash = `${numLat.toFixed(6)},${numLng.toFixed(6)}`;

    return {
      lat: numLat,
      lng: numLng,
      hash: coordHash,
      isValid: true,
    };
  }

  /**
   * 座標データの配列を検証し、重複をチェックする
   * @param {Array} restaurants - レストランデータの配列
   * @returns {Object} 検証結果
   */
  static validateCoordinatesDuplication(restaurants) {
    const coordMap = new Map();
    const duplicates = [];

    restaurants.forEach((restaurant, index) => {
      try {
        const validatedCoords = this.validateCoordinatesData(
          restaurant.coordinates
        );
        const hash = validatedCoords.hash;

        if (coordMap.has(hash)) {
          const existing = coordMap.get(hash);
          duplicates.push({
            hash,
            restaurants: [existing, { ...restaurant, index }],
          });
        } else {
          coordMap.set(hash, { ...restaurant, index });
        }
      } catch (error) {
        console.error(`レストラン[${index}]の座標検証エラー:`, error.message);
      }
    });

    return {
      totalCoordinates: coordMap.size,
      duplicateGroups: duplicates.length,
      duplicates,
    };
  }

  /**
   * データファイルの存在確認（data.jsの読み込み確認）
   * @returns {Promise<boolean>} データが利用可能かどうか
   */
  static async checkDataFileExists() {
    try {
      return (
        typeof RESTAURANT_DATA !== "undefined" &&
        RESTAURANT_DATA &&
        Array.isArray(RESTAURANT_DATA.restaurants)
      );
    } catch (error) {
      return false;
    }
  }
}
