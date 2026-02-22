# web-stream-captor

ブラウザの MediaDevices API を使ったクライアントサイド録画ツールのプロトタイプ。

## 使い方

```
pnpm install
pnpm dev            # ローカル開発
pnpm run build       # 本番ビルド
```

ビルド結果は `dist/` に出力されます。

## GitHub Pages への自動デプロイ

本リポジトリでは `main` ブランチに push されたタイミングで
`dist/` をビルドし、`gh-pages` ブランチにデプロイするワークフロー
(`.github/workflows/pages.yml`) を用意しています。

公開設定は以下の通りに行ってください:

1. リポジトリ設定 > Pages に移動
2. "Source" を **GitHub Actions** に設定
3. ページ URL が `https://<ユーザ名>.github.io/web-stream-captor/` になることを確認

`vite.config.ts` で `base` を `'/web-stream-captor/'` に固定しており、
Pages 上でも正しく動作します。

## 開発方針

- プライバシー重視で録画データはすべてクライアント側で処理
- `src/logger.ts` によるログ記録
- Simple TypeScript + Vite + Sakura CSS

詳細は `.github/copilot-introduction.md` を参照してください。
