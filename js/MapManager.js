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

      // Leaflet地図の初期化（タッチデバイス対応強化）
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
        // タッチデバイス対応の追加設定
        tap: true, // タップイベントを有効化
        tapTolerance: 15, // タップの許容範囲（ピクセル）
        bounceAtZoomLimits: false, // ズーム限界でのバウンス効果を無効化
        worldCopyJump: false, // 世界地図の境界ジャンプを無効化
        maxBoundsViscosity: 1.0, // 境界の粘性を設定
      });

      // タッチデバイス検出とモバイル最適化
      this.setupMobileOptimizations();

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

      // 初期化後に地図サイズを強制的に再計算（モバイル対応）
      setTimeout(() => {
        this.map.invalidateSize();
        console.log("地図サイズを再計算しました");
      }, 100);

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

      // アクセシビリティ属性を追加
      this.setupMarkerAccessibility(marker, restaurant);

      // マーカーを管理用Mapに保存
      this.markers.set(restaurant.id, marker);

      return marker;
    } catch (error) {
      console.error("マーカーの追加に失敗しました:", error);
      throw error;
    }
  }

  /**
   * マーカーのアクセシビリティを設定する
   * @param {Object} marker - Leafletマーカーオブジェクト
   * @param {Object} restaurant - レストランデータ
   */
  setupMarkerAccessibility(marker, restaurant) {
    try {
      // マーカーが地図に追加された後にDOM要素にアクセス
      marker.on("add", () => {
        const markerElement = marker.getElement();
        if (markerElement) {
          // キーボードフォーカス可能にする
          markerElement.setAttribute("tabindex", "0");

          // アクセシビリティ属性を設定
          markerElement.setAttribute("role", "button");
          markerElement.setAttribute(
            "aria-label",
            `${restaurant.name}の詳細を表示`
          );
          markerElement.setAttribute(
            "aria-describedby",
            `marker-${restaurant.id}-desc`
          );

          // 説明用の非表示要素を作成
          const description = document.createElement("div");
          description.id = `marker-${restaurant.id}-desc`;
          description.className = "sr-only";
          description.textContent = `${restaurant.genre}、${restaurant.priceRange}`;
          document.body.appendChild(description);
        }
      });
    } catch (error) {
      console.error("マーカーアクセシビリティの設定に失敗しました:", error);
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
   * 座標データを検証する（強化版）
   * @param {number} lat - 緯度
   * @param {number} lng - 経度
   * @throws {Error} 座標データが不正な場合
   */
  validateCoordinates(lat, lng) {
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

    // 精度の確認（極端に高精度な座標の警告）
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

    return { lat: numLat, lng: numLng };
  }

  /**
   * エラーメッセージを表示する（強化版）
   * @param {string} message - エラーメッセージ
   * @param {string} type - エラータイプ（'error', 'warning', 'info'）
   */
  showError(message, type = "error") {
    try {
      // HTMLエスケープを適用
      const safeMessage = escapeHtml(message);

      const errorElement = document.getElementById("error-message");
      const errorText = document.getElementById("error-text");

      if (errorElement && errorText) {
        errorElement.className = `error-message ${type}`;
        errorText.innerHTML = safeMessage;
        errorElement.style.display = "block";

        // アクセシビリティ対応
        errorElement.setAttribute("role", "alert");
        errorElement.setAttribute("aria-live", "assertive");

        console.error(`[MapManager ${type.toUpperCase()}] ${message}`);
      } else {
        // フォールバック: コンソールにエラーを出力
        console.error(`MapManagerエラー表示要素が見つかりません: ${message}`);
      }
    } catch (error) {
      console.error("MapManagerエラー表示処理でエラーが発生しました:", error);
      console.error("元のエラーメッセージ:", message);
    }
  }

  /**
   * モバイルデバイス向けの最適化を設定する
   */
  setupMobileOptimizations() {
    try {
      // タッチデバイスの検出
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      if (isTouchDevice) {
        // モバイルデバイス用の設定調整
        this.map.options.zoomSnap = 0.5; // ズームのスナップを細かく設定
        this.map.options.zoomDelta = 0.5; // ズームの変化量を調整

        // タッチイベントの最適化
        this.map.on("touchstart", this.handleTouchStart.bind(this));
        this.map.on("touchend", this.handleTouchEnd.bind(this));

        // 画面サイズに応じたズームコントロールの調整
        if (window.innerWidth <= 480) {
          // スマートフォン用のズームコントロール位置調整
          this.map.zoomControl.setPosition("bottomright");
        }

        // モバイルデバイスでの地図サイズ強制調整
        setTimeout(() => {
          this.map.invalidateSize();
          // 地図コンテナのサイズを強制的に再計算
          const mapContainer = document.getElementById(this.containerId);
          if (mapContainer) {
            mapContainer.style.width = "100%";
            mapContainer.style.height = "100%";
            this.map.invalidateSize();
          }
        }, 500);

        console.log("モバイルデバイス向け最適化が適用されました");
      }

      // 画面回転対応
      window.addEventListener("orientationchange", () => {
        setTimeout(() => {
          this.map.invalidateSize();
        }, 100);
      });

      // リサイズ対応
      window.addEventListener("resize", () => {
        setTimeout(() => {
          this.map.invalidateSize();
        }, 100);
      });
    } catch (error) {
      console.error("モバイル最適化の設定に失敗しました:", error);
    }
  }

  /**
   * タッチ開始イベントのハンドラー
   * @param {Event} e - タッチイベント
   */
  handleTouchStart(e) {
    try {
      // タッチ開始時の処理（必要に応じて拡張）
      this.touchStartTime = Date.now();
    } catch (error) {
      console.error("タッチ開始イベントの処理に失敗しました:", error);
    }
  }

  /**
   * タッチ終了イベントのハンドラー
   * @param {Event} e - タッチイベント
   */
  handleTouchEnd(e) {
    try {
      // タッチ終了時の処理
      const touchDuration = Date.now() - (this.touchStartTime || 0);

      // 短いタッチ（タップ）の場合の処理
      if (touchDuration < 200) {
        // タップ処理（必要に応じて拡張）
      }
    } catch (error) {
      console.error("タッチ終了イベントの処理に失敗しました:", error);
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
