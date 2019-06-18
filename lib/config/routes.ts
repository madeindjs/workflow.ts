// lib/config/routes.ts
import { NodesController } from "../controllers/nodes.controller";
import { LinksController } from "../controllers/links.controller";
import { BuildController } from "../controllers/build.controller";

export class Routes {
  public nodesController: NodesController = new NodesController();
  public linksController: LinksController = new LinksController();
  public buildController: BuildController = new BuildController();

  public routes(app): void {
    app.route("/").get(this.buildController.mermaid);

    // nodes

    app
      .route("/nodes")
      .get(this.nodesController.index)
      .post(this.nodesController.create);

    app
      .route("/nodes/:id")
      .get(this.nodesController.show)
      .put(this.nodesController.update)
      .delete(this.nodesController.delete);

    // links

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
