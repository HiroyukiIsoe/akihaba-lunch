// 秋葉原ランチマップ - InfoPanelManagerクラス

/**
 * InfoPanelManager クラス - 情報パネルの表示管理を担当
 */
class InfoPanelManager {
  constructor(panelId) {
    this.panelId = panelId;
    this.panel = document.getElementById(panelId);

    if (!this.panel) {
      throw new Error(`情報パネル '${panelId}' が見つかりません`);
    }
  }

  /**
   * レストランの詳細情報を表示する
   * @param {Object} restaurant - レストランデータ
   */
  showRestaurantDetails(restaurant) {
    try {
      const html = `
        <div class="restaurant-details">
          <h2 class="restaurant-name">${escapeHtml(restaurant.name)}</h2>
          <div class="restaurant-info">
            <div class="info-row">
              <span class="label">ジャンル:</span>
              <span class="value">${escapeHtml(restaurant.genre)}</span>
            </div>
            <div class="info-row">
              <span class="label">価格帯:</span>
              <span class="value">${escapeHtml(restaurant.priceRange)}</span>
            </div>
            <div class="info-row">
              <span class="label">営業時間:</span>
              <span class="value">${escapeHtml(restaurant.hours)}</span>
            </div>
            <div class="info-row">
              <span class="label">住所:</span>
              <span class="value">${escapeHtml(restaurant.address)}</span>
            </div>
            ${
              restaurant.floor
                ? `
            <div class="info-row">
              <span class="label">フロア:</span>
              <span class="value">${escapeHtml(restaurant.floor)}</span>
            </div>
            `
                : ""
            }
            ${
              restaurant.buildingName
                ? `
            <div class="info-row">
              <span class="label">ビル名:</span>
              <span class="value">${escapeHtml(restaurant.buildingName)}</span>
            </div>
            `
                : ""
            }
          </div>
          <div class="restaurant-description">
            <h3>おすすめメニュー・店舗情報</h3>
            <p>${escapeHtml(restaurant.description)}</p>
          </div>
          ${
            restaurant.tags && restaurant.tags.length > 0
              ? `
          <div class="restaurant-tags">
            <h3>タグ</h3>
            <div class="tags">
              ${restaurant.tags
                .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
                .join("")}
            </div>
          </div>
          `
              : ""
          }
        </div>
      `;

      this.panel.innerHTML = html;
    } catch (error) {
      console.error("レストラン詳細の表示に失敗しました:", error);
      this.showErrorMessage("店舗情報の表示に失敗しました");
    }
  }

  /**
   * 複数店舗の一覧を表示する
   * @param {Array} restaurants - レストランデータの配列
   */
  showMultipleRestaurants(restaurants) {
    try {
      const buildingName = restaurants[0].buildingName || "複数店舗";
      let html = `
        <div class="multiple-restaurants">
          <h2>${escapeHtml(buildingName)}</h2>
          <p class="building-info">${
            restaurants.length
          }店舗あります。店舗を選択してください。</p>
          <div class="restaurant-list">
      `;

      restaurants.forEach((restaurant) => {
        html += `
          <div class="restaurant-item" onclick="showRestaurantDetails('${
            restaurant.id
          }')" role="button" tabindex="0" onkeypress="if(event.key==='Enter'||event.key===' ') showRestaurantDetails('${
          restaurant.id
        }')" aria-label="${escapeHtml(restaurant.name)}の詳細を表示">
            <h3 class="restaurant-name">
              ${escapeHtml(restaurant.name)}
              ${
                restaurant.floor
                  ? `<span class="floor">(${escapeHtml(
                      restaurant.floor
                    )})</span>`
                  : ""
              }
            </h3>
            <div class="restaurant-summary">
              <span class="genre">${escapeHtml(restaurant.genre)}</span>
              <span class="price">${escapeHtml(restaurant.priceRange)}</span>
            </div>
            <p class="restaurant-hours">${escapeHtml(restaurant.hours)}</p>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;

      this.panel.innerHTML = html;
    } catch (error) {
      console.error("複数店舗一覧の表示に失敗しました:", error);
      this.showErrorMessage("店舗一覧の表示に失敗しました");
    }
  }

  /**
   * デフォルトメッセージを表示する
   */
  showDefaultMessage() {
    const html = `
      <div class="default-message">
        <h2 class="info-title">店舗を選択してください</h2>
        <p class="info-description">
          地図上のマーカーをクリックすると、店舗の詳細情報が表示されます。
        </p>
        <div class="info-instructions">
          <ul>
            <li>🍜 マーカーをクリックして店舗詳細を表示</li>
            <li>🏢 数字付きマーカーは複数店舗があるビル</li>
            <li>📱 スマートフォンでもご利用いただけます</li>
          </ul>
        </div>
      </div>
    `;

    this.panel.innerHTML = html;
  }

  /**
   * エラーメッセージを表示する
   * @param {string} message - エラーメッセージ
   */
  showErrorMessage(message) {
    const html = `
      <div class="error-panel">
        <h2>エラー</h2>
        <p>${escapeHtml(message)}</p>
        <button onclick="location.reload()">ページを再読み込み</button>
      </div>
    `;

    this.panel.innerHTML = html;
  }

  /**
   * パネルをクリアする
   */
  clearPanel() {
    this.panel.innerHTML = "";
  }

  /**
   * パネル要素を取得する
   * @returns {HTMLElement} パネル要素
   */
  getPanel() {
    return this.panel;
  }
}
