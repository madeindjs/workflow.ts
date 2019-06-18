// lib/controllers/links.controller.ts
import { Request, Response } from "express";
import { Link } from "../models/link.model";
import { Node } from "../models/node.model";

export class BuildController {
  public mermaid(_req: Request, res: Response) {
    let graphDefinition: string = "graph TD;\r\n";

    Node.findAll({})
      .then((nodes: Array<Node>) => {
        nodes.forEach((node: Node) => {
          graphDefinition += `${node.id}[${node.name}];\r\n`;
        });
      })
      .then(() => Link.findAll())
      .then((links: Array<Link>) => {
        links.forEach((link: Link) => {
          graphDefinition += `${link.fromId} --> ${link.toId};\r\n`;
        });

        res.send(graphDefinition);
      })
      .catch((err: Error) => res.status(500).json(err));
  }
}
