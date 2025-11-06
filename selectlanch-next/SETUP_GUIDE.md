# selectLanch - 完全セットアップガイド

## 🎉 実装完了！

すべての主要機能の実装が完了しました！

## ✅ 実装済み機能一覧

### コア機能
- ✅ Next.js 14 + TypeScript + Tailwind CSS
- ✅ Firebase Authentication（メールログイン）
- ✅ Firestore Database 統合
- ✅ 認証コンテキスト

### ページ
- ✅ トップページ（ランチルーレット）
- ✅ ログイン/サインアップページ
- ✅ 料理掲示板ページ
- ✅ 料理投稿ページ
- ✅ プロフィールページ
- ✅ 検索ページ
- ✅ 使い方ページ
- ✅ AIレシピ結果ページ

### コンポーネント
- ✅ ナビゲーションバー
- ✅ 料理カード
- ✅ いいねボタン（アニメーション付き）

### 機能
- ✅ ランチルーレット（選択履歴管理）
- ✅ AIレシピ提案
- ✅ 料理の投稿・閲覧
- ✅ カテゴリー別表示
- ✅ 並び替え（人気順・新着順）
- ✅ いいね機能（楽観的UI更新）
- ✅ リアルタイム検索
- ✅ プロフィール編集

## 🚀 セットアップ手順

### 1. Firebaseプロジェクトの作成

#### ステップ1: プロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: selectlanch）
4. Google Analyticsは任意（オフでもOK）
5. プロジェクトを作成

#### ステップ2: Webアプリの登録
1. プロジェクトのホーム画面で「ウェブ」アイコン（</>）をクリック
2. アプリのニックネームを入力（例: selectlanch-web）
3. Firebase Hostingは任意（後で設定可能）
4. 「アプリを登録」をクリック
5. 表示される設定情報をコピー（後で使います）

#### ステップ3: Authentication設定
1. サイドバーから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「メール/パスワード」を選択
5. 「有効にする」をオンにして「保存」

#### ステップ4: Firestore Database作成
1. サイドバーから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択（asia-northeast1 推奨）
4. **「テストモードで開始」** を選択（後でルールを更新）
5. 「有効にする」をクリック

#### ステップ5: セキュリティルールの設定
1. Firestore Databaseの「ルール」タブを選択
2. 以下の内容をコピー＆ペースト（`firestore.rules`の内容）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if true;
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false;
    }

    match /dishes/{dishId} {
      allow read: if true;
      allow create: if isSignedIn()
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.likesCount == 0;
      allow update: if isOwner(resource.data.authorId)
        && request.resource.data.authorId == resource.data.authorId
        && request.resource.data.likesCount == resource.data.likesCount;
      allow delete: if isOwner(resource.data.authorId);
    }

    match /likes/{likeId} {
      allow read: if true;
      allow create: if isSignedIn()
        && request.resource.data.userId == request.auth.uid;
      allow update: if false;
      allow delete: if isOwner(resource.data.userId);
    }
  }
}
```

3. 「公開」をクリック

#### ステップ6: インデックスの作成
1. Firestore Databaseの「インデックス」タブを選択
2. 「複合」タブで以下のインデックスを手動作成:

**dishes コレクション:**
- インデックス1: `category`(昇順) + `likesCount`(降順)
- インデックス2: `category`(昇順) + `createdAt`(降順)
- インデックス3: `authorId`(昇順) + `createdAt`(降順)

**likes コレクション:**
- インデックス1: `userId`(昇順) + `dishId`(昇順)
- インデックス2: `userId`(昇順) + `createdAt`(降順)
- インデックス3: `dishId`(昇順) + `createdAt`(降順)

💡 **ヒント**: 最初にアプリを使い始めると、必要なインデックスがないというエラーが出ます。その際、エラーメッセージ内のリンクをクリックすれば自動でインデックスが作成されます。

### 2. 環境変数の設定

プロジェクトルートの `.env.local` ファイルを開き、Firebase設定を入力:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=あなたのAPIキー
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=あなたのプロジェクトID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=あなたのプロジェクトID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=あなたのプロジェクトID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=あなたのメッセージング送信者ID
NEXT_PUBLIC_FIREBASE_APP_ID=あなたのアプリID
```

