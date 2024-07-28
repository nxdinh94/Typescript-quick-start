
import express, {Request, Response, NextFunction} from 'express';
import {ParamsDictionary} from 'express-serve-static-core'
import { TweetType } from '~/constants/enum';
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
export const getTweetController = async (
    req: Request, 
    res: Response,
    next: NextFunction  // To call the next middleware or route handler in the stack
) => {
    const decoded_authorization = req.decoded_authorization as TokenPayload
    const result = await tweetsService.increaseView(req.params.tweet_id, decoded_authorization.user_id)
    const tweet = {
        ...req.tweet,
        guest_views: result.guest_views,
        user_views: result.user_views,
        updated_at: result.updated_at
    }
    return res.json({
        message: 'Get Tweet successfully',
        result : result
    })
}
export const getTweetChildrenController = async (
    req: Request, 
    res: Response,
    next: NextFunction  // To call the next middleware or route handler in the stack
) => {
    const tweet_type = Number(req.query.tweet_type as string) as TweetType
    const limit = Number(req.query.limit as string)
    const page = Number(req.query.page as string)
    const user_id = req.decoded_authorization?.user_id
    const {result, total_item} = await tweetsService.getTweetChildren({
        tweet_id: req.params.tweet_id, 
        tweet_type, 
        limit,
        page,
        user_id
    })
    return res.json({
        message: 'Get Tweet successfully',
        result : {
            tweets: result,
            tweet_type, limit,page,
            total_page: Math.ceil(total_item / limit)
             
        }
    })
}

