# アーキテクチャ（C4モデル）

本書はリポジトリ内のコード（2023-12 時点のコミット）を読んで作成したものです。コードから確認できない事項は「**未確認**」と明記しています。

## 1. 概要

### 目的

ブラウザから操作する学習用の **TODO（タスク管理）アプリケーション**です。タスクの作成・状態変更（優先／完了）・論理削除を行い、削除したタスクは「ゴミ箱」画面から復元または完全削除（物理削除）できます。README は Node.js・CORS・DB接続・キャッシュ・Prisma の参考リンク集になっており、Web アプリ構成の学習を目的としたリポジトリと考えられます。

### 主な利用者

| 利用者 | 説明 |
| --- | --- |
| 利用者（タスク管理者） | ブラウザで `todo.html` / `dustBox.html` を開いてタスクを管理する個人。認証・ユーザー区別の仕組みは無く、単一ユーザー想定。 |
| 開発者 | ローカルで API サーバー（`npm run dev`）と MySQL を起動し、Prisma Migrate でスキーマを管理する。 |

### 技術スタック

| 区分 | 技術 | 根拠 |
| --- | --- | --- |
| フロントエンド | 素の HTML / CSS / JavaScript（フレームワーク・ビルド無し）、`fetch` API | `todo.html`, `dustBox.html`, `todo.js`, `dustBox.js`, `style.css` |
| API サーバー | Node.js（ES Modules）, Express 4, cors, body-parser | `server/package.json`, `server/index.js` |
| ORM / マイグレーション | Prisma 5（`@prisma/client`, `prisma`） | `server/prisma/schema.prisma`, `server/prisma/migrations/` |
| キャッシュ | node-cache（プロセス内メモリ、TTL 1秒） | `server/todo.js` |
| データベース | MySQL（バージョンは未確認） | `schema.prisma` の `provider = "mysql"`, `createuser.sql` |
| 設定 | dotenv / `.env`（`DATABASE_URL`） | `server/.env.sample` |
| 開発ツール | nodemon | `server/package.json` の `dev` スクリプト |
| 未使用の依存 | `mysql`, `mysql2`, `dotenv`（コード中で import されていない。Prisma CLI が `.env` を自動で読むため dotenv は実質不要） | `server/*.js` の import 文 |

### 確認できなかった事項（未確認）

- **フロントエンドの配信方法**：静的ファイルを配信する Web サーバーの設定は無い。ファイルを直接ブラウザで開くか、VS Code の Live Server 等で配信していると推測されるが未確認。
- **本番環境・デプロイ先**：Dockerfile、IaC、CI 設定（`.github/workflows` 等）は存在しない。ローカル実行のみと考えられる。
- **MySQL の稼働場所・バージョン**：`createuser.sql` から `localhost` 上の MySQL（DB 名 `prisma_db`）と推測されるが、`DATABASE_URL` の実値は `.env`（Git 管理外）のため未確認。
- **認証・認可**：仕組みは存在しない（コード上で確認）。
- **外部 SaaS / 外部 API**：利用していない（コード上で確認）。

---

## 2. Level 1: System Context 図

```mermaid
C4Context
    title System Context 図 - TODO-TASKDATA

    Person(user, "利用者", "ブラウザでタスクを作成・更新・削除する個人（認証なし）")
    Person(dev, "開発者", "ローカルでサーバー起動・マイグレーションを行う")

    System(todo, "TODO アプリケーション", "タスクの作成・状態変更・論理削除、ゴミ箱からの復元・完全削除を提供する")

    System_Ext(mysql, "MySQL", "タスクデータを永続化する RDBMS（ローカル稼働を想定）")

    Rel(user, todo, "タスクを操作する", "Web ブラウザ")
    Rel(dev, todo, "起動・開発する", "npm run dev")
    Rel(dev, mysql, "DB・ユーザー作成 / マイグレーション", "createuser.sql, prisma migrate")
    Rel(todo, mysql, "タスクを読み書きする", "Prisma / MySQL プロトコル")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

| 名前 | 種別 | 技術 | 責務 |
| --- | --- | --- | --- |
| 利用者 | Person | Web ブラウザ | タスクの作成・優先/完了の切替・削除、ゴミ箱での復元・完全削除 |
| 開発者 | Person | Node.js / npm / Prisma CLI | API サーバーの起動、DB ユーザー作成、スキーマのマイグレーション |
| TODO アプリケーション | Software System | HTML/JS + Node.js/Express | 本システム。画面と REST API でタスク管理機能を提供 |
| MySQL | External System（インフラ） | MySQL | `Todo` テーブルにタスクを永続化。外部 SaaS ではなくローカルに用意する DB サーバー |

> 外部 SaaS・外部 API・認証基盤との連携はありません。

---

## 3. Level 2: Container 図

```mermaid
C4Container
    title Container 図 - TODO-TASKDATA

    Person(user, "利用者", "Web ブラウザ")

    System_Boundary(sys, "TODO アプリケーション") {
        Container(web, "Web フロントエンド", "HTML / CSS / Vanilla JS", "todo.html（タスク一覧）と dustBox.html（ゴミ箱）。fetch で API を呼び出し DOM を描画する")
        Container(api, "API サーバー", "Node.js / Express 4 / Prisma Client", "REST API（:3000）。CORS 全許可。タスクの CRUD と論理削除・復元")
        Container(cache, "インメモリキャッシュ", "node-cache", "GET /todos の結果を TTL 1秒で保持（API プロセス内）")
    }

    ContainerDb(db, "データベース", "MySQL / prisma_db", "Todo テーブル（id, title, status, deleteFlg, createdAt, updatedAt）")

    Rel(user, web, "閲覧・操作", "ブラウザ")
    Rel(web, api, "API 呼び出し", "HTTP/JSON, http://localhost:3000")
    Rel(api, cache, "一覧を取得/保存")
    Rel(api, db, "読み書き", "Prisma（DATABASE_URL）")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

