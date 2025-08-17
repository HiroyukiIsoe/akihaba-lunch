// 秋葉原ランチマップ - InfoPanelManagerクラス

/**
 * InfoPanelManager クラス - 情報パネルの表示管理を担当
 */
class InfoPanelManager {
  constructor(panelId) {
    this.panelId = panelId;
    this.panel = document.getElementById(panelId);
    this.previousMultipleRestaurants = null; // 前回表示した複数店舗データを保存

    if (!this.panel) {
      throw new Error(`情報パネル '${panelId}' が見つかりません`);
    }
  }

  /**
   * レストランの詳細情報を表示する（セキュリティ強化版）
   * @param {Object} restaurant - レストランデータ
   */
  showRestaurantDetails(restaurant) {
    try {
      // 入力データの検証
      if (!restaurant || typeof restaurant !== "object") {
        throw new Error("レストランデータが不正です");
      }

      // 必須フィールドの存在確認
      const requiredFields = [
        "id",
        "name",
        "genre",
        "priceRange",
        "hours",
        "address",
        "description",
      ];
      for (const field of requiredFields) {
        if (!restaurant[field]) {
          console.warn(`必須フィールド '${field}' が不足しています`);
        }
      }

      // 戻るボタンの表示判定
      const showBackButton =
        this.previousMultipleRestaurants &&
        this.previousMultipleRestaurants.length > 1;

      // セキュアなHTML生成
      const html = `
        <div class="restaurant-details" data-restaurant-id="${escapeAttribute(
          restaurant.id || ""
        )}">
          ${
            showBackButton
              ? `
          <div class="back-button-container">
            <button class="back-button" onclick="showMultipleRestaurantsFromHistory()" 
                    role="button" tabindex="0" 
                    onkeypress="if(event.key==='Enter'||event.key===' ') showMultipleRestaurantsFromHistory()"
                    aria-label="店舗一覧に戻る">
              ← 店舗一覧に戻る
            </button>
          </div>
          `
              : ""
          }
          <h2 class="restaurant-name">${escapeHtml(
            restaurant.name || "店名不明"
          )}</h2>
          <div class="restaurant-info">
            <div class="info-row">
              <span class="label">ジャンル:</span>
              <span class="value">${escapeHtml(
                restaurant.genre || "不明"
              )}</span>
            </div>
            <div class="info-row">
              <span class="label">価格帯:</span>
              <span class="value">${escapeHtml(
                restaurant.priceRange || "不明"
              )}</span>
            </div>
            <div class="info-row">
              <span class="label">営業時間:</span>
              <span class="value">${escapeHtml(
                restaurant.hours || "不明"
              )}</span>
            </div>
            <div class="info-row">
              <span class="label">住所:</span>
              <span class="value">${escapeHtml(
                restaurant.address || "不明"
              )}</span>
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
            <p>${escapeHtml(restaurant.description || "情報なし")}</p>
          </div>
          ${
            restaurant.tags &&
            Array.isArray(restaurant.tags) &&
            restaurant.tags.length > 0
              ? `
          <div class="restaurant-tags">
            <h3>タグ</h3>
            <div class="tags">
              ${restaurant.tags
                .filter((tag) => tag && typeof tag === "string") // 有効なタグのみフィルタ
                .map(
                  (tag) =>
                    `<span class="tag" data-tag="${escapeAttribute(
                      tag
                    )}">${escapeHtml(tag)}</span>`
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }
        </div>
      `;

      // DOMSanitizer的な追加チェック（基本的なXSS対策）
      if (this.containsUnsafeContent(html)) {
        throw new Error("不正なコンテンツが検出されました");
      }

      this.panel.innerHTML = html;

      // アクセシビリティ属性を設定
      this.panel.setAttribute("aria-live", "polite");
      this.panel.setAttribute("role", "region");
      this.panel.setAttribute(
        "aria-label",
        `${restaurant.name || "店舗"}の詳細情報`
      );
    } catch (error) {
      console.error("レストラン詳細の表示に失敗しました:", error);
      this.showErrorMessage(
        "店舗情報の表示に失敗しました。データに問題がある可能性があります。"
      );
    }
  }

  /**
   * 複数店舗の一覧を表示する（セキュリティ強化版）
   * @param {Array} restaurants - レストランデータの配列
   */
  showMultipleRestaurants(restaurants) {
    try {
      // 入力データの検証
      if (!Array.isArray(restaurants) || restaurants.length === 0) {
        throw new Error("レストランデータが不正です");
      }

      // 有効なレストランデータのみフィルタ
      const validRestaurants = restaurants.filter(
        (restaurant) =>
          restaurant &&
          typeof restaurant === "object" &&
          restaurant.id &&
          restaurant.name
      );

      if (validRestaurants.length === 0) {
        throw new Error("有効なレストランデータがありません");
      }

      // 複数店舗データを履歴として保存
      this.previousMultipleRestaurants = validRestaurants;

      const buildingName = validRestaurants[0].buildingName || "複数店舗";
      let html = `
        <div class="multiple-restaurants">
          <h2>${escapeHtml(buildingName)}</h2>
          <p class="building-info">${
            validRestaurants.length
          }店舗あります。店舗を選択してください。</p>
          <div class="restaurant-list">
      `;

      validRestaurants.forEach((restaurant, index) => {
        // 各レストランデータの安全性チェック
        const safeId = escapeAttribute(restaurant.id);
        const safeName = escapeHtml(restaurant.name || "店名不明");
        const safeGenre = escapeHtml(restaurant.genre || "不明");
        const safePrice = escapeHtml(restaurant.priceRange || "不明");
        const safeHours = escapeHtml(restaurant.hours || "不明");
        const safeFloor = restaurant.floor ? escapeHtml(restaurant.floor) : "";

        html += `
          <div class="restaurant-item" 
               onclick="showRestaurantDetails('${safeId}')" 
               role="button" 
               tabindex="0" 
               onkeypress="if(event.key==='Enter'||event.key===' ') showRestaurantDetails('${safeId}')" 
               aria-label="${safeName}の詳細を表示"
               data-restaurant-index="${index}">
            <h3 class="restaurant-name">
              ${safeName}
              ${safeFloor ? `<span class="floor">(${safeFloor})</span>` : ""}
            </h3>
            <div class="restaurant-summary">
              <span class="genre">${safeGenre}</span>
              <span class="price">${safePrice}</span>
            </div>
            <p class="restaurant-hours">${safeHours}</p>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;

      // 安全性チェック
      if (this.containsUnsafeContent(html)) {
        throw new Error("不正なコンテンツが検出されました");
      }

      this.panel.innerHTML = html;

      // アクセシビリティ属性を設定
      this.panel.setAttribute("aria-live", "polite");
      this.panel.setAttribute("role", "region");
      this.panel.setAttribute("aria-label", `${buildingName}の店舗一覧`);
    } catch (error) {
      console.error("複数店舗一覧の表示に失敗しました:", error);
      this.showErrorMessage(
        "店舗一覧の表示に失敗しました。データに問題がある可能性があります。"
      );
    }
  }

  /**
   * HTMLコンテンツの安全性をチェックする
   * @param {string} html - チェックするHTMLコンテンツ
   * @returns {boolean} 不正なコンテンツが含まれている場合はtrue
   */
  containsUnsafeContent(html) {
    try {
      // 危険なタグやスクリプトの検出
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^>]*>/gi,
        /<object\b[^>]*>/gi,
        /<embed\b[^>]*>/gi,
        /<form\b[^>]*>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /data:text\/html/gi,
      ];

      // 危険なイベントハンドラーの検出（安全なものは除外）
      const dangerousEventHandlers = [
        /on(?!click|keypress)\w+\s*=\s*["'][^"']*["']/gi, // onclick, keypress以外のイベントハンドラー
        /onclick\s*=\s*["'][^"']*(?:alert|eval|document\.write|window\.open)[^"']*["']/gi, // 危険な関数を含むonclick
        /onkeypress\s*=\s*["'][^"']*(?:alert|eval|document\.write|window\.open)[^"']*["']/gi, // 危険な関数を含むonkeypress
      ];

      // 基本的な危険パターンをチェック
      for (const pattern of dangerousPatterns) {
        if (pattern.test(html)) {
          console.warn("危険なパターンが検出されました:", pattern);
          return true;
        }
      }

      // 危険なイベントハンドラーをチェック
      for (const pattern of dangerousEventHandlers) {
        if (pattern.test(html)) {
          console.warn("危険なイベントハンドラーが検出されました:", pattern);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("安全性チェックでエラーが発生しました:", error);
      // エラーが発生した場合は安全側に倒して不正とみなす
      return true;
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
   * 履歴から複数店舗一覧を再表示する
   */
  showMultipleRestaurantsFromHistory() {
    try {
      if (
        this.previousMultipleRestaurants &&
        this.previousMultipleRestaurants.length > 0
      ) {
        this.showMultipleRestaurants(this.previousMultipleRestaurants);
      } else {
        this.showDefaultMessage();
      }
    } catch (error) {
      console.error("履歴からの複数店舗表示に失敗しました:", error);
      this.showErrorMessage("店舗一覧の表示に失敗しました");
    }
  }

  /**
   * パネル要素を取得する
   * @returns {HTMLElement} パネル要素
   */
  getPanel() {
    return this.panel;
  }
}
