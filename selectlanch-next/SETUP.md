# SelectLanch セットアップガイド

このガイドでは、SelectLanch Next.jsアプリケーションを最初からセットアップする手順を説明します。

## 前提条件

- Node.js 18以降がインストールされていること
- Firebaseプロジェクトが作成されていること
- Firebase Admin SDKのサービスアカウントキーを取得していること

## ステップ1: 依存関係のインストール

```bash
cd selectlanch-next
npm install
```

## ステップ2: Firebase設定

### 2.1 環境変数ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Optional: Dify APIのカスタムURL
DIFY_API_URL=https://selectlanchserver.onrender.com/send-to-dify
```

### 2.2 Firebase Consoleで値を取得

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. 「プロジェクトの設定」→「全般」→「マイアプリ」
4. ウェブアプリの設定から、各値をコピーして `.env.local` に貼り付け

### 2.3 Firebase Admin SDK サービスアカウントキーの取得

1. Firebase Console → 「プロジェクトの設定」→「サービスアカウント」
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードしたJSONファイルを安全な場所に保存
4. ターミナルで環境変数を設定:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

## ステップ3: Firestore設定

### 3.1 Firestoreを有効化

1. Firebase Console → 「Firestore Database」
2. 「データベースを作成」をクリック
3. 本番環境モードまたはテストモードを選択
4. ロケーションを選択 (asia-northeast1 推奨)

### 3.2 セキュリティルールの設定

Firestoreのルールタブで以下を設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Dishes collection
    match /dishes/{dishId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.authorId == request.auth.uid;
    }

    // Likes collection
    match /likes/{likeId} {
      allow read: if true;
      allow create, delete: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    // Recipes collection
    match /recipes/{recipeId} {
      allow read: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3.3 インデックスの作成

以下のインデックスを手動で作成するか、アプリ実行時のエラーメッセージに表示されるリンクから作成:

**dishes コレクション:**
- フィールド: `country` (Ascending), `category` (Ascending)
- フィールド: `category` (Ascending), `likesCount` (Descending)
- フィールド: `category` (Ascending), `createdAt` (Descending)

**likes コレクション:**
- フィールド: `userId` (Ascending), `dishId` (Ascending)
- フィールド: `userId` (Ascending), `createdAt` (Descending)

**recipes コレクション:**
- フィールド: `userId` (Ascending), `createdAt` (Descending)

## ステップ4: Firebase Authenticationの設定

1. Firebase Console → 「Authentication」
2. 「始める」をクリック
3. 「Sign-in method」タブを開く
4. 「メール/パスワード」を有効化

## ステップ5: 料理データのインポート

レガシー版の `dishes.json` をFirestoreにインポート:

```bash
# 親ディレクトリに dishes.json があることを確認
ls ../dishes.json

# インポート実行
npm run import-dishes
```

インポートが成功すると、200以上の料理がFirestoreに追加されます。

## ステップ6: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ステップ7: 動作確認

### 7.1 ユーザー登録
1. 右上の「ログイン」→「新規登録」
2. メールアドレスとパスワードを入力して登録

### 7.2 ルーレット機能
1. ホームページの「ルーレットを回す」をクリック
2. 国・地域が選択されたら、もう一度クリック
3. 主食が選択されたら、もう一度クリック
4. 主菜が選択されたら、「AIにレシピを聞く」をクリック

### 7.3 検索機能
1. ナビゲーションバーの「検索」をクリック
2. 料理名、国名、地域を入力して検索

### 7.4 掲示板機能
1. ナビゲーションバーの「掲示板」をクリック
2. 料理一覧が表示されることを確認
3. いいねボタンをクリックして動作確認

## トラブルシューティング

### エラー: Firebase Admin SDK の認証に失敗

**原因**: `GOOGLE_APPLICATION_CREDENTIALS` が設定されていない

**解決策**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

### エラー: Firestoreのインデックスが必要

**原因**: 必要なインデックスが作成されていない

**解決策**: エラーメッセージに表示されるリンクをクリックして、インデックスを自動作成

### エラー: 料理データが表示されない

**原因**: dishes.json のインポートが完了していない

**解決策**:
```bash
npm run import-dishes
```

### エラー: AI機能が動作しない

**原因**:
- ユーザーがログインしていない
- Dify API URLが正しくない

**解決策**:
1. ログインしているか確認
2. `.env.local` の `DIFY_API_URL` を確認

## 次のステップ

- カスタムドメインの設定
- Vercelへのデプロイ
- 画像アップロード機能の追加
- プロフィール編集機能の実装
- レシピ履歴の表示

## サポート

問題が発生した場合は、以下を確認してください:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [プロジェクトのREADME](./README.md)
