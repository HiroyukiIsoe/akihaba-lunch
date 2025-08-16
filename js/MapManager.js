// 秋葉原ランチマップ - MapManagerクラス

/**
 * MapManager クラス - 地図の初期化と管理を担当
 */
class MapManager {
  constructor(containerId, center, zoom) {
    this.containerId = containerId;
    this.center = center;
    this.zoom = zoom;
    this.map = null;
    this.markers = new Map(); // マーカー管理用
  }

  /**
   * 地図を初期化する
   * 要件1.1, 1.2, 1.3に対応
   */
  initializeMap() {
    try {
      // 地図コンテナの存在確認
      const mapContainer = document.getElementById(this.containerId);
      if (!mapContainer) {
        throw new Error(`地図コンテナ '${this.containerId}' が見つかりません`);
      }

      // Leaflet地図の初期化
      this.map = L.map(this.containerId, {
        center: [this.center.lat, this.center.lng],
        zoom: this.zoom,
        zoomControl: true, // ズームコントロールを有効化
        scrollWheelZoom: true, // マウスホイールズームを有効化
        doubleClickZoom: true, // ダブルクリックズームを有効化
        dragging: true, // ドラッグ（パン）操作を有効化
        touchZoom: true, // タッチズームを有効化（モバイル対応）
        boxZoom: true, // ボックスズームを有効化
        keyboard: true, // キーボード操作を有効化
      });

      // OpenStreetMapタイルレイヤーを追加
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 10, // 秋葉原エリア周辺に制限
      }).addTo(this.map);

      // 地図初期化完了ログ
      console.log(
        `地図が初期化されました - 中心: [${this.center.lat}, ${this.center.lng}], ズーム: ${this.zoom}`
      );

      return this.map;
    } catch (error) {
      console.error("地図の初期化に失敗しました:", error);
      this.showError(
        "地図の初期化に失敗しました。ページを再読み込みしてください。"
      );
      throw error;
    }
  }

  /**
   * マーカーを地図に追加する
   * @param {Object} restaurant - レストランデータ
   * @param {Object} options - マーカーオプション
   * @returns {Object} 作成されたマーカー
   */
  addMarker(restaurant, options = {}) {
    try {
      if (!this.map) {
        throw new Error("地図が初期化されていません");
      }

      // 座標の検証
      this.validateCoordinates(
        restaurant.coordinates.lat,
        restaurant.coordinates.lng
      );

      // マーカーを作成
      const marker = L.marker(
        [restaurant.coordinates.lat, restaurant.coordinates.lng],
        options
      );

      // マーカーを地図に追加
      marker.addTo(this.map);

      // マーカーを管理用Mapに保存
      this.markers.set(restaurant.id, marker);

      return marker;
    } catch (error) {
      console.error("マーカーの追加に失敗しました:", error);
      throw error;
    }
  }

  /**
   * マーカーを地図から削除する
   * @param {string} markerId - マーカーID
   */
  removeMarker(markerId) {
    try {
      const marker = this.markers.get(markerId);
      if (marker) {
        this.map.removeLayer(marker);
        this.markers.delete(markerId);
      }
    } catch (error) {
      console.error("マーカーの削除に失敗しました:", error);
    }
  }

  /**
   * 地図の表示位置を設定する
   * @param {number} lat - 緯度
   * @param {number} lng - 経度
   * @param {number} zoom - ズームレベル
   */
  setView(lat, lng, zoom) {
    try {
      if (!this.map) {
        throw new Error("地図が初期化されていません");
      }

      this.validateCoordinates(lat, lng);
      this.map.setView([lat, lng], zoom);
    } catch (error) {
      console.error("地図の表示位置設定に失敗しました:", error);
      throw error;
    }
  }

  /**
   * 座標データを検証する
   * @param {number} lat - 緯度
   * @param {number} lng - 経度
   */
  validateCoordinates(lat, lng) {
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new Error("座標は数値である必要があります");
    }
    if (lat < -90 || lat > 90) {
      throw new Error(`不正な緯度です: ${lat}`);
    }
    if (lng < -180 || lng > 180) {
      throw new Error(`不正な経度です: ${lng}`);
    }
  }

  /**
   * エラーメッセージを表示する
   * @param {string} message - エラーメッセージ
   */
  showError(message) {
    const errorElement = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");

    if (errorElement && errorText) {
      errorText.textContent = message;
      errorElement.style.display = "block";
    }
  }

  /**
   * 地図インスタンスを取得する
   * @returns {Object} Leaflet地図インスタンス
   */
  getMap() {
    return this.map;
  }
}
