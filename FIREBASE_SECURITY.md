# Firebase セキュリティルール管理

このプロジェクトでは、Firestore と Firebase Storage のセキュリティルールをコード管理しています。

## ファイル構成

```
├── firebase.json          # Firebase CLI設定ファイル
├── firestore.rules        # Firestoreセキュリティルール
├── storage.rules          # Firebase Storageセキュリティルール
└── firestore.indexes.json # Firestoreインデックス設定
```

## セキュリティルールの内容

### Firestore ルール (`firestore.rules`)

- **ユーザー認証チェック**: ログイン済みユーザーのみアクセス可能
- **所有者チェック**: ユーザーは自分のデータのみ編集可能
- **管理者権限**: `users` ドキュメントの `admin` フィールドで判定
- **投稿可視性制御**: `visibility` フィールドによる公開/非公開制御
- **コレクション別アクセス制御**:
  - `users`: 自分のユーザー情報のみ（管理者は全ユーザーにアクセス可能）
  - `users/{userId}/oshi/{oshiId}`: 自分の推し情報のみ（作成・編集・削除可能）
  - `posts`: 公開投稿は誰でも読める、非公開投稿は所有者と管理者のみ
  - `categories`: 読み取りは全員、書き込みは管理者のみ

### Storage ルール (`storage.rules`)

- **ファイルサイズ制限**: 10MB 以下
- **ファイル形式制限**: 画像ファイルのみ
- **管理者権限**: Firestore と同様に`users`ドキュメントの`admin`フィールドで判定
- **投稿画像の可視性**: Firestore の投稿データと連携して可視性を制御
- **パス別アクセス制御**:
  - `avatars/{userId}/`: アバター画像（公開、所有者のみ編集）
  - `posts/{postId}/`: 投稿画像（公開投稿は誰でも読める、非公開投稿は所有者と管理者のみ）
  - `temp/{userId}/`: 一時ファイル（所有者のみ）
  - `admin/`: 管理者専用ファイル

## データ構造との整合性

### 実際のデータ構造に基づく設定

- **管理者判定**: `users` ドキュメントの `admin: true` フィールドを使用（Firestore・Storage 共通）
- **投稿可視性**: `posts` ドキュメントの `visibility` フィールド（"public" | "private"）
- **推し管理**: `users/{userId}/oshi/{oshiId}` サブコレクション構造
- **カテゴリー**: `categories` コレクション（管理者のみ編集可能）

### Firestore と Storage の一貫性

- **管理者権限**: 両方とも`users`ドキュメントの`admin`フィールドを使用
- **投稿画像の可視性**: Storage の投稿画像アクセスは Firestore の投稿データと連携
- **所有者チェック**: 投稿画像の所有者は Firestore の投稿データから判定

## 開発・デプロイ手順

### 1. Firebase CLI のインストール

```bash
npm install -g firebase-tools
```

### 2. Firebase プロジェクトの初期化

```bash
firebase login
firebase init
```

### 3. Firebase プロジェクトのエイリアス設定

開発環境とステージング環境を分けて管理する場合：

```bash
# プロジェクトエイリアスを追加
firebase use --add

# プロジェクトを選択（stagingの場合）
? Which project do you want to add? oshi-box-dev

# エイリアス名を設定
? What alias do you want to use for this project? (e.g. staging) staging

# エイリアスを切り替え
firebase use staging

# 現在のプロジェクトを確認
firebase use
```

### 4. ローカルエミュレーターでのテスト

```bash
npm run firebase:emulators
```

エミュレーター UI: http://localhost:4000

### 5. セキュリティルールのデプロイ

```bash
# FirestoreとStorageのルールのみデプロイ
npm run firebase:deploy:rules

# Firestoreインデックスのみデプロイ
npm run firebase:deploy:indexes

# 全設定をデプロイ
npm run firebase:deploy:all
```

### 6. デプロイの確認

デプロイが完了すると、以下のような出力が表示されます：

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/oshi-box-dev/overview
```

## セキュリティルールのテスト

### Firestore ルールテスト

```javascript
// テスト例
const testRules = async () => {
  // 未認証ユーザーは公開投稿を読める
  await firebase.assertSucceeds(
    db.collection("posts").where("visibility", "==", "public").get()
  );

  // 未認証ユーザーは投稿を作成できない
  await firebase.assertFails(
    db.collection("posts").add({
      title: "Test Post",
      content: "Test Content",
      visibility: "public",
      userId: "test-user-id",
    })
  );

  // ユーザーは自分の推しを作成できる
  await firebase.assertSucceeds(
    db.collection("users").doc(userId).collection("oshi").add({
      name: "推しの名前",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 他のユーザーの推しは作成できない
  await firebase.assertFails(
    db.collection("users").doc(otherUserId).collection("oshi").add({
      name: "推しの名前",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  // 管理者は全データにアクセス可能
  await firebase.assertSucceeds(db.collection("users").get());
};
```

### Storage ルールテスト

```javascript
// テスト例
const testStorageRules = async () => {
  // 認証済みユーザーは画像をアップロードできる
  await firebase.assertSucceeds(storage.ref("posts/test.jpg").put(imageBlob));

  // 未認証ユーザーはアップロードできない
  await firebase.assertFails(storage.ref("posts/test.jpg").put(imageBlob));

  // 投稿所有者は自分の投稿画像を削除できる
  await firebase.assertSucceeds(
    storage.ref("posts/owner-post-id/image.jpg").delete()
  );

  // 他のユーザーは投稿画像を削除できない
  await firebase.assertFails(
    storage.ref("posts/other-post-id/image.jpg").delete()
  );
};
```

## ベストプラクティス

1. **最小権限の原則**: 必要最小限の権限のみ付与
2. **関数の活用**: 共通の認証ロジックは関数として定義
3. **段階的デプロイ**: 本番環境にデプロイ前にエミュレーターでテスト
4. **定期的な見直し**: セキュリティルールは定期的に見直し・更新
5. **ログ監視**: Firebase Console でアクセスログを監視
6. **一貫性の維持**: Firestore と Storage のセキュリティルールの整合性を保つ
7. **環境分離**: 開発・ステージング・本番環境を適切に分離して管理

## トラブルシューティング

### よくあるエラー

1. **権限エラー**: セキュリティルールが厳しすぎる場合
2. **インデックスエラー**: 複合クエリでインデックスが不足している場合
3. **ファイルサイズエラー**: Storage のファイルサイズ制限に引っかかった場合
4. **管理者権限エラー**: `users` ドキュメントの `admin` フィールドが正しく設定されていない場合
5. **投稿画像アクセスエラー**: 非公開投稿の画像にアクセスしようとした場合
6. **プロジェクトエイリアスエラー**: 間違ったプロジェクトにデプロイしようとした場合

### デバッグ方法

1. Firebase Console でリアルタイムログを確認
2. エミュレーターでローカルテスト
3. セキュリティルールの構文チェック

```bash
firebase firestore:rules:check firestore.rules
firebase storage:rules:check storage.rules
```

4. プロジェクトの確認

```bash
# 現在のプロジェクトを確認
firebase use

# 利用可能なプロジェクトエイリアスを確認
firebase projects:list
```

## 参考リンク

- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage セキュリティルール](https://firebase.google.com/docs/storage/security/get-started)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Firebase プロジェクト管理](https://firebase.google.com/docs/cli#project_aliases)
