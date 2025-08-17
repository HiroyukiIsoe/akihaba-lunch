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
