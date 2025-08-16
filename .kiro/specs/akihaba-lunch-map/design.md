# 設計書

## 概要

秋葉原ランチマップは、Leaflet.js を使用した地図ベースの静的 Web アプリケーションです。JSON データを使用してランチスポット情報を管理し、レスポンシブデザインでモバイルデバイスにも対応します。

## アーキテクチャ

### システム構成図

```text
┌─────────────────────────────────────────┐
│              Frontend (静的)              │
├─────────────────────────────────────────┤
│  HTML (index.html)                      │
│  ├─ ヘッダー                             │
│  ├─ 地図コンテナ (#map)                   │
│  └─ 情報パネル (#info-panel)             │
├─────────────────────────────────────────┤
│  CSS (styles.css)                       │
│  ├─ レスポンシブレイアウト                  │
│  ├─ 地図スタイル                          │
│  └─ 情報パネルスタイル                     │
├─────────────────────────────────────────┤
│  JavaScript (モジュール分割)              │
│  ├─ js/MapManager.js                    │
│  ├─ js/RestaurantManager.js             │
│  ├─ js/InfoPanelManager.js              │
│  ├─ js/DataLoader.js                    │
│  ├─ js/utils.js                        │
│  └─ app.js (メインアプリケーション)        │
├─────────────────────────────────────────┤
│  データ (data.js)                       │
│  └─ ランチスポット情報（JavaScript変数）    │
└─────────────────────────────────────────┘
```

### 技術スタック

- **地図ライブラリ**: Leaflet.js v1.9.4
- **地図タイル**: OpenStreetMap
- **フロントエンド**: HTML5 + CSS3 + Vanilla JavaScript
- **データ形式**: JavaScript 変数（CORS エラー回避のため）
- **ホスティング**: 静的サイトホスティング（GitHub Pages、Netlify 等）

## JavaScript ファイル分割設計

### ファイル構成とモジュール化

静的サイト専用ポリシーに従い、ES6 モジュールを使用せずに、クラスごとにファイルを分割し、HTML で順次読み込みます。

```text
js/
├── config.js              # 設定・環境管理
├── MapManager.js          # 地図管理クラス
├── RestaurantManager.js   # レストラン管理クラス
├── InfoPanelManager.js    # 情報パネル管理クラス
├── DataLoader.js          # データ読み込みクラス
└── utils.js               # 共通ユーティリティ関数
app.js                     # メインアプリケーション
```

### HTML での読み込み順序

```html
<!-- データファイル -->
<script src="data.js"></script>

<!-- 設定・環境管理 -->
<script src="js/config.js"></script>

<!-- ユーティリティ -->
<script src="js/utils.js"></script>

<!-- クラスファイル（依存関係順） -->
<script src="js/DataLoader.js"></script>
<script src="js/MapManager.js"></script>
<script src="js/InfoPanelManager.js"></script>
<script src="js/RestaurantManager.js"></script>

<!-- メインアプリケーション -->
<script src="app.js"></script>
```

## 開発・本番環境の分離

### 環境判定とテスト機能の条件付き実行

静的サイト専用ポリシーに従い、ビルドプロセスを使わずに開発・本番環境を自動判定し、テスト機能を条件付きで実行します。

#### 環境判定ロジック

```javascript
function isDevelopmentMode() {
  // URLパラメータで開発モードを判定
  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get("debug");

  // localhost または file:// プロトコルの場合は開発モード
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  // ?debug=true パラメータがある場合は開発モード
  const isDebugMode = debugParam === "true";

  return isLocalhost || isDebugMode;
}
```

#### 環境別設定 (js/config.js)

```javascript
const APP_CONFIG = {
  // 開発モード設定
  development: {
    enableDebugLogs: true,
    enableTestFunctions: true,
    enablePerformanceMonitoring: true,
    showDetailedErrors: true,
  },

  // 本番モード設定
  production: {
    enableDebugLogs: false,
    enableTestFunctions: false,
    enablePerformanceMonitoring: false,
    showDetailedErrors: false,
  },
};
```

#### テスト機能の条件付き実行