| 名前 | 種別 | 技術 | 責務 |
| --- | --- | --- | --- |
| Web フロントエンド | Container（ブラウザ内実行） | HTML / CSS / Vanilla JS | `todo.html`+`todo.js`：一覧表示・作成（上限7件、空欄不可）・優先/完了/削除。`dustBox.html`+`dustBox.js`：削除済み一覧・復元・完全削除。更新後は `location.reload()` で再描画。配信方法は未確認 |
| API サーバー | Container | Node.js (ESM), Express 4, cors, body-parser, Prisma Client | ポート 3000 固定で REST API を提供。ルーターは `todo.js`（一覧・作成・更新）と `dustBox.js`（ゴミ箱系）の2つ |
| インメモリキャッシュ | Container（API プロセス内コンポーネント） | node-cache | `todos` キーで未削除タスク一覧をキャッシュ。TTL は 1 秒（コメントアウトされた 24 時間設定あり）。更新時の明示的な無効化は無い |
| データベース | Container（DB） | MySQL | `Todo` テーブル。`status` は `IN_PROGRESS / PRIORITY / DONE`、`deleteFlg` は `"0"`=有効 / `"1"`=ゴミ箱 |

---

## 4. Level 3: Component 図

### 4.1 API サーバー（`server/`）

```mermaid
C4Component
    title Component 図 - API サーバー（server/）

    Container(web, "Web フロントエンド", "Vanilla JS", "fetch で API を呼ぶ")
    ContainerDb(db, "データベース", "MySQL", "Todo テーブル")

    Container_Boundary(api, "API サーバー（Express, :3000）") {
        Component(index, "index.js", "Express アプリ", "cors()・bodyParser を適用し、2つのルーターを登録して listen(3000)")
        Component(todoRouter, "todo.js ルーター", "express.Router", "GET /todos, POST /todo, PUT /todo/:taskId")
        Component(dustRouter, "dustBox.js ルーター", "express.Router", "GET /remove-todos, PUT /todo/recover/:taskId, DELETE /todo/delete/:taskId")
        Component(cache, "NodeCache", "node-cache", "GET /todos の結果を TTL 1秒で保持")
        Component(prisma, "PrismaClient", "@prisma/client", "各ルーターで個別に生成。Todo モデルの findMany/create/update/delete")
        Component(schema, "schema.prisma / migrations", "Prisma Schema", "Todo モデル・Status enum の定義と MySQL への DDL")
    }

    Rel(web, index, "HTTP/JSON")
    Rel(index, todoRouter, "app.use")
    Rel(index, dustRouter, "app.use")
    Rel(todoRouter, cache, "get / set")
    Rel(todoRouter, prisma, "クエリ")
    Rel(dustRouter, prisma, "クエリ")
    Rel(prisma, db, "SQL", "DATABASE_URL")
    Rel(schema, db, "prisma migrate")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

| 名前 | 種別 | 技術 | 責務 |
| --- | --- | --- | --- |
| `index.js` | Component（エントリポイント） | Express | アプリ生成、`cors()`（全オリジン許可）、JSON / URL エンコードのボディ解析、ルーター登録、ポート 3000 で起動 |
| `todo.js` ルーター | Component | express.Router | `GET /todos`：`deleteFlg="0"` を取得（キャッシュ優先）／`POST /todo`：`title` で新規作成／`PUT /todo/:taskId`：`status` を大文字化し `REMOVE` なら `deleteFlg="1"`、それ以外は `status` を更新 |
| `dustBox.js` ルーター | Component | express.Router | `GET /remove-todos`：`deleteFlg="1"` を取得／`PUT /todo/recover/:taskId`：`deleteFlg="0"` に戻す／`DELETE /todo/delete/:taskId`：物理削除 |
| NodeCache | Component | node-cache | `todos` キーで一覧を TTL 1 秒保持。`todo.js` 内でのみ使用 |
| PrismaClient | Component | @prisma/client | ルーターごとに `new PrismaClient()` しており、インスタンスは2つ |
| `schema.prisma` / migrations | Component（定義） | Prisma Schema / SQL | `Todo` モデル、`Status` enum。マイグレーション2件（テーブル作成、`updatedAt` のデフォルト値追加） |

#### API 一覧

| メソッド | パス | ルーター | 処理 | 利用画面 |
| --- | --- | --- | --- | --- |
| GET | `/todos` | todo.js | 未削除タスク一覧（キャッシュ TTL 1秒） | todo.html |
| POST | `/todo` | todo.js | タスク作成（body: `title`） | todo.html |
| PUT | `/todo/:taskId` | todo.js | 状態更新（body: `status` = done / priority / remove） | todo.html |
| GET | `/remove-todos` | dustBox.js | 削除済み（ゴミ箱）一覧 | dustBox.html |
| PUT | `/todo/recover/:taskId` | dustBox.js | 復元（`deleteFlg="0"`） | dustBox.html |
| DELETE | `/todo/delete/:taskId` | dustBox.js | 物理削除 | dustBox.html |

> 補足：API はエラー時も HTTP ステータスは 200 のまま、ボディ `{ "status": 500, "mesasge": ... }` で結果を返します（キー名は綴りのまま `mesasge`）。フロントエンドの作成処理はボディの `status`、更新・復元・削除処理は HTTP ステータスで成否を判定しています。

### 4.2 Web フロントエンド（ルート直下）

```mermaid
C4Component
    title Component 図 - Web フロントエンド

    Person(user, "利用者", "ブラウザ")
    Container(api, "API サーバー", "Express :3000", "REST API")

    Container_Boundary(web, "Web フロントエンド（静的ファイル）") {
        Component(todoPage, "todo.html + todo.js", "HTML / Vanilla JS", "タスク一覧の描画、作成（上限7件・空欄チェック）、優先/完了/削除ボタン")
        Component(dustPage, "dustBox.html + dustBox.js", "HTML / Vanilla JS", "削除済みタスクの描画、復元、確認ダイアログ付き完全削除")
        Component(css, "style.css", "CSS", "priority / done などの状態別スタイル")
    }

    Rel(user, todoPage, "操作")
    Rel(user, dustPage, "操作")
    Rel(todoPage, dustPage, "リンク遷移")
    Rel(todoPage, api, "GET /todos, POST /todo, PUT /todo/:id", "fetch")
    Rel(dustPage, api, "GET /remove-todos, PUT /todo/recover/:id, DELETE /todo/delete/:id", "fetch")
    Rel(todoPage, css, "参照")
    Rel(dustPage, css, "参照")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

