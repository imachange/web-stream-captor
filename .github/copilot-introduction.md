# Copilot Introduction for web-stream-captor

## 📌 プロジェクト概要
**web-stream-captor** は、ブラウザの `MediaDevices API` を活用した、完全にクライアントサイドで動作する録音録画ツールです。
ユーザーのプライバシーを最優先し、サーバーを介さずにブラウザ内蔵の機能のみでキャプチャ、ミキシング、ファイル生成を行います。

## 🎯 設計思想
- **Privacy First**: 全データはローカルで処理。
- **Developer Centric**: 実行ログを詳細に記録し、解析を容易にする。
- **Zero Heavy Dependency**: Vite + Vanilla TypeScript + Sakura CSS という最小限の構成を維持する。

## 🛠️ 開発スタック
- **Environment**: `mise` (Node.js 22+, pnpm 9+)
- **Build Tool**: `Vite`
- **Styling**: `Sakura CSS` (セマンティックなHTMLタグを優先)
- **Security**: `Lefthook` + `Gitleaks` (全コミット/PRをスキャン)

## 📝 コーディング規約 (Copilotへの指示)

### 1. TSDocの徹底
全ての関数とクラスに詳細なTSDocを付与してください。
特に、ブラウザAPIを使用する箇所には `@throws` や `@async` を明記してください。

### 2. ロギング戦略
`src/logger.ts` の `CaptorLogger` インスタンスを使用してください。
- ユーザー操作、ストリームの状態遷移、エラー発生時は必ず `logger.info()` または `logger.error()` を実行してください。
- 解析を容易にするため、ログにはコンテキスト情報（現在の録画モードなど）を含めてください。

### 3. 音声ミキシング
システム音とマイク音を合成する場合は `AudioContext` を介して1つの `MediaStream` にまとめてから `MediaRecorder` に渡してください。

### 4. HTMLの構成
Sakura CSS の特性を活かすため、複雑なクラス定義を避け、`<header>`, `<main>`, `<section>`, `<label>`, `<button>` などの標準タグを適切に使用してください。

## 📂 ディレクトリ構成と責務
- `src/main.ts`: アプリの起動、DOMイベントのバインド。
- `src/stream.ts`: `getDisplayMedia`, `getUserMedia` の取得およびミキシング。
- `src/recorder.ts`: `MediaRecorder` のライフサイクル（start/pause/stop）管理。
- `src/logger.ts`: シリアル番号付きログの管理とエクスポート。

## 🌐 言語およびレビュー方針
- **コミュニケーション言語**: コードコメント、PRの説明、および GitHub Copilot による回答・レビューは、原則として**日本語**で行ってください。
- **レビュー品質**: Copilot による自動レビューを行う際は、ロジックの正確性に加え、TSDocの記述漏れがないか、および `CaptorLogger` によるログ出力が適切に行われているかを厳格に確認してください。

---
**Attention**: 機密情報（テスト用のAPIキー等）は絶対にコード内に含めないでください。Gitleaksが常に監視しています。