// lib/controllers/build.controller.ts
import { Request, Response } from "express";
import { Link } from "../models/link.model";
import { Node } from "../models/node.model";

export class GraphController {
  public mermaid(_req: Request, res: Response) {
    // we'll englobe all logic into a big promise
    const getMermaid = new Promise<string>((resolve, reject) => {
      let graphDefinition = "graph TD;\r\n";

      Node.findAll({})
        // get all nodes and build mermaid definitions like this `1[The first node]`
        .then((nodes: Array<Node>) => {
          nodes.forEach((node: Node) => {
            graphDefinition += `${node.id}[${node.name}];\r\n`;
          });
        })
        // get all links
        .then(() => Link.findAll())
        // build all link in mermaid
        .then((links: Array<Link>) => {
          links.forEach((link: Link) => {
            graphDefinition += `${link.fromId} --> ${link.toId};\r\n`;
          });

          resolve(graphDefinition);
        })
        .catch((err: Error) => reject(err));
    });

    // call promise and return plain text
    getMermaid
      .then((graph: string) => res.send(graph))
      .catch((err: Error) => res.status(500).json(err));
  }
}
