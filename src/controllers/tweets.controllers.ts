
import express, {Request, Response, NextFunction} from 'express';
import {ParamsDictionary} from 'express-serve-static-core'
import { CreateTweetReqBody } from '~/models/requests/tweets.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import tweetsService from '~/services/tweets.services';


export const createTweetController = async (
    req: Request<ParamsDictionary, any, CreateTweetReqBody>, 
    res: Response,
    next: NextFunction  // To call the next middleware or route handler in the stack
) => {
    const {user_id} = req.decoded_authorization as TokenPayload
    const result = await tweetsService.createTweet(user_id, req.body)
    return res.json({
        message: 'Tweet created successfully',
        result
    })
}