| 名前 | 種別 | 技術 | 責務 |
| --- | --- | --- | --- |
| `todo.html` + `todo.js` | Component（画面） | HTML / Vanilla JS | 初期表示で一覧取得し `<tr>` を生成。ボタンのクラス名（`btn-done-{id}` 等）から操作種別とタスク ID を判定して API を呼ぶ |
| `dustBox.html` + `dustBox.js` | Component（画面） | HTML / Vanilla JS | ゴミ箱一覧の描画、復元・完全削除（`confirm` で確認） |
| `style.css` | Component（スタイル） | CSS | 両画面共通のスタイル |
| `text_job_old*.js` | 旧版コード（未参照） | Vanilla JS | HTML から読み込まれていない過去バージョン。DB 連携前の DOM 操作のみ版〜API 連携初期版 |

---

## 5. 主要なデータフロー

### 5.1 タスク一覧の表示（キャッシュあり）

```mermaid
sequenceDiagram
    autonumber
    actor U as 利用者
    participant B as todo.html / todo.js
    participant A as API サーバー（todo.js ルーター）
    participant C as NodeCache
    participant D as MySQL

    U->>B: todo.html を開く
    B->>A: GET /todos
    A->>C: get("todos")
    alt キャッシュヒット（1秒以内）
        C-->>A: タスク一覧
    else キャッシュミス
        A->>D: findMany(deleteFlg = "0")
        D-->>A: タスク一覧
        A->>C: set("todos", 一覧, TTL=1s)
    end
    A-->>B: JSON 配列
    B->>B: <tr> を生成して描画（status に応じてクラス付与）
```

### 5.2 タスクの作成・状態変更・論理削除

