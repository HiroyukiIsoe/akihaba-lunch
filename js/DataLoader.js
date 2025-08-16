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
    try {
      console.log("レストランデータの読み込みを開始します...");

      // data.jsから直接データを取得（CORSエラー回避）
      if (typeof RESTAURANT_DATA === "undefined") {
        throw new Error(
          "レストランデータが見つかりません。data.jsファイルが読み込まれているか確認してください。"
        );
      }

      const data = RESTAURANT_DATA;

      // データ構造の基本検証
      if (!data || typeof data !== "object") {
        throw new Error("データファイルの形式が不正です");
      }

      if (!Array.isArray(data.restaurants)) {
        throw new Error("レストランデータが配列形式ではありません");
      }

      // 各レストランデータの検証
      const validatedRestaurants = [];
      for (let i = 0; i < data.restaurants.length; i++) {
        try {
          const restaurant = this.validateRestaurantData(data.restaurants[i]);
          validatedRestaurants.push(restaurant);
        } catch (error) {
          console.warn(
            `レストランデータ[${i}]をスキップしました: ${error.message}`
          );
          // 個別のデータエラーは警告として扱い、処理を継続
        }
      }

      if (validatedRestaurants.length === 0) {
        throw new Error("有効なレストランデータが見つかりませんでした");
      }

      console.log(
        `${validatedRestaurants.length}件のレストランデータを読み込みました`
      );
      return validatedRestaurants;
    } catch (error) {
      // その他のエラーはそのまま再スロー
      throw error;
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
   * 座標データを検証する
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

    // 数値型の確認
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new Error("緯度・経度は数値である必要があります");
    }

    // 有効な範囲の確認
    if (lat < -90 || lat > 90) {
      throw new Error(`緯度が有効範囲外です: ${lat} (有効範囲: -90 ～ 90)`);
    }

    if (lng < -180 || lng > 180) {
      throw new Error(`経度が有効範囲外です: ${lng} (有効範囲: -180 ～ 180)`);
    }

    // NaN や Infinity の確認
    if (!isFinite(lat) || !isFinite(lng)) {
      throw new Error("緯度・経度に無効な数値が含まれています");
    }
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
