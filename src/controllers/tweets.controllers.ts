
import express, {Request, Response, NextFunction} from 'express';
import {ParamsDictionary} from 'express-serve-static-core'
import { CreateTweetReqBody } from '~/models/requests/tweets.requests';


export const createTweetController = async (
    req: Request<ParamsDictionary, any, CreateTweetReqBody>, 
    res: Response,
    next: NextFunction  // To call the next middleware or route handler in the stack
) => {
    return res.json('createTweet')
}