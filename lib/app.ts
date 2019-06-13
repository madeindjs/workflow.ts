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
        // this.mongoSetup();
    }

    private config(): void{
        // support application/json type post data
        this.app.use(bodyParser.json());

        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    // private mongoSetup(): void{
    //     mongoose.Promise = global.Promise;
    //     if (!process.env.DATABASE_URL) {
    //         throw new Error("You should specify DATABASE_URL env");
    //     }
    //     mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});
    // }

}

export default new App().app;