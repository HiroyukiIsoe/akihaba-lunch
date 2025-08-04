---
inclusion: fileMatch
fileMatchPattern: "*akihaba-lunch-map*"
---

# 秋葉原ランチマップ - 技術制約

## プロジェクト概要

秋葉原エリアのランチスポットを地図上に表示する静的 Web アプリケーション

## 技術スタック（固定）

### 必須技術

- **HTML5**: セマンティックマークアップ
- **CSS3**: レスポンシブデザイン、Flexbox/Grid 使用
- **Vanilla JavaScript**: ES6+構文使用、モジュール分割なし
- **Leaflet.js**: 地図表示ライブラリ（CDN 版のみ）

### データ管理

- **JSON 形式**: `data/restaurants.json`で店舗情報管理
- **静的ファイル**: サーバーサイド処理なし
- **fetch API**: データ取得に使用

### 禁止技術

- Node.js 関連すべて
- ビルドプロセス
- パッケージマネージャー
- フレームワーク（React、Vue 等）
- TypeScript
- CSS プリプロセッサー

## ファイル構成（固定）

```
/
├── index.html          # メインページ
├── styles.css          # 全スタイル（単一ファイル）
├── script.js           # 全JavaScript（単一ファイル）
├── data/
│   └── restaurants.json # レストランデータ
├── README.md           # プロジェクト説明
└── .kiro/              # Kiro設定
```

## 実装制約

### JavaScript

- クラスベース設計使用
- ES6+構文（const/let、アロー関数、テンプレートリテラル）
- DOM 操作は標準 API 使用
- 外部ライブラリは CDN 経由のみ

### CSS

- Flexbox/CSS Grid でレイアウト
- CSS 変数（カスタムプロパティ）使用可
- メディアクエリでレスポンシブ対応
- 単一ファイルで管理

### データ構造

```json
{
  "restaurants": [
    {
      "id": "string",
      "name": "string",
      "genre": "string",
      "priceRange": "string",
      "coordinates": {"lat": number, "lng": number},
      "description": "string",
      "hours": "string",
      "address": "string",
      "floor": "string",
      "buildingName": "string",
      "tags": ["string"]
    }
  ]
}
```

## 機能要件

### 必須機能

1. 地図表示（Leaflet.js 使用）
2. レストランマーカー表示
3. 同一座標複数店舗のクラスター表示
4. 店舗詳細情報パネル
5. レスポンシブデザイン

### 技術的制約

- ブラウザ直接実行可能
- 外部 API 依存なし
- ローカルファイルアクセス対応
- CORS 制約回避（同一オリジン）

## 開発・テスト

### 推奨開発環境

```bash
# Python簡易サーバー
python3 -m http.server 8000

# PHP簡易サーバー
php -S localhost:8000
```

### ブラウザ対応

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## デプロイ制約

### 対応ホスティング

- 静的サイトホスティングのみ
- サーバーサイド処理不要
- 設定ファイル不要

### 非対応

- Node.js ホスティング
- サーバーレス関数
- データベース連携
- API サーバー
