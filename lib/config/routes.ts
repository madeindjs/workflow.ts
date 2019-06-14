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
           .post(this.productsController.create)
    }
}
