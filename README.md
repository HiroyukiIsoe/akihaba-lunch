# 秋葉原ランチマップ

秋葉原エリアで働く人々が効率的におすすめのランチスポットを見つけられる Web アプリケーションです。

## 概要

このアプリケーションは、Leaflet.js を使用した地図ベースの静的 Web サイトとして構築されており、秋葉原エリアのランチスポット情報を視覚的に表示します。モジュール化された JavaScript アーキテクチャにより、保守性と拡張性を重視した設計となっています。

## 機能

- 📍 秋葉原エリアの地図表示（Leaflet.js + OpenStreetMap）
- 🏪 ランチスポットのマーカー表示（単一店舗・複数店舗対応）
- 📋 店舗詳細情報の表示（ジャンル、価格帯、営業時間、住所等）
- 🏢 同じビル内の複数店舗対応（クラスターマーカー）
- 📱 レスポンシブデザイン（スマートフォン・タブレット対応）
- 🔒 セキュリティ対策（XSS 対策、データ検証）
- ♿ アクセシビリティ対応（キーボードナビゲーション、スクリーンリーダー対応）

## 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **地図ライブラリ**: Leaflet.js v1.9.4
- **地図タイル**: OpenStreetMap
- **データ形式**: JavaScript 変数（CORS 回避）
- **アーキテクチャ**: モジュール化クラス設計
- **ホスティング**: 静的サイトホスティング対応（GitHub Pages 推奨）

## ファイル構成

```
/
├── index.html              # メインページ

├── styles.css             # レスポンシブCSS
├── app.js                 # メインアプリケーション
├── data.js                # レストランデータ（JavaScript変数）
├── js/                    # JavaScriptモジュール
│   ├── config.js          # 設定・環境管理
│   ├── utils.js           # 共通ユーティリティ
│   ├── DataLoader.js      # データ読み込み・検証
│   ├── MapManager.js      # 地図管理
│   ├── InfoPanelManager.js # 情報パネル管理
│   └── RestaurantManager.js # レストラン管理
├── data/
│   └── restaurants.json   # 元JSONデータ（参考用）
└── README.md              # このファイル
```

## データ構造

レストランデータは `data.js` に JavaScript 変数として格納されており、以下の構造を持ちます：

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
      description: "昔ながらの醤油ラーメンが自慢...",
      hours: "11:00-22:00",
      address: "東京都千代田区外神田1-1-1",
      floor: "2F",
      buildingName: "秋葉原グルメビル",
      tags: ["ラーメン", "安い", "早い"],
    },
    // ... 他の店舗データ
  ],
};
```

## 使用方法

### 基本的な使用方法

1. ブラウザで `index.html` を開く
2. 地図上のマーカーをクリックして店舗情報を確認
3. 同じ場所に複数店舗がある場合は、数字付きマーカーをクリックして一覧表示
4. 店舗一覧から個別の店舗を選択して詳細情報を表示

## アーキテクチャ

### クラス設計

- **MapManager**: 地図の初期化と管理
- **RestaurantManager**: レストランデータの管理とマーカー操作
- **InfoPanelManager**: 情報パネルの表示管理
- **DataLoader**: データ読み込みと検証
- **config.js**: 設定と環境管理
- **utils.js**: 共通ユーティリティ関数

### 環境分離

- 開発モード: デバッグログ、テスト機能、パフォーマンス監視
- 本番モード: 最適化された動作、セキュリティ強化

## 開発・デプロイ

### 推奨ホスティング

このプロジェクトは静的ファイルのみで構成されているため、以下のサービスで簡単にデプロイできます：

- **GitHub Pages** (推奨)
- Netlify
- Vercel
- Firebase Hosting
- Surge.sh

### GitHub Pages でのデプロイ手順

1. GitHub リポジトリにファイルをプッシュ
2. リポジトリ設定で GitHub Pages を有効化
3. main ブランチをソースに設定
4. 自動的に `https://username.github.io/repository-name` でアクセス可能

### ローカル開発

- ブラウザで直接ファイルを開く（`file://` プロトコル）
- VS Code Live Server 拡張機能を使用
- 任意の静的ファイルサーバーを使用

## データの更新

### 新しい店舗の追加

1. `data.js` ファイルの `RESTAURANT_DATA.restaurants` 配列に新しい店舗オブジェクトを追加
2. 必須フィールド（id, name, genre, priceRange, coordinates, description, hours, address）を設定
3. オプションフィールド（floor, buildingName, tags）を必要に応じて設定
4. ファイル保存後、サイトを再読み込みして反映確認

### データ検証

- DataLoader クラスが自動的にデータ検証を実行
- 不正なデータはコンソールに警告またはエラーとして出力
- 開発モードでは詳細な検証結果を確認可能

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## セキュリティ対策

- **XSS 対策**: HTML エスケープ処理の実装
- **データ検証**: 座標データ、必須フィールドの検証
- **入力サニタイズ**: ユーザー入力データの適切な処理
- **CSP 対応**: Content Security Policy 準拠

## アクセシビリティ

- **キーボードナビゲーション**: Tab、Enter、Space キーでの操作対応
- **スクリーンリーダー対応**: ARIA 属性、セマンティック HTML
- **色覚対応**: 色だけに依存しない情報伝達
- **タッチデバイス対応**: 適切なタッチターゲットサイズ

## パフォーマンス最適化

- **レスポンシブ画像**: 高 DPI ディスプレイ対応
- **CSS 最適化**: 効率的なセレクター、アニメーション
- **JavaScript 最適化**: モジュール分割、遅延読み込み
- **CDN 利用**: Leaflet.js の外部 CDN 読み込み

## ブラウザ対応

- **モダンブラウザ**: Chrome, Firefox, Safari, Edge (最新版)
- **モバイルブラウザ**: iOS Safari, Android Chrome
- **JavaScript**: ES6+ 対応ブラウザ
- **CSS**: Flexbox, CSS Grid 対応ブラウザ

## トラブルシューティング

### よくある問題

1. **地図が表示されない**

   - インターネット接続を確認
   - ブラウザの開発者ツールでエラーを確認
   - Leaflet.js の CDN 読み込みを確認

2. **マーカーが表示されない**

   - `data.js` ファイルの読み込みを確認
   - コンソールでデータ検証エラーを確認
   - 座標データの形式を確認

3. **レスポンシブデザインが動作しない**
   - ビューポートメタタグの設定を確認
   - CSS メディアクエリの動作を確認
   - ブラウザのキャッシュをクリア

## 関連リンク

- [Leaflet.js 公式サイト](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [GitHub Pages](https://pages.github.com/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
