# 元本積立アプリ

貯金の目標を設定し、進捗を可視化して管理するためのWebアプリケーションです。

## 主な機能

- ユーザー認証（Supabase Auth）
- 目標金額の設定と進捗管理
- ビジュアル化された貯金トラッカー
- ユーザーごとのデータ保存

## 技術スタック

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (認証・データベース)

## セットアップ手順

1. リポジトリをクローンする
```bash
git clone <repository-url>
cd 元本積立アプリ
```

2. 依存関係をインストールする
```bash
npm install
```

3. Supabase設定

Supabaseでプロジェクトを作成し、以下の手順でデータベースを設定してください：

- 認証設定: Email/Passwordを有効化
- テーブル作成:

```sql
create table public.savings_goals (
  id uuid default uuid_generate_v4() not null primary key,
  user_id uuid references auth.users not null,
  target_amount bigint not null default 10000000,
  saved_amount bigint not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーの設定
alter table public.savings_goals enable row level security;

-- ユーザーは自分のデータのみ参照可能
create policy "Users can view own savings"
  on public.savings_goals for select
  using (auth.uid() = user_id);

-- ユーザーは自分のデータのみ作成可能
create policy "Users can insert own savings"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

-- ユーザーは自分のデータのみ更新可能
create policy "Users can update own savings"
  on public.savings_goals for update
  using (auth.uid() = user_id);
```

4. 環境変数を設定する

プロジェクトのルートディレクトリに`.env.local`ファイルを作成し、Supabase接続情報を追加します：

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. アプリケーションを起動する
```bash
npm run dev
```

## 使用方法

1. アカウントを作成するか、ログインします
2. 目標金額を設定します（デフォルトは1,000万円）
3. ドットをクリックして貯金状況を更新します
4. 「登録」ボタンを押して貯金額を反映させます

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/tree/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