設定情報は以下から取得できます:
1. Firebase Console
2. プロジェクト設定（歯車アイコン）
3. 「マイアプリ」セクションで登録したWebアプリを選択
4. 「SDK の設定と構成」の「構成」を選択

### 3. 依存関係のインストール

```bash
cd selectlanch-next
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

### 5. 動作確認

1. **サインアップ**
   - 右上の「新規登録」をクリック
   - メールアドレス、パスワード、表示名を入力
   - アカウント作成

2. **ルーレット機能**
   - トップページで「ルーレットを回す」をクリック
   - 結果が表示されたら「AIにレシピを聞く」をクリック

3. **料理投稿**
   - ナビバーの「投稿する」をクリック
   - フォームに料理情報を入力
   - 投稿

4. **掲示板**
   - ナビバーの「掲示板」をクリック
   - カテゴリーと並び替えを試す
   - 料理にいいね

5. **検索**
   - ナビバーの「検索」をクリック
   - キーワードを入力して検索

6. **プロフィール**
   - ナビバーのユーザー名をクリック
   - プロフィール編集を試す
   - 投稿一覧といいね一覧を確認

## 📁 プロジェクト構造

```
selectlanch-next/
├── app/
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # トップページ（ルーレット）
│   ├── login/page.tsx          # ログイン
│   ├── signup/page.tsx         # サインアップ
│   ├── dishes/
│   │   ├── page.tsx            # 掲示板
│   │   └── new/page.tsx        # 料理投稿
│   ├── profile/page.tsx        # プロフィール
│   ├── search/page.tsx         # 検索
│   ├── how-to-use/page.tsx     # 使い方
│   └── result/page.tsx         # AIレシピ結果
├── components/
│   ├── Navbar.tsx              # ナビゲーションバー
│   ├── DishCard.tsx            # 料理カード
│   └── LikeButton.tsx          # いいねボタン
├── contexts/
│   └── AuthContext.tsx         # 認証コンテキスト
├── lib/
│   ├── firebase.ts             # Firebase初期化
│   ├── auth.ts                 # 認証サービス
│   └── firestore.ts            # Firestore CRUD
├── types/
│   └── index.ts                # 型定義
├── firestore.rules             # Firestoreセキュリティルール
├── firestore.indexes.json      # Firestoreインデックス定義
└── .env.local                  # 環境変数
```

## 🎨 カスタマイズ

### カラーの変更
`app/globals.css` と Tailwind クラスを編集:
- Primary: `orange-500` (#f97316)
- Secondary: `yellow-500` (#eab308)
- Accent: `red-500` (#ef4444)

### ロゴの変更
`components/Navbar.tsx` の絵文字（🍽️）を変更

### AIレシピAPI
現在は `https://selectlanchserver.onrender.com/send-to-dify` を使用
別のAPIに変更する場合は `app/page.tsx` の `handleAskAI` を編集

## 🐛 トラブルシューティング

### Firebaseエラー
```
Firebase: Error (auth/configuration-not-found)
```
→ `.env.local` の設定を確認

### インデックスエラー
```
The query requires an index
```
→ エラーメッセージ内のリンクをクリックしてインデックス作成

### 画像が表示されない
- 画像URLが正しいか確認
- CORS設定を確認
- プレースホルダー画像が代わりに表示されます

## 📦 デプロイ（Vercel推奨）

1. GitHubリポジトリにpush
2. [Vercel](https://vercel.com) にアクセス
3. 「Import Project」でリポジトリを選択
4. 環境変数を設定（`.env.local`の内容をコピー）
5. デプロイ

## 🔄 今後の拡張案

- [ ] 料理詳細ページ
- [ ] 料理編集・削除機能
- [ ] コメント機能
- [ ] 画像アップロード（Firebase Storage）
- [ ] 全文検索（Algolia/Meilisearch）
- [ ] 通知機能
- [ ] ソーシャルシェア
- [ ] レシピ保存機能
- [ ] お気に入りタグ機能

## 📚 技術スタック

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **Animation**: CSS Animations
- **Deployment**: Vercel (推奨)

## 🙋 サポート

質問や問題がある場合:
1. Firebase Console でエラーログを確認
2. ブラウザのコンソールでエラーを確認
3. `.env.local` の設定を再確認

---

## 🎊 完成おめでとうございます！

これで完全に動作するランチ料理掲示板アプリの完成です。
ぜひ友達や家族と共有して、たくさんの料理を投稿してみてください！
