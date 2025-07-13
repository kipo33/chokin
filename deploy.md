# 貯金進捗アプリのデプロイ手順

このドキュメントでは、貯金進捗アプリ（chokin）の変更から GitHub Pages へのデプロイまでの手順を説明します。

## 1. アプリに変更を加える

開発環境でアプリケーションを編集し、変更をテストします。

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173/chokin/ にアクセスして変更をプレビュー
```

主な編集対象ファイル:
- `src/App.tsx` - メインアプリケーション
- `src/components/` - 各コンポーネント
- `src/App.css` - メインのCSS
- `src/components/*.css` - コンポーネント用CSS

## 2. ビルドする

変更が完了したら、アプリケーションをビルドします。

```bash
# TypeScriptのコンパイルとViteのビルドを実行
npm run build

# .nojekyllファイルを追加（GitHub Pagesの設定用）
touch dist/.nojekyll
```

ビルド結果は `dist/` ディレクトリに生成されます。

## 3. デプロイする

ビルドしたアプリケーションを GitHub Pages にデプロイします。

```bash
# 変更をコミットしてプッシュ
git add .
git commit -m "変更内容の説明"
git push

# GitHub Pagesにデプロイ
npm run deploy
```

デプロイが成功すると、数分後に以下のURLでアプリケーションにアクセスできるようになります：
```
https://kipo33.github.io/chokin/
```

## トラブルシューティング

### デプロイ後に画面が真っ白になる場合

以下の点を確認してください：
1. `vite.config.ts` のベースパスが正しく設定されているか
2. `dist/` ディレクトリに `.nojekyll` ファイルが存在するか
3. ブラウザのキャッシュをクリアして再読み込み

### 変更が反映されない場合

1. `npm run build` を実行してビルドしているか
2. `npm run deploy` を実行してデプロイしているか
3. GitHub Pages の更新には数分かかる場合がある

## まとめ

1. 変更する：`npm run dev` でローカルサーバーを起動して開発
2. ビルドする：`npm run build` でプロダクションビルドを作成
3. デプロイする：`npm run deploy` でGitHub Pagesに公開

以上の手順に従うことで、アプリケーションの更新とデプロイが可能です。 