```mermaid
sequenceDiagram
    autonumber
    actor U as 利用者
    participant B as todo.js
    participant A as API サーバー
    participant D as MySQL

    U->>B: タスク名を入力して「作成」
    B->>B: 空欄チェック・件数上限（7件）チェック
    B->>A: POST /todo {title}
    A->>D: create(title)
    A-->>B: {status: 200}
    B->>B: location.reload()

    U->>B: 「優先」/「完了」/「削除」
    B->>A: PUT /todo/:id {status: priority | done | remove}
    alt status = REMOVE
        A->>D: update(deleteFlg = "1")
    else
        A->>D: update(status = PRIORITY | DONE)
    end
    A-->>B: HTTP 200
    B->>B: location.reload()
```

### 5.3 ゴミ箱からの復元・完全削除

```mermaid
sequenceDiagram
    autonumber
    actor U as 利用者
    participant B as dustBox.js
    participant A as API サーバー（dustBox.js ルーター）
    participant D as MySQL

    U->>B: dustBox.html を開く
    B->>A: GET /remove-todos
    A->>D: findMany(deleteFlg = "1")
    A-->>B: JSON 配列
    alt 「復元」
        U->>B: 復元
        B->>A: PUT /todo/recover/:id
        A->>D: update(deleteFlg = "0")
    else 「完全削除」
        U->>B: 完全削除（confirm で確認）
        B->>A: DELETE /todo/delete/:id
        A->>D: delete(id)
    end
    A-->>B: HTTP 200
    B->>B: location.reload()
```

---

## 6. ディレクトリ構成

```text
TODO-TASKDATA/
├── README.md              # 参考リンク集（Node.js / CORS / DB接続 / cache / Prisma）
├── docs/
│   └── architecture.md    # 本書（C4 アーキテクチャ図）
├── todo.html              # 画面: タスク作成・一覧
├── todo.js                # todo.html のスクリプト（API 呼び出し・DOM 描画）
├── dustBox.html           # 画面: ゴミ箱（削除済みタスク）
├── dustBox.js             # dustBox.html のスクリプト（復元・完全削除）
├── style.css              # 両画面共通スタイル
├── text_job_old.js        # 旧版スクリプト（DOM 操作のみ。未使用）
├── text_job_oldv2.js      # 旧版スクリプト（件数上限等の追加。未使用）
├── text_job_oldv3.js      # 旧版スクリプト（API 連携初期版。未使用）
├── todo.sql               # Prisma 導入前の手書き DDL（snake_case。現行スキーマとは不一致）
├── createuser.sql         # MySQL の DB(prisma_db)・ユーザー作成 SQL
├── CORS.png               # CORS 説明用画像（学習メモ）
├── package-lock.json      # ルート用（依存なし・実質空）
├── .vscode/settings.json  # VS Code 設定
└── server/                # API サーバー（Node.js / Express）
    ├── index.js           # エントリポイント（ミドルウェア・ルーター登録、:3000）
    ├── todo.js            # ルーター: 一覧・作成・状態更新（node-cache 利用）
    ├── dustBox.js         # ルーター: ゴミ箱一覧・復元・物理削除
    ├── package.json       # 依存定義・dev スクリプト（nodemon）
    ├── package-lock.json
    ├── .env.sample        # DATABASE_URL のテンプレート
    ├── .gitignore         # Node.js 標準（.env, node_modules 等を除外）
    └── prisma/
        ├── schema.prisma  # Todo モデル / Status enum 定義（MySQL）
        └── migrations/    # Prisma Migrate の履歴（2件）
```

| ディレクトリ / ファイル群 | 役割 |
| --- | --- |
| ルート直下（`*.html`, `todo.js`, `dustBox.js`, `style.css`） | Web フロントエンド（ビルド不要の静的ファイル） |
| ルート直下（`text_job_old*.js`） | 過去バージョンのスクリプト。どの HTML からも参照されていない |
| ルート直下（`*.sql`） | DB 初期設定用の SQL。`todo.sql` は Prisma 導入前の旧スキーマ |
| `server/` | API サーバー（実行単位）。`npm run dev` で起動 |
| `server/prisma/` | ORM のスキーマ定義とマイグレーション履歴 |
| `docs/` | 設計ドキュメント |
| `.vscode/` | エディタ設定 |

## 7. ローカルでの起動手順（コードから読み取れる範囲）

1. MySQL を用意し `createuser.sql` を実行（DB `prisma_db`、ユーザー `prisma_user`）。
2. `server/.env.sample` を `server/.env` にコピーし `DATABASE_URL`（例: `mysql://prisma_user:...@localhost:3306/prisma_db`）を設定。※接続文字列の実値は未確認。
3. `cd server && npm install && npx prisma migrate dev`
4. `npm run dev`（nodemon で `index.js` を起動、ポート 3000）。
5. ブラウザで `todo.html` を開く（配信方法は未確認。`todo.js` 内に「AP・DBサーバー起動←ここから！！！！」というコメントがあり、画面からのサーバー起動は未実装）。
