// lib/controllers/nodes.controller.ts
// import User from '../models/user.model';
import { Request, Response } from 'express';
import { Node, NewNode } from '../models/node.model'


export class NodesController{

    public index (_req: Request, res: Response) {
        Node.findAll<Node>({})
            .then((nodes : Array<Node>) => res.json(nodes))
            .catch((err : Error) => res.status(500).json(err))
    }

    public create (req: Request, res: Response) {
        const params : NewNode = req.body

        Node.create<Node>(params)
            .then((node : Node) => res.json(node))
            .catch((err : Error) => res.status(500).json(err))
    }

    // public show (req: Request, res: Response) {
    //     User.findById(req.params.id, (err: Error, Users) => {
    //         if(err){
    //             res.send(err);
    //         }
    //         res.json(Users);
    //     });
    // }

    // public update (req: Request, res: Response) {
    //     User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, User) => {
    //         if(err){
    //             res.send(err);
    //         }
    //         res.json(User);
    //     });
    // }

    // public delete (req: Request, res: Response) {
    //     User.remove({ _id: req.params.id }, (err: Error, User) => {
    //         if(err){
    //             res.send(err);
    //         }
    //         res.json({ message: 'Successfully deleted User!'});
    //     });
    // }
}
