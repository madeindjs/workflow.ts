# Workflow.ts

The goal is build a workflow application using [TypeScript](https://www.typescriptlang.org/) and [Express.js](https://expressjs.com/).

The workflow implementation is really simple. We'll create two model:

- a **node**, is a simple step who contains a `name` and an `id`
- a **link** which only connect two node with `from_id` and `to_id`

I simple like that. At the end we'll be able to draw a Workflow like bellow:

~~~
+-------+              +-------+    +-------+
|Planif |       +------+Test   |    |Publish|
|-------|       |      |-------|+-->|-------|
|id: 1  |       v      |id: 3  |    |id: 4  |
+--+----+  +-------+   +-------+    +-------+
   |       |Code   |       ^
   +------>|-------|       |
           |id: 2  +-------+
           +-------+
~~~

## Setup project

Let's create a brand new project

~~~bash
$ mkdir workflow.ts
$ cd workflow.ts/
$ npm init
$ git init
~~~

Then Install somes dependencies

~~~bash
$ npm install --save express body-parser
$ npm install --save-dev typescript ts-node @types/express @types/node
~~~

And now you need to create a `tsconfig.json` to indicate how transcript TypeScript files:

~~~json
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
    "include": [
        "lib/**/*.ts"
    ],
    "exclude": [
        "node_modules"
    ]
}
~~~

Nos we we'll create the the `lib/app.ts`

~~~typescript
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

    private config(): void{
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }
}

export default new App().app;
~~~

As you may notice, we need to defines controller and routes to respect MVC patern:

~~~typescript
// lib/controllers/nodes.controller.ts
import { Request, Response } from 'express';


export class NodesController{

    public index (req: Request, res: Response) {
        res.json({
            "message": "Hello boi"
        })
    }
}
~~~

~~~typescript
// lib/config/routes.ts
import { Request, Response } from "express";
import { NodesController } from "../controllers/nodes.controller";

export class Routes {
    public productsController: NodesController = new NodesController();

    public routes(app): void {
        app.route('/')
        .get((req: Request, res: Response) => {
            res.status(200).send({
                message: 'Welcome to Workflow.ts'
            })
        })

        app.route('/nodes')
        .get(this.productsController.index)
    }
}
~~~

And a `lib/server.ts` file to start `App` object:

~~~typescript
// lib/server.ts
import app from "./app";
const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
    console.log(`Example app listening on port ${PORT}!`),
);
~~~

And that's it. You can start server using `npm run dev` and try API using cURL:

~~~bash
$ curl http://localhost:3000/nodes
{"message":"Hello boi"}
~~~

