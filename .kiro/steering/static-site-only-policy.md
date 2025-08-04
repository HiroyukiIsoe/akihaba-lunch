# 静的サイト専用開発ポリシー

## 基本方針

このプロジェクト（秋葉原ランチマップ）では、純粋な静的サイト技術のみを使用し、サーバーサイド言語やビルドツールを一切使用しない開発を徹底します。

## 禁止事項

### サーバーサイド言語・ランタイム

- **Node.js** 本体の使用禁止
- **Python** 本体の使用禁止（開発サーバー含む）
- **PHP** の使用禁止
- **Ruby** の使用禁止
- **Go** の使用禁止
- その他すべてのサーバーサイド言語の使用禁止

### パッケージマネージャー・依存関係管理

- npm、yarn、pnpm などの Node.js パッケージマネージャーの使用禁止
- pip、conda などの Python パッケージマネージャーの使用禁止
- composer、gem、cargo などの他言語パッケージマネージャーの使用禁止
- package.json、requirements.txt、Gemfile などの依存関係ファイルの作成禁止
- node_modules、venv、vendor などの依存関係ディレクトリの作成禁止

### ビルドツール・プリプロセッサー

- Webpack、Vite、Parcel、Rollup などのバンドラーの使用禁止
- Babel、TypeScript コンパイラーの使用禁止
- Sass、Less、PostCSS、Stylus などの CSS プリプロセッサーの使用禁止
- Gulp、Grunt、Webpack などのタスクランナーの使用禁止

### 開発ツール（言語依存）

- ESLint、Prettier、JSHint などの Node.js 依存開発ツールの使用禁止
- Black、flake8、pylint などの Python 依存開発ツールの使用禁止
- その他言語固有の開発ツールの使用禁止

### フレームワーク・ライブラリ（言語依存）

- React、Vue.js、Angular、Svelte などの JavaScript フレームワークの使用禁止
- Express.js、Fastify、Koa などの Node.js サーバーフレームワークの使用禁止
- Flask、Django、FastAPI などの Python フレームワークの使用禁止
- 言語固有のライブラリの使用禁止

### 開発サーバー

- Node.js ベースの開発サーバーの使用禁止
- Python の http.server、Flask 開発サーバーの使用禁止
- PHP ビルトインサーバーの使用禁止
- その他プログラミング言語による開発サーバーの使用禁止

## 許可される技術

### 基本技術

- HTML5（純粋なマークアップ）
- CSS3（純粋なスタイルシート）
- Vanilla JavaScript（ES6+対応）

### 外部ライブラリ

- CDN から読み込む形式のライブラリのみ許可
- 例：Leaflet.js、Chart.js、Lodash（CDN 版）

### データ形式

- 静的 JSON ファイル
- CSV ファイル（JavaScript で解析）
- XML ファイル（JavaScript で解析）

### 開発・テスト環境

- ブラウザの開発者ツール
- ブラウザでの直接ファイル実行（file://プロトコル）
- Live Server 拡張機能（VS Code）などのエディター内蔵静的サーバー
- 静的ホスティングサービスのプレビュー機能

## 実装ガイドライン

### ファイル構成

```
/
├── index.html          # メインHTML
├── styles.css          # CSS（単一ファイル推奨）
├── script.js           # JavaScript（単一ファイル推奨）
├── data/
│   └── *.json         # 静的データファイル
└── assets/            # 画像・その他リソース
```

### ライブラリ読み込み

```html
<!-- CDNからの読み込み例 -->
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

### データ取得

```javascript
// fetch APIを使用した静的JSONの読み込み
fetch("./data/restaurants.json")
  .then((response) => response.json())
  .then((data) => {
    // データ処理
  });
```

## デプロイ方法

### 推奨ホスティングサービス

- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Surge.sh

### デプロイ手順

1. ファイルをそのままアップロード
2. 設定不要（静的ファイルのみ）
3. 即座に公開可能

## 違反時の対応

サーバーサイド言語やビルドツールの使用を提案された場合：

1. このポリシーを参照して代替案を提示
2. 静的サイト向けの解決策を検討
3. CDN ベースのライブラリで代替可能か確認
4. ブラウザネイティブ API での実装を優先検討

## 例外規定

このポリシーに例外はありません。すべての機能は静的サイト技術で実現します。
