# selectLanch セットアップガイド

## 🚀 実装済み機能

✅ Next.js 14 + TypeScript + Tailwind CSSのセットアップ
✅ Firebase認証・Firestore統合
✅ ログイン・サインアップ機能
✅ ランチルーレット機能
✅ AIレシピ提案機能
✅ 料理投稿フォーム
✅ ナビゲーションバー

## 🔧 セットアップ手順

### 1. Firebaseプロジェクト作成

1. https://console.firebase.google.com/ にアクセス
2. 新規プロジェクト作成
3. Authentication → メール/パスワード有効化
4. Firestore Database → テストモードで作成
5. プロジェクト設定 → 認証情報をコピー

### 2. 環境変数設定

`.env.local` ファイルに以下を設定:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. 起動

```bash
npm install
npm run dev
```

## 📝 次に実装する機能

### 掲示板ページ (`/app/dishes/page.tsx`)
- 料理一覧表示
- ジャンル別タブ
- 並び替え機能
- いいねボタン

### Cursorで使うプロンプト例:

```
/app/dishes/page.tsx を作成してください。

必要な機能:
- getDishes()で料理一覧取得
- ジャンル別タブ（全て、主食、主菜、副菜、デザート）
- 並び替え（人気順、新着順）
- DishCardコンポーネントでグリッド表示
- ローディング・エラーハンドリング
```

### 料理カード (`/components/DishCard.tsx`)

```
DishCard.tsxコンポーネントを作成してください。

Props: dish (Dish型)
表示: 画像、料理名、国名、いいね数、投稿者名
クリックで詳細ページへ遷移
```

### いいねボタン (`/components/LikeButton.tsx`)

```
LikeButton.tsxを作成してください。

toggleLike()を使用
楽観的UI更新
ハートアイコンのアニメーション
```

### プロフィール (`/app/profile/page.tsx`)

```
プロフィールページを作成してください。

ユーザー情報表示と編集
updateUserProfile()で更新
自分の投稿一覧へのリンク
```

### 検索ページ (`/app/search/page.tsx`)

```
検索ページを作成してください。

searchDishes()で検索
リアルタイム検索
カテゴリーフィルター
検索結果表示
```

## 📚 利用可能なFirestore関数

- `createDish()` - 料理作成
- `getDishes()` - 料理一覧取得
- `getDish()` - 料理詳細取得
- `updateDish()` - 料理更新
- `deleteDish()` - 料理削除
- `toggleLike()` - いいね切り替え
- `checkIfLiked()` - いいね状態確認
- `getUserProfile()` - ユーザー情報取得
- `updateUserProfile()` - ユーザー情報更新
- `searchDishes()` - 料理検索
