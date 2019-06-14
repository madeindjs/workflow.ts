// lib/controllers/nodes.controller.ts
// import User from '../models/user.model';
import { Request, Response } from 'express';
import { Node, NodeInterface } from '../models/node.model'
import { UpdateOptions, DestroyOptions } from 'sequelize'


export class NodesController{

    public index (_req: Request, res: Response) {
        Node.findAll<Node>({})
            .then((nodes : Array<Node>) => res.json(nodes))
            .catch((err : Error) => res.status(500).json(err))
    }

    public create (req: Request, res: Response) {
        const params : NodeInterface = req.body

        Node.create<Node>(params)
            .then((node : Node) => res.status(201).json(node))
            .catch((err : Error) => res.status(500).json(err))
    }

    public show (req: Request, res: Response) {
        const nodeId : number = req.params.id

        Node.findByPk<Node>(nodeId)
            .then((node : Node|null) => {
                if (node) {
                    res.json(node)
                } else {
                    res.status(404).json({errors: ['Node not found']})
                }
            })
            .catch((err : Error) => res.status(500).json(err))
    }

    public update (req: Request, res: Response) {
        const nodeId : number = req.params.id
        const params : NodeInterface = req.body

        const options : UpdateOptions = {
             where: {id: nodeId},
             limit: 1
        }

        Node.update(params, options)
            .then(() => res.status(202).json({data: "success"}))
            .catch((err : Error) => res.status(500).json(err))
    }

    public delete (req: Request, res: Response) {
        const nodeId : number = req.params.id
        const options : DestroyOptions = {
            where: {id: nodeId},
            limit: 1
       }

        Node.destroy(options)
            .then(() => res.status(204).json({data: "success"}))
            .catch((err : Error) => res.status(500).json(err))
    }
}
