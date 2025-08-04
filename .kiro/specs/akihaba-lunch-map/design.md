# 設計書

## 概要

秋葉原ランチマップは、Leaflet.js を使用した地図ベースの静的 Web アプリケーションです。JSON データを使用してランチスポット情報を管理し、レスポンシブデザインでモバイルデバイスにも対応します。

## アーキテクチャ

### システム構成図

```
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
│  JavaScript (script.js)                 │
│  ├─ 地図初期化                           │
│  ├─ データ読み込み                        │
│  ├─ マーカー生成・管理                     │
│  └─ イベントハンドリング                   │
├─────────────────────────────────────────┤
│  データ (data/restaurants.json)          │
│  └─ ランチスポット情報                     │
└─────────────────────────────────────────┘
```

### 技術スタック

- **地図ライブラリ**: Leaflet.js v1.9.4
- **地図タイル**: OpenStreetMap
- **フロントエンド**: HTML5 + CSS3 + Vanilla JavaScript
- **データ形式**: JSON
- **ホスティング**: 静的サイトホスティング（GitHub Pages、Netlify 等）

## コンポーネントとインターフェース

### 1. MapManager クラス

地図の初期化と管理を担当

```javascript
class MapManager {
    constructor(containerId, center, zoom)
    initializeMap()
    addMarker(restaurant)
    removeMarker(markerId)
    setView(lat, lng, zoom)
}
```

### 2. RestaurantManager クラス

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

### 3. InfoPanelManager クラス

情報パネルの表示管理を担当

```javascript
class InfoPanelManager {
    constructor(panelId)
    showRestaurantDetails(restaurant)
    showDefaultMessage()
    clearPanel()
}
```

### 4. DataLoader クラス

JSON データの読み込みを担当

```javascript
class DataLoader {
    static async loadRestaurants()
    static validateRestaurantData(data)
}
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

### restaurants.json 構造

```json
{
  "restaurants": [
    {
      "id": "akihabara_ramen_001",
      "name": "秋葉原ラーメン横丁",
      "genre": "ラーメン",
      "priceRange": "500-800円",
      "coordinates": {
        "lat": 35.7023,
        "lng": 139.7745
      },
      "description": "昔ながらの醤油ラーメンが自慢。チャーシューメンがおすすめ。",
      "hours": "11:00-22:00",
      "address": "東京都千代田区外神田1-1-1",
      "floor": "2F",
      "buildingName": "秋葉原グルメビル",
      "tags": ["ラーメン", "安い", "早い"]
    },
    {
      "id": "akihabara_curry_002",
      "name": "スパイスカレー専門店",
      "genre": "カレー",
      "priceRange": "800-1200円",
      "coordinates": {
        "lat": 35.7023,
        "lng": 139.7745
      },
      "description": "本格的なスパイスカレーが味わえる。チキンカレーが人気。",
      "hours": "11:30-21:00",
      "address": "東京都千代田区外神田1-1-1",
      "floor": "3F",
      "buildingName": "秋葉原グルメビル",
      "tags": ["カレー", "スパイス", "本格派"]
    }
  ]
}
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

- JSON ファイルが見つからない場合
- JSON の形式が不正な場合
- ネットワークエラーの場合

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
- 遅延読み込みの実装
- イベントリスナーの適切な管理

### 3. CSS 最適化

- 不要なスタイルの削除
- CSS 圧縮
- クリティカル CSS の分離

### 4. データ最適化

- JSON ファイルの圧縮
- 不要なデータフィールドの削除
- CDN 使用の検討

## デプロイメント戦略

### 1. GitHub Pages 直接ホスティング

- **ホスティング**: GitHub Pages（無料）
- **デプロイ方法**: リポジトリの main ブランチから直接配信
- **ビルドプロセス**: 不要（静的ファイルをそのまま配信）
- **CI/CD**: 不要（ファイル更新時に自動反映）

### 2. ファイル構成

```
/
├── index.html          # メインページ
├── styles.css          # スタイルシート
├── script.js           # JavaScript
├── data/
│   └── restaurants.json # レストランデータ
└── README.md           # プロジェクト説明
```

### 3. デプロイ手順

1. GitHub リポジトリにファイルをプッシュ
2. リポジトリ設定で GitHub Pages を有効化
3. main ブランチをソースに設定
4. 自動的にhttps://username.github.io/repository-name でアクセス可能

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