```javascript
// 開発環境でのみテスト関数を実行
if (isDevelopmentMode()) {
  await testDataLoader();
}
```

#### 利点

- **パフォーマンス向上**: 本番環境では不要なテスト関数を実行しない
- **セキュリティ向上**: デバッグ情報の本番環境での非表示
- **開発効率**: 開発時のデバッグ機能を維持
- **静的サイト対応**: ビルドプロセス不要の自動環境判定
- **柔軟性**: URL パラメータによる手動デバッグモード切り替え

## コンポーネントとインターフェース

### 1. 設定管理 (js/config.js)

アプリケーション設定と環境管理を担当

```javascript
// 環境判定
function isDevelopmentMode()
function getCurrentConfig()

// デバッグ機能（開発モードのみ）
function debugLog(message, ...args)
function startPerformanceTimer(label)
function endPerformanceTimer(label)
```

### 2. MapManager クラス (js/MapManager.js)

地図の初期化と管理を担当

```javascript
class MapManager {
    constructor(containerId, center, zoom)
    initializeMap()
    addMarker(restaurant, options)
    removeMarker(markerId)
    setView(lat, lng, zoom)
    validateCoordinates(lat, lng)
    showError(message)
    getMap()
}
```

### 2. RestaurantManager クラス (js/RestaurantManager.js)

レストランデータの管理とマーカー操作を担当

```javascript
class RestaurantManager {
    constructor(mapManager, infoPanelManager)
    loadRestaurants()
    displayRestaurants()
    showRestaurantInfo(restaurant)
    filterRestaurants(criteria)
    groupRestaurantsByLocation() // 同じ座標の店舗をグループ化
    createClusterMarker(restaurants) // 複数店舗用のクラスターマーカー作成
    showMultipleRestaurants(restaurants) // 複数店舗の一覧表示
}
```

### 3. InfoPanelManager クラス (js/InfoPanelManager.js)

情報パネルの表示管理を担当

```javascript
class InfoPanelManager {
    constructor(panelId)
    showRestaurantDetails(restaurant)
    showDefaultMessage()
    clearPanel()
    showErrorMessage(message)
}
```

### 4. DataLoader クラス (js/DataLoader.js)

レストランデータの読み込みと検証を担当（CORS エラー回避のため直接 JavaScript 変数を使用）

```javascript
class DataLoader {
    static async loadRestaurants() // RESTAURANT_DATA変数から直接読み込み
    static validateRestaurantData(data) // データ検証
    static validateCoordinatesData(coordinates) // 座標データ検証
    static async checkDataFileExists() // データ利用可能性確認
}
```

### 5. ユーティリティ関数 (js/utils.js)

共通で使用される関数群

```javascript
// ローディング表示制御
function showLoading(show)

// エラーメッセージ表示
function showError(message)

// HTMLエスケープ
function escapeHtml(text)

// テスト関数（開発モードでのみ実行）
async function testDataLoader()
```

### 6. メインアプリケーション (app.js)

アプリケーションの初期化とグローバル変数管理

```javascript
// アプリケーション設定を取得
const AKIHABARA_CENTER = APP_CONFIG.map.center;
const DEFAULT_ZOOM = APP_CONFIG.map.defaultZoom;

// グローバル変数
let mapManager = null;
let restaurantManager = null;
let infoPanelManager = null;

// アプリケーション初期化
document.addEventListener("DOMContentLoaded", async function () {
  // 各マネージャーの初期化
  // 条件付きテスト実行
  if (isDevelopmentMode()) {
    await testDataLoader();
  }
  // イベントリスナーの設定
});

// デバッグ用関数（開発モードでのみ利用可能）
function getAppState()
```

## データモデル

### Restaurant データ構造

```json
{
  "id": "unique_id",
  "name": "店舗名",
  "genre": "料理ジャンル",
  "priceRange": "価格帯",
  "coordinates": {
    "lat": 35.7023,
    "lng": 139.7745
  },
  "description": "店舗説明・おすすめメニュー",
  "hours": "営業時間",
  "address": "住所",
  "floor": "3F", // 同じビル内の階数情報
  "buildingName": "秋葉原ビル", // ビル名（同じ座標の店舗をグループ化）
  "tags": ["タグ1", "タグ2"]
}
```

