## アーキテクチャ概要

ブラウザ上の素の HTML/JavaScript 画面から、Node.js（Express + Prisma）の REST API（:3000）を経由して MySQL にタスクを保存する学習用 TODO アプリです。

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

詳細（System Context / Container / Component 図、データフロー、ディレクトリ構成）は [docs/architecture.md](docs/architecture.md) を参照してください。

---

### Nodejs（サーバサイドjavascript）とは
https://qiita.com/non_cal/items/a8fee0b7ad96e67713eb

### CORSとは
https://yamory.io/blog/about-cors/

### DB接続
https://zenn.dev/joo_hashi/articles/98b32113221785

### module化
https://note.affi-sapo-sv.com/nodejs-use-import.php#title3

### cache 導入
- [参考docs](https://pisuke-code.com/node-js-best-memory-cache-module/)
- [npm:node-cache](https://www.npmjs.com/package/node-cache)

### Prsima
- [参考docs](https://www.wadeen.net/posts/ilut7394iwx)
- [MySQLのURL](https://www.prisma.io/docs/orm/overview/databases/mysql)
- [Create User template](https://zenn.dev/tatsuyasusukida/articles/why-prisma-migrate-dev-fails-in-myql)
- [shadow-databaseエラー対応](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database#shadow-database-user-permissions)
    ```
    Prisma Migrate could not create the shadow database. Please make sure the database user has permission to create databases.
    ```