# 機能開発自動化フロー

以下のステップを順番に実行して、Issue作成からPR作成までを自動で行ってください。
**マージは行わないでください。人間がレビュー後にマージします。**

## 前提条件チェック

作業開始前に以下を確認：
1. `gh auth status` で GitHub CLI がログイン済みか確認
2. `git status` で作業ディレクトリがクリーンか確認（未コミットの変更がないか）
3. `git branch --show-current` で現在のブランチを確認
4. 問題があれば作業を中断してユーザーに報告

## ステップ1: Issue作成

ユーザーの指示内容を元に、GitHub Issueを作成する。

```
gh issue create --title "<簡潔なタイトル>" --body "<詳細な説明（Markdown）>"
```

Issueの本文には以下を含める：
- **概要**: 何をするか
- **背景**: なぜ必要か（推測で補完してよい）
- **完了条件**: 何ができたら完了か（チェックリスト形式）
- **技術メモ**: 影響するファイルや注意点

作成されたIssue番号を記録する。

## ステップ2: ブランチ作成

Issue番号に基づいてブランチを作成する。

```
git checkout main
git pull origin main
git checkout -b <ブランチ名>
```

ブランチ名の命名規則：
- 機能追加: `feature/<issue番号>-<短い説明>` (例: `feature/42-add-meal-search`)
- バグ修正: `fix/<issue番号>-<短い説明>` (例: `fix/43-fix-login-error`)
- リファクタリング: `refactor/<issue番号>-<短い説明>`
- ドキュメント: `docs/<issue番号>-<短い説明>`

## ステップ3: コード実装

ユーザーの指示に従いコードを実装する。

実装時のルール：
- このプロジェクトの既存のコードスタイルに従う
- Backend: TypeScript + Express（`backend/src/` 配下）
- Frontend: TypeScript + Next.js（`frontend/src/` 配下）
- 必要に応じてテストも追加・修正する
- 既存のテストが壊れないことを確認する

実装完了後：
1. `cd backend && npm run build` でバックエンドのビルド確認
2. `cd frontend && npm run build` でフロントエンドのビルド確認
3. 変更に関連するテストを実行（`npm test`）

## ステップ4: コミット & プッシュ

```
git add -A
git commit -m "<type>(#<issue番号>): <変更の要約>"
git push -u origin <ブランチ名>
```

コミットメッセージの type：
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント
- `test`: テスト追加・修正
- `chore`: その他

複数の論理的な変更がある場合は、それぞれ別のコミットに分ける。

## ステップ5: プルリクエスト作成

```
gh pr create --title "<PRタイトル>" --body "<PR本文>" --base main
```

PRの本文には以下を含める：

```markdown
## 概要
<!-- 何を変更したか -->

## 関連Issue
Closes #<issue番号>

## 変更内容
- 変更点1
- 変更点2

## テスト
- [ ] ビルドが通ること
- [ ] 既存テストが通ること
- [ ] 新規テスト追加（該当する場合）

## スクリーンショット
<!-- UI変更がある場合 -->
```

## ステップ6: 完了報告

以下の情報をユーザーに報告する：
- 作成したIssueのURL
- 作成したPRのURL
- 変更したファイルの一覧
- CIの結果を確認するようリマインド
- **「PRをレビューし、問題なければマージしてください」** と伝える
