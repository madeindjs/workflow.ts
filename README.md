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
$ npm install --save-dev typescript ts-node @types/express
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