### data.js 構造（CORS エラー回避）

```javascript
const RESTAURANT_DATA = {
  restaurants: [
    {
      id: "akihabara_ramen_001",
      name: "秋葉原ラーメン横丁",
      genre: "ラーメン",
      priceRange: "500-800円",
      coordinates: {
        lat: 35.7023,
        lng: 139.7745,
      },
      description: "昔ながらの醤油ラーメンが自慢。チャーシューメンがおすすめ。",
      hours: "11:00-22:00",
      address: "東京都千代田区外神田1-1-1",
      floor: "2F",
      buildingName: "秋葉原グルメビル",
      tags: ["ラーメン", "安い", "早い"],
    },
    {
      id: "akihabara_curry_002",
      name: "スパイスカレー専門店",
      genre: "カレー",
      priceRange: "800-1200円",
      coordinates: {
        lat: 35.7023,
        lng: 139.7745,
      },
      description: "本格的なスパイスカレーが味わえる。チキンカレーが人気。",
      hours: "11:30-21:00",
      address: "東京都千代田区外神田1-1-1",
      floor: "3F",
      buildingName: "秋葉原グルメビル",
      tags: ["カレー", "スパイス", "本格派"],
    },
  ],
};
```

## 複数店舗対応の実装詳細

### 1. 座標グループ化ロジック

同じ座標（緯度経度）を持つ店舗を自動的にグループ化し、クラスターマーカーで表示

```javascript
function groupRestaurantsByLocation(restaurants) {
  const groups = new Map();

  restaurants.forEach((restaurant) => {
    const key = `${restaurant.coordinates.lat},${restaurant.coordinates.lng}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(restaurant);
  });

  return groups;
}
```

### 2. クラスターマーカー表示

複数店舗がある場合は数字付きマーカーを表示

```javascript
function createClusterMarker(restaurants, coordinates) {
  const count = restaurants.length;
  const marker = L.marker([coordinates.lat, coordinates.lng], {
    icon: L.divIcon({
      html: `<div class="cluster-marker">${count}</div>`,
      className: "custom-cluster-marker",
      iconSize: [30, 30],
    }),
  });

  marker.on("click", () => {
    showMultipleRestaurants(restaurants);
  });

  return marker;
}
```

### 3. 複数店舗一覧表示

同じ場所の複数店舗を一覧で表示

```javascript
function showMultipleRestaurants(restaurants) {
  const buildingName = restaurants[0].buildingName;
  let html = `<h3>${buildingName}</h3><div class="restaurant-list">`;

  restaurants.forEach((restaurant) => {
    html += `
            <div class="restaurant-item" onclick="showRestaurantDetails('${restaurant.id}')">
                <h4>${restaurant.name} (${restaurant.floor})</h4>
                <span class="genre">${restaurant.genre}</span>
                <span class="price">${restaurant.priceRange}</span>
            </div>
        `;
  });

  html += "</div>";
  document.getElementById("info-panel").innerHTML = html;
}
```

## エラーハンドリング

### 1. データ読み込みエラー

- data.js ファイルが読み込まれていない場合
- RESTAURANT_DATA 変数が未定義の場合
- データ構造が不正な場合

```javascript
try {
  const data = await DataLoader.loadRestaurants();
} catch (error) {
  console.error("データの読み込みに失敗しました:", error);
  InfoPanelManager.showErrorMessage("データを読み込めませんでした");
}
```

### 2. 地図初期化エラー

- Leaflet.js の読み込み失敗
- 地図コンテナが見つからない場合

```javascript
if (!document.getElementById("map")) {
  throw new Error("地図コンテナが見つかりません");
}
```

### 3. 座標データエラー

- 不正な緯度経度データの処理
- 範囲外の座標値の処理

```javascript
function validateCoordinates(lat, lng) {
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("不正な座標データです");
  }
}
```

## セキュリティ考慮事項

### 1. XSS 対策

- ユーザー入力データのサニタイズ
- innerHTML 使用時のエスケープ処理

```javascript
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
```

### 2. データ検証

- JSON データの構造検証
- 必須フィールドの存在確認
- データ型の検証

### 3. HTTPS 通信

- 本番環境での HTTPS 必須
- 外部リソース（地図タイル）の HTTPS 使用

## パフォーマンス最適化

### 1. 画像最適化

- マーカーアイコンの軽量化
- WebP 形式の使用検討

### 2. JavaScript 最適化

- 必要最小限のライブラリ使用
- クラスごとのファイル分割によるメンテナンス性向上
- 適切な読み込み順序による依存関係管理
- イベントリスナーの適切な管理

### 3. CSS 最適化

- 不要なスタイルの削除
- CSS 圧縮
- クリティカル CSS の分離

### 4. データ最適化

- JavaScript ファイル（data.js）の圧縮
- 不要なデータフィールドの削除
- CDN 使用の検討
- データ構造の最適化（CORS エラー回避を維持）

## デプロイメント戦略

### 1. GitHub Pages 直接ホスティング

- **ホスティング**: GitHub Pages（無料）
- **デプロイ方法**: リポジトリの main ブランチから直接配信
- **ビルドプロセス**: 不要（静的ファイルをそのまま配信）
- **CI/CD**: 不要（ファイル更新時に自動反映）

### 2. ファイル構成

```text
/
├── index.html              # メインページ
├── styles.css              # スタイルシート
├── app.js                  # メインアプリケーション
├── data.js                 # レストランデータ（JavaScript変数）
├── js/                     # JavaScriptモジュール
│   ├── config.js           # 設定・環境管理
│   ├── MapManager.js       # 地図管理クラス
│   ├── RestaurantManager.js # レストラン管理クラス
│   ├── InfoPanelManager.js # 情報パネル管理クラス
│   ├── DataLoader.js       # データ読み込みクラス
│   └── utils.js            # 共通ユーティリティ
├── data/
│   └── restaurants.json    # 元のJSONデータ（参考用）
└── README.md               # プロジェクト説明
```

### 3. デプロイ手順

1. GitHub リポジトリにファイルをプッシュ
2. リポジトリ設定で GitHub Pages を有効化
3. main ブランチをソースに設定
4. 自動的に `https://username.github.io/repository-name` でアクセス可能

### 4. CORS エラー対策

- **問題**: `file://`プロトコルでの JSON ファイル読み込み時の CORS エラー
- **解決策**: JSON データを JavaScript 変数として定義（data.js）
- **利点**: ローカル環境でも本番環境でも同様に動作
- **実装**: HTML で data.js を先に読み込み、各クラスファイルから参照

### 5. JavaScript ファイル分割の利点

- **保守性向上**: クラスごとの責任分離により、コードの理解と修正が容易
- **再利用性**: 各クラスが独立しており、他のプロジェクトでも再利用可能
- **テスト容易性**: 個別のクラスファイルごとにテストが可能
- **開発効率**: 複数人での並行開発が可能
- **デバッグ効率**: 問題の特定と修正が迅速
- **静的サイト対応**: ES6 モジュールを使わず、従来の script タグで読み込み

### 6. 環境分離の利点

- **パフォーマンス最適化**: 本番環境では不要な機能を自動的に無効化
- **セキュリティ向上**: デバッグ情報やテスト機能の本番環境での非表示
- **開発体験向上**: 開発時のデバッグ機能とパフォーマンス監視を維持
- **運用効率**: ビルドプロセス不要の自動環境判定
- **柔軟性**: URL パラメータによる手動デバッグモード切り替え
- **静的サイト対応**: サーバーサイド処理不要の環境判定

## 拡張性の考慮

### 1. 機能拡張

- フィルタリング機能の追加
- お気に入り機能
- レビュー・評価機能
- 検索機能

### 2. データ拡張

- 写真データの追加
- 営業状況の動的更新
- メニュー詳細情報

### 3. 技術的拡張

- PWA 対応
- オフライン機能
- プッシュ通知
