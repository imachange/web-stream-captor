#!/usr/bin/env node
/**
 * Prepare script (ESM)
 * - CI 環境では lefthook の自動インストールをスキップ
 * - Git が無ければスキップ
 * - 非 Windows 環境で .config/scripts/*.js に実行権限を付与
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const isCI = () => {
  const ci = process.env.CI;
  return !!(ci && ci !== 'false');
};

const hasGit = () => {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const runLefthookInstall = () => {
  try {
    console.log('lefthook: インストールを開始します...');
    execSync('npx lefthook install', { stdio: 'inherit' });
    console.log('lefthook: インストール完了');
  } catch (err) {
    console.warn('lefthook のインストールに失敗しました。スキップします。', err?.message ?? err);
  }
};

const chmodScripts = () => {
  if (process.platform === 'win32') {
    console.log('Windows 環境のため chmod はスキップします。');
    return;
  }
  const pattern = path.join(process.cwd(), '.config', 'scripts', '*.js');
  const files = globSync(pattern);
  if (files.length === 0) {
    console.log('実行対象のスクリプトが見つかりません（.config/scripts/*.js）。');
    return;
  }
  for (const f of files) {
    try {
      fs.chmodSync(f, 0o755);
      console.log(`実行権限を付与しました: ${f}`);
    } catch (e) {
      console.warn(`権限付与に失敗しました: ${f}`, e?.message ?? e);
    }
  }
};

(function main() {
  if (isCI()) {
    console.log('CI 環境のため lefthook の自動インストールはスキップします。');
  } else if (!hasGit()) {
    console.log('Git が存在しないため lefthook をインストールできません。スキップします。');
  } else {
    runLefthookInstall();
  }

  chmodScripts();
})();