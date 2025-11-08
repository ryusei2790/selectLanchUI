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
│   ├── firebase.ts           # Firebase設定
│   └── firestore.ts          # Firestore操作
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
