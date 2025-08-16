// 秋葉原ランチマップ - RestaurantManagerクラス

/**
 * RestaurantManager クラス - レストランデータの管理とマーカー操作を担当
 */
class RestaurantManager {
  constructor(mapManager, infoPanelManager) {
    this.mapManager = mapManager;
    this.infoPanelManager = infoPanelManager;
    this.restaurants = [];
    this.restaurantGroups = new Map(); // 座標でグループ化されたレストラン
  }

  /**
   * レストランデータを読み込む
   * @returns {Promise<Array>} 読み込まれたレストランデータ
   */
  async loadRestaurants() {
    try {
      this.restaurants = await DataLoader.loadRestaurants();
      return this.restaurants;
    } catch (error) {
      console.error("レストランデータの読み込みに失敗しました:", error);
      throw error;
    }
  }

  /**
   * レストランを地図上に表示する
   */
  displayRestaurants() {
    try {
      // 座標でグループ化
      this.groupRestaurantsByLocation();

      // グループごとにマーカーを作成
      this.restaurantGroups.forEach((restaurants, locationKey) => {
        if (restaurants.length === 1) {
          // 単一店舗の場合
          this.createSingleRestaurantMarker(restaurants[0]);
        } else {
          // 複数店舗の場合
          this.createClusterMarker(restaurants, locationKey);
        }
      });

      console.log(
        `${this.restaurants.length}件のレストランを地図に表示しました`
      );
    } catch (error) {
      console.error("レストラン表示に失敗しました:", error);
      throw error;
    }
  }

  /**
   * 座標でレストランをグループ化する
   */
  groupRestaurantsByLocation() {
    this.restaurantGroups.clear();

    this.restaurants.forEach((restaurant) => {
      const key = `${restaurant.coordinates.lat},${restaurant.coordinates.lng}`;
      if (!this.restaurantGroups.has(key)) {
        this.restaurantGroups.set(key, []);
      }
      this.restaurantGroups.get(key).push(restaurant);
    });
  }

  /**
   * 単一店舗用のマーカーを作成する
   * @param {Object} restaurant - レストランデータ
   */
  createSingleRestaurantMarker(restaurant) {
    try {
      const marker = this.mapManager.addMarker(restaurant);

      // ポップアップを設定
      const popupContent = `
        <div class="marker-popup">
          <h3>${escapeHtml(restaurant.name)}</h3>
          <p><strong>${escapeHtml(restaurant.genre)}</strong></p>
          <p>${escapeHtml(restaurant.priceRange)}</p>
        </div>
      `;
      marker.bindPopup(popupContent);

      // クリックイベントを設定
      marker.on("click", () => {
        this.showRestaurantInfo(restaurant);
      });
    } catch (error) {
      console.error(
        `単一店舗マーカーの作成に失敗しました (${restaurant.name}):`,
        error
      );
    }
  }

  /**
   * 複数店舗用のクラスターマーカーを作成する
   * @param {Array} restaurants - レストランデータの配列
   * @param {string} locationKey - 座標キー
   */
  createClusterMarker(restaurants, locationKey) {
    try {
      const coordinates = restaurants[0].coordinates;
      const count = restaurants.length;

      // クラスターマーカーのアイコンを作成
      const clusterIcon = L.divIcon({
        html: `<div class="cluster-marker">${count}</div>`,
        className: "custom-cluster-marker",
        iconSize: [35, 35],
        iconAnchor: [17, 17],
      });

      // マーカーを作成
      const marker = L.marker([coordinates.lat, coordinates.lng], {
        icon: clusterIcon,
      });

      // 地図に追加
      marker.addTo(this.mapManager.getMap());

      // ポップアップを設定
      const buildingName = restaurants[0].buildingName || "複数店舗";
      const popupContent = `
        <div class="cluster-popup">
          <h3>${escapeHtml(buildingName)}</h3>
          <p>${count}店舗あります</p>
          <small>クリックして詳細を表示</small>
        </div>
      `;
      marker.bindPopup(popupContent);

      // クリックイベントを設定
      marker.on("click", () => {
        this.showMultipleRestaurants(restaurants);
      });

      // マーカーを管理用Mapに保存（最初のレストランのIDで管理）
      this.mapManager.markers.set(`cluster_${locationKey}`, marker);
    } catch (error) {
      console.error("クラスターマーカーの作成に失敗しました:", error);
    }
  }

  /**
   * レストラン情報を表示する
   * @param {Object} restaurant - レストランデータ
   */
  showRestaurantInfo(restaurant) {
    try {
      this.infoPanelManager.showRestaurantDetails(restaurant);
    } catch (error) {
      console.error("レストラン情報の表示に失敗しました:", error);
      this.infoPanelManager.showErrorMessage("店舗情報の表示に失敗しました");
    }
  }

  /**
   * 複数店舗の一覧を表示する
   * @param {Array} restaurants - レストランデータの配列
   */
  showMultipleRestaurants(restaurants) {
    try {
      this.infoPanelManager.showMultipleRestaurants(restaurants);
    } catch (error) {
      console.error("複数店舗一覧の表示に失敗しました:", error);
      this.infoPanelManager.showErrorMessage("店舗一覧の表示に失敗しました");
    }
  }

  /**
   * レストランをフィルタリングする
   * @param {Object} criteria - フィルタリング条件
   * @returns {Array} フィルタリングされたレストランデータ
   */
  filterRestaurants(criteria) {
    try {
      let filtered = [...this.restaurants];

      // ジャンルでフィルタリング
      if (criteria.genre) {
        filtered = filtered.filter((restaurant) =>
          restaurant.genre.toLowerCase().includes(criteria.genre.toLowerCase())
        );
      }

      // 価格帯でフィルタリング
      if (criteria.priceRange) {
        filtered = filtered.filter((restaurant) =>
          restaurant.priceRange.includes(criteria.priceRange)
        );
      }

      // タグでフィルタリング
      if (criteria.tag) {
        filtered = filtered.filter(
          (restaurant) =>
            restaurant.tags &&
            restaurant.tags.some((tag) =>
              tag.toLowerCase().includes(criteria.tag.toLowerCase())
            )
        );
      }

      return filtered;
    } catch (error) {
      console.error("レストランのフィルタリングに失敗しました:", error);
      return this.restaurants;
    }
  }

  /**
   * IDでレストランを検索する
   * @param {string} id - レストランID
   * @returns {Object|null} レストランデータまたはnull
   */
  findRestaurantById(id) {
    return this.restaurants.find((restaurant) => restaurant.id === id) || null;
  }

  /**
   * 読み込まれたレストランデータを取得する
   * @returns {Array} レストランデータの配列
   */
  getRestaurants() {
    return this.restaurants;
  }

  /**
   * レストラングループを取得する
   * @returns {Map} レストラングループのMap
   */
  getRestaurantGroups() {
    return this.restaurantGroups;
  }
}
