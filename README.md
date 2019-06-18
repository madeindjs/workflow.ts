# Workflow.ts

The goal is build a workflow [RESTfull][rest] [API][api] using [TypeScript][typescript] and [Express.js][express].

The workflow implementation is really simple. We'll create two model:

- a **node**, is a simple step who contains a `name` and an `id`
- a **link** which only connect two node with `from_id` and `to_id`

I simple like that. At the end we'll be able to draw a Workflow like bellow:

```
+-------+              +-------+    +-------+
|Planif |       +------+Test   |    |Publish|
|-------|       |      |-------|+-->|-------|
|id: 1  |       v      |id: 3  |    |id: 4  |
+--+----+  +-------+   +-------+    +-------+
   |       |Code   |       ^
   +------>|-------|       |
           |id: 2  +-------+
           +-------+
```

## Setup project

Let's create a brand new project using [NPM](https://www.npmjs.com/) and [Git versionning](https://git-scm.com/).

```bash
$ mkdir workflow.ts
$ cd workflow.ts/
$ npm init
$ git init
```

Then we start to install somes dependencies to build the HTTP server:

```bash
$ npm install --save express body-parser
$ npm install --save-dev typescript ts-node @types/express @types/node
```

As we use [TypeScript][typescript] we need to create a `tsconfig.json` to indicate how transcript TypeScript files from `lib` to `dist` folder. Also we transpile to [ES6][es6] version:

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "pretty": true,
    "sourceMap": true,
    "target": "es6",
    "outDir": "./dist",
    "baseUrl": "./lib"
  },
  "include": ["lib/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Nos we we'll create the the `lib/app.ts`. This will be in charge to configure, load routes and start Express server:

```typescript
// lib/app.ts
import * as express from "express";
import * as bodyParser from "body-parser";
import { Routes } from "./config/routes";

class App {
  public app: express.Application;
  public routePrv: Routes = new Routes();

  constructor() {
    this.app = express();
    this.config();
    this.routePrv.routes(this.app);
  }

  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }
}

export default new App().app;
```

As you may notice, we load routes to defines controllers and routes to respect MVC patern:

```typescript
// lib/controllers/nodes.controller.ts
import { Request, Response } from "express";

export class NodesController {
  public index(req: Request, res: Response) {
    res.json({
      message: "Hello boi"
    });
  }
}
```

```typescript
// lib/config/routes.ts
import { Request, Response } from "express";
import { NodesController } from "../controllers/nodes.controller";

export class Routes {
  public nodesController: NodesController = new NodesController();

  public routes(app): void {
    app.route("/").get(this.nodesController.index);

    app.route("/nodes").get(this.nodesController.index);
  }
}
```

And a `lib/server.ts` file to start `App` object:

```ts
// lib/server.ts
import app from "./app";
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
```

And that's it. You can start server using `npm run dev` and try API using cURL:

```bash
$ curl http://localhost:3000/nodes
{"message":"Hello boi"}
```

## Setup sequelize

Sequelize is an [ORM (Object Relational Mapping)][orm] wich is in charge to translate TypeScript object in SQL queries to save models. The [sequelize documentation about TypeScrypt](http://docs.sequelizejs.com/manual/typescript) is really complete but don't panick I'll show you how to implement with Express.

We start to add librairies:

```bash
$ npm install --save sequelize sqlite
$ npm install --save-dev @types/bluebird @types/validator @types/sequelize
```

> You may notice I choose SQLite database because of simplicity but you can use MySQL or Postgres

Then we will create a _lib/config/database.ts_ file to setup Sequelize databse system. For simplicity, I create a Sqlite database in memory:

```ts
// lib/config/database.ts
import { Sequelize } from "sequelize";

export const database = new Sequelize({
  database: "some_db",
  dialect: "sqlite",
  storage: ":memory:"
});
```

Then we'll be able to create a **model**. We'll begin with **Node** model who extends Seqelize `Model` class:

```ts
// lib/models/node.model.ts
import { Sequelize, Model, DataTypes, BuildOptions } from "sequelize";
import { database } from "../config/database";

export class Node extends Model {
  public id!: number; // Note that the `null assertion` `!` is required in strict mode.
  public name!: string;
  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
// ...
```

Then we setup the table SQL schema and call `Node.sync`. This will create table in Sqlite database.

```ts
// lib/models/node.model.ts
// ...
Node.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false
    }
  },
  {
    tableName: "nodes",
    sequelize: database // this bit is important
  }
);

Node.sync({ force: true }).then(() => console.log("Node table created"));
```

That's it!

## Setup Node controller

Now we setup database, let's create simple CRUD methods in controller. This means:

- `index` to show list of nodes
- `show` to show a node
- `create` to add a new node
- `update` to edit a node
- `delete` to remove a node

### Index

```ts
// lib/controllers/nodes.controller.ts
import { Request, Response } from "express";
import { Node } from "../models/node.model";

export class NodesController {
  public index(req: Request, res: Response) {
    Node.findAll<Node>({})
      .then((nodes: Array<Node>) => res.json(nodes))
      .catch((err: Error) => res.status(500).json(err));
  }
}
```

And setup route:

```ts
// lib/config/routes.ts
import { Request, Response } from "express";
import { NodesController } from "../controllers/nodes.controller";

export class Routes {
  public nodesController: NodesController = new NodesController();

  public routes(app): void {
    // ...
    app.route("/nodes").get(this.nodesController.index);
  }
}
```

You can try the route using cURL:

```bash
$ curl http://localhost:3000/nodes/
[]
```

It's seem to work but we have not data in SQlite database yet. Let's continue to add them.

### Create

We'll first define an **interface** wich define properties we should receive from POST query. We only want to receive `name` property as `String`. We'll use this interface to cast `req.body` object properties. This will prevent user to inject a parameters who we not want to save in database. This is a good practice.

```ts
// lib/models/node.model.ts
// ...
export interface NodeInterface {
  name: string;
}
```

Now back in controller. We simply call `Node.create` and pass params from `req.body`. Then we'll use **Promise** to handle some errors:

```ts
// lib/controllers/nodes.controller.ts
// ...
import { Node, NodeInterface } from "../models/node.model";

export class NodesController {
  // ...
  public create(req: Request, res: Response) {
    const params: NodeInterface = req.body;

    Node.create<Node>(params)
      .then((node: Node) => res.status(201).json(node))
      .catch((err: Error) => res.status(500).json(err));
  }
}
```

And setup route:

```ts
// lib/config/routes.ts
// ...
export class Routes {
  // ...
  public routes(app): void {
    // ...
    app
      .route("/nodes")
      .get(this.nodesController.index)
      .post(this.nodesController.create);
  }
}
```

You can try the route using cURL:

```bash
$ curl -X POST --data "name=first" http://localhost:3000/nodes/
{"id":2,"name":"first","updatedAt":"2019-06-14T11:12:17.606Z","createdAt":"2019-06-14T11:12:17.606Z"}
```

It's seem work. Let's try with a bad request:

```bash
$ curl -X POST http://localhost:3000/nodes/
{"name":"SequelizeValidationError","errors":[{"message":"Node.name cannot be null","type":"notNull Violation",...]}
```

Perfect. We can now continue.

### Show

The show method have a little difference because we need an `id` as GET parameter. This means we should have an URL like this: `/nodes/1`. It's simple to make this when you build the route. There the implementation.

```ts
// lib/config/routes.ts
// ...
export class Routes {
  // ...
  public routes(app): void {
    // ...
    app.route("/nodes/:id").get(this.nodesController.show);
  }
}
```

Now we can get the `id` parameter using `req.params.id`. THen we simply use `Node.findByPk` method and handle when this Promise get a `null` value which mean the node was not found. In this case, we return a 404 response:

```ts
// lib/controllers/nodes.controller.ts
// ...
export class NodesController {
  // ...
  public show(req: Request, res: Response) {
    const nodeId: number = req.params.id;

    Node.findByPk<Node>(nodeId)
      .then((node: Node | null) => {
        if (node) {
          res.json(node);
        } else {
          res.status(404).json({ errors: ["Node not found"] });
        }
      })
      .catch((err: Error) => res.status(500).json(err));
  }
}
```

Now it should be alright. Let's try it:

```bash
$ curl -X POST http://localhost:3000/nodes/1
{"id":1,"name":"first","createdAt":"2019-06-14T11:32:47.731Z","updatedAt":"2019-06-14T11:32:47.731Z"}
$ curl -X POST http://localhost:3000/nodes/99
{"errors":["Node not found"]}
```

### Update

Update method seams like the previous one and need an `id` parameter. Let's build route:

```ts
// lib/config/routes.ts
// ...
export class Routes {
  // ...
  public routes(app): void {
    // ...
    app
      .route("/nodes/:id")
      .get(this.nodesController.show)
      .put(this.nodesController.update);
  }
}
```

Now we'll use the `Node.update` method wich take two parameters:

- an `NodeInterface` interface which contains properties to update
- an `UpdateOptions` interface which conatins the SQL `WHERE` constraint

Then `Node.update` return a `Promise` like many Sequelize methods.

```ts
// lib/controllers/nodes.controller.ts
import { UpdateOptions } from "sequelize";
// ...
export class NodesController {
  // ...
  public update(req: Request, res: Response) {
    const nodeId: number = req.params.id;
    const params: NodeInterface = req.body;

    const update: UpdateOptions = {
      where: { id: nodeId },
      limit: 1
    };

    Node.update(params, update)
      .then(() => res.status(202).json({ data: "success" }))
      .catch((err: Error) => res.status(500).json(err));
  }
}
```

Get it? Let's try it:

```bash
$ curl -X PUT --data "name=updated" http://localhost:3000/nodes/1
{"data":"success"}}
```

Beautiful. Let's continue.

### Destroy

Destroy method seams like the previous one and need an `id` parameter. Let's build route:

```ts
// lib/config/routes.ts
// ...
export class Routes {
  // ...
  public routes(app): void {
    // ...
    app
      .route("/nodes/:id")
      .get(this.nodesController.show)
      .put(this.nodesController.update)
      .delete(this.nodesController.delete);
  }
}
```

For `destroy` method we call `Node.destroy` we take a `DestroyOptions` interface like `Node.update`.

```ts
// lib/controllers/nodes.controller.ts
// ...
import { UpdateOptions, DestroyOptions } from "sequelize";

export class NodesController {
  // ...
  public delete(req: Request, res: Response) {
    const nodeId: number = req.params.id;
    const options: DestroyOptions = {
      where: { id: nodeId },
      limit: 1
    };

    Node.destroy(options)
      .then(() => res.status(204).json({ data: "success" }))
      .catch((err: Error) => res.status(500).json(err));
  }
}
```

Let's try it:

```bash
$ curl -X DELETE  http://localhost:3000/nodes/1
```

Perfect!

## Create the Link relationship

Now we want to create the second model: the `link`. The link have two attributes:

- `from_id`
- `to_id`

### Setup CRUD

I will be quick on basic CRUD link implementation because this is the same than nodes CRUD:

The model:

```ts
// lib/models/node.model.ts
import { Model, DataTypes } from "sequelize";
import { database } from "../config/database";
import { Node } from "./node.model";

export class Link extends Model {
  public id!: number;
  public fromId!: number;
  public toId!: number;
  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface LinkInterface {
  name: string;
  fromId: number;
  toId: number;
}

Link.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    fromId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    toId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  },
  {
    tableName: "links",
    sequelize: database
  }
);

Link.sync({ force: true }).then(() => console.log("Link table created"));
```

Controller:

```ts
// lib/controllers/links.controller.ts
import { Request, Response } from "express";
import { Link, LinkInterface } from "../models/link.model";
import { UpdateOptions, DestroyOptions } from "sequelize";

export class LinksController {
  public index(_req: Request, res: Response) {
    Link.findAll<Link>({})
      .then((links: Array<Link>) => res.json(links))
      .catch((err: Error) => res.status(500).json(err));
  }

  public create(req: Request, res: Response) {
    const params: LinkInterface = req.body;

    Link.create<Link>(params)
      .then((link: Link) => res.status(201).json(link))
      .catch((err: Error) => res.status(500).json(err));
  }

  public show(req: Request, res: Response) {
    const linkId: number = req.params.id;

    Link.findByPk<Link>(linkId)
      .then((link: Link | null) => {
        if (link) {
          res.json(link);
        } else {
          res.status(404).json({ errors: ["Link not found"] });
        }
      })
      .catch((err: Error) => res.status(500).json(err));
  }

  public update(req: Request, res: Response) {
    const linkId: number = req.params.id;
    const params: LinkInterface = req.body;

    const options: UpdateOptions = {
      where: { id: linkId },
      limit: 1
    };

    Link.update(params, options)
      .then(() => res.status(202).json({ data: "success" }))
      .catch((err: Error) => res.status(500).json(err));
  }

  public delete(req: Request, res: Response) {
    const linkId: number = req.params.id;
    const options: DestroyOptions = {
      where: { id: linkId },
      limit: 1
    };

    Link.destroy(options)
      .then(() => res.status(204).json({ data: "success" }))
      .catch((err: Error) => res.status(500).json(err));
  }
}
```

And routes:

```ts
// lib/config/routes.ts
import { Request, Response } from "express";
import { NodesController } from "../controllers/nodes.controller";
import { LinksController } from "../controllers/links.controller";

export class Routes {
  public nodesController: NodesController = new NodesController();
  public linksController: LinksController = new LinksController();

  public routes(app): void {
    // ...
    app
      .route("/links")
      .get(this.linksController.index)
      .post(this.linksController.create);

    app
      .route("/links/:id")
      .get(this.linksController.show)
      .put(this.linksController.update)
      .delete(this.linksController.delete);
  }
}
```

Now everything should work like node endpoints:

```bash
$ curl -X POST --data "fromId=420" --data "toId=666"  http://localhost:3000/links
$ curl http://localhost:3000/links
[{"id":1,"fromId":420,"toId":666,"createdAt":"2019-06-18T11:09:49.739Z","updatedAt":"2019-06-18T11:09:49.739Z"}]
```

It's seem good but you see what going wrong? Actually we setup `toId` and `fromId` to nonexisting nodes. Let's correct that.

### Relationships

With sequelize we can easily build relationships between model using `belongTo` & `hasMany`. Let's do that:

```ts
// lib/models/node.model.ts
import { Link } from "./link.model";
// ...

Node.hasMany(Link, {
  sourceKey: "id",
  foreignKey: "fromId",
  as: "previousLinks"
});

Node.hasMany(Link, {
  sourceKey: "id",
  foreignKey: "toId",
  as: "nextLinks"
});

Node.sync({ force: true }).then(() => console.log("Node table created"));
```

Then restart the server using `npm run dev`. You may see the SQL query who create base:

```sql
Executing (default): CREATE TABLE IF NOT EXISTS `links` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `fromId` INTEGER NOT NULL REFERENCES `nodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `toId` INTEGER NOT NULL REFERENCES `nodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
```

You see the difference? Sequelize create _foreign keys_ between nodes and links. Now we can't create a link with broken relationship:

```bash
$ curl -X POST --data "fromId=420" --data "toId=666"  http://localhost:3000/links
{"name":"SequelizeForeignKeyConstraintError"
```

Let's retry to create link with valid nodes:

```bash
$ curl -X POST --data "name=first"  http://localhost:3000/nodes
{"id":1,"name":"first","updatedAt":"2019-06-18T11:21:38.264Z","createdAt":"2019-06-18T11:21:38.264Z"}
$ curl -X POST --data "name=second"  http://localhost:3000/nodes
{"id":2,"name":"second","updatedAt":"2019-06-18T11:21:47.327Z","createdAt":"2019-06-18T11:21:47.327Z"}
$ curl -X POST --data "fromId=1" --data "toId=2"  http://localhost:3000/links
{"id":1,"fromId":"1","toId":"2","updatedAt":"2019-06-18T11:22:10.439Z","createdAt":"2019-06-18T11:22:10.439Z"}
```

Perfect!

## Draw the graph

```bash
$ curl -X POST --data "name=first"  http://localhost:3000/nodes &&
  curl -X POST --data "name=second"  http://localhost:3000/nodes &&
  curl -X POST --data "name=third"  http://localhost:3000/nodes &&
  curl -X POST --data "fromId=1" --data "toId=2"  http://localhost:3000/links &&
  curl -X POST --data "fromId=2" --data "toId=3"  http://localhost:3000/links
```

[mermaid] https://github.com/knsv/mermaid
[typescript] https://www.typescriptlang.org/)
[es6] https://en.wikipedia.org/wiki/ECMAScript#6th_Edition_-_ECMAScript_2015
[orm] https://en.wikipedia.org/wiki/Object-relational_mapping
[rest] https://en.wikipedia.org/wiki/Representational_state_transfer
[api] https://en.wikipedia.org/wiki/Application_programming_interface
[express] https://expressjs.com/
