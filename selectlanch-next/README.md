# SelectLanch - Next.js版

世界の料理をルーレットで選んで、AIがレシピを提案するWebアプリケーション

## 🎯 主な機能

- **ルーレット選択**: 国・地域 → 主食 → 主菜 の3段階で料理を選択
- **AI レシピ生成**: ログインユーザー限定で、選択した組み合わせからAIがレシピを提案
- **料理検索**: 料理名、国名、地域で検索可能
- **掲示板機能**: 料理の投稿・閲覧・いいね機能
- **ユーザー認証**: Firebase Authentication を使用した認証システム
- **レシピ保存**: 生成したレシピをFirestoreに保存

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 4
- **アニメーション**: Framer Motion
- **認証**: Firebase Authentication
- **データベース**: Cloud Firestore
- **UI**: React 19

## ⚡ パフォーマンス最適化

このアプリケーションは **Firebase無料枠内での運用** を目的とした最適化が施されています：

### Firestore読み取り最適化
- **検索機能**: 全件取得から最大100件制限に変更（500件から取得→フィルタリング）
- **ページング**: 料理一覧は20件ずつ表示、「もっと見る」で段階的にロード
- **バッチ処理**: いいねした料理の取得を並列バッチ処理に変更（10件ずつ）

### キャッシュ機能 ([lib/cache.ts](lib/cache.ts))
- インメモリキャッシュでFirestoreへのリクエストを削減
- TTL（Time To Live）設定で自動的にキャッシュをクリア
- 頻繁にアクセスするデータを5分間キャッシュ

### レート制限 ([lib/rateLimiter.ts](lib/rateLimiter.ts))
- 一般リクエスト: 60回/分
- 検索リクエスト: 30回/分
- 書き込みリクエスト: 20回/分
- 過度なリクエストを防止し、無料枠を保護

### 無料枠の上限
| 項目 | Firebase無料枠 | 推定使用量 | 状態 |
|------|---------------|----------|------|
| 読み取り | 50,000回/日 | 500-2,000回/日 | ✅ 安全 |
| 書き込み | 20,000回/日 | 50-200回/日 | ✅ 安全 |
| ストレージ | 1GB | ~70MB（1年後） | ✅ 安全 |

### 最適化の効果
- 検索: 1回あたり **1,000+ → 最大500読み取り** に削減（80%減）
- いいね取得: **N回の逐次読み取り → 並列バッチ処理** で高速化
- ページング: 初回ロード **50件 → 20件** に削減（60%減）

## 📦 インストール

```bash
# 依存関係のインストール
npm install
```

## 🔧 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Dify API (Optional - defaults to selectlanchserver.onrender.com)
DIFY_API_URL=https://selectlanchserver.onrender.com/send-to-dify
```

## 🗄️ データベースのセットアップ

### 1. Firestoreインデックスの作成

Firestoreコンソールで以下のインデックスを作成してください:

- `dishes` コレクション:
  - `country` (Ascending) + `category` (Ascending)
  - `category` (Ascending) + `likesCount` (Descending)
  - `category` (Ascending) + `createdAt` (Descending)

- `likes` コレクション:
  - `userId` (Ascending) + `dishId` (Ascending)
  - `userId` (Ascending) + `createdAt` (Descending)

- `recipes` コレクション:
  - `userId` (Ascending) + `createdAt` (Descending)

### 2. 料理データのインポート

レガシー版の `dishes.json` からFirestoreへ料理データをインポート:

```bash
# Firebase Admin SDK の認証設定
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"

# インポート実行
npm run import-dishes
```

## 🚀 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## 📁 プロジェクト構造

```
selectlanch-next/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── generate-recipe/  # AI レシピ生成エンドポイント
│   ├── dishes/               # 掲示板ページ
│   ├── how-to-use/           # 使い方ページ
│   ├── login/                # ログインページ
│   ├── profile/              # プロフィールページ
│   ├── result/               # レシピ結果ページ
│   ├── search/               # 検索ページ
│   ├── signup/               # サインアップページ
│   ├── layout.tsx            # ルートレイアウト
│   └── page.tsx              # ホームページ (ルーレット)
├── components/               # Reactコンポーネント
│   ├── DishCard.tsx          # 料理カード
│   ├── LikeButton.tsx        # いいねボタン
│   ├── Navbar.tsx            # ナビゲーションバー
│   └── Roulette.tsx          # ルーレットコンポーネント
├── contexts/                 # React Context
│   └── AuthContext.tsx       # 認証コンテキスト
├── lib/                      # ユーティリティ
│   ├── api.ts                # API呼び出し関数
│   ├── auth.ts               # 認証関連
│   ├── cache.ts              # キャッシュ機能
│   ├── firebase.ts           # Firebase設定
│   ├── firestore.ts          # Firestore操作
│   └── rateLimiter.ts        # レート制限
├── scripts/                  # スクリプト
│   └── import-dishes.ts      # 料理データインポート
├── types/                    # TypeScript型定義
│   └── index.ts
└── package.json
```

## 🔐 Firebase Admin SDK の設定

API RouteでFirebase Adminを使用するには、サービスアカウントキーが必要です:

1. Firebase Console → プロジェクト設定 → サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードしたJSONファイルを安全な場所に保存
4. 環境変数 `GOOGLE_APPLICATION_CREDENTIALS` にパスを設定

## 🎨 主要なページ

- **/** - ホーム(ルーレット機能)
- **/search** - 料理検索
- **/dishes** - 料理掲示板
- **/dishes/new** - 料理投稿
- **/result** - AIレシピ結果
- **/profile** - ユーザープロフィール
- **/login** - ログイン
- **/signup** - サインアップ
- **/how-to-use** - 使い方

## 🤖 AI機能について

AI レシピ生成機能は、ログインユーザーのみが使用できます。未ログインの場合はログインページにリダイレクトされます。

API Route (`/api/generate-recipe`) は:
1. Firebase ID Token で認証チェック
2. 外部 Dify API にリクエスト送信
3. Markdown形式のレシピを返却

## 📝 データモデル

### Dish (料理)
```typescript
{
  id: string;
  name: string;
  nameEn?: string;
  country: string;
  region: string;
  category: 'main_food' | 'main_dish' | 'side_dish' | 'dessert';
  description?: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  likesCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### AIRecipe (レシピ)
```typescript
{
  id: string;
  userId: string;
  country: string;
  mainFood: string;
  mainDish: string;
  recipe: string; // Markdown
  createdAt: Timestamp;
}
```

## 🌐 デプロイ

### Vercel (推奨)

```bash
# Vercel CLIでデプロイ
npm install -g vercel
vercel
```

環境変数をVercelダッシュボードで設定することを忘れずに。

## 📄 ライセンス

Private

## 🙏 クレジット

- AI API: Dify
- UI Icons: Unicode Emoji
- Animations: Framer Motion
