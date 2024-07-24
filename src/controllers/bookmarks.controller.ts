
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import bookmarkService from '~/services/bookmarks.services';


export const bookmarkTweetController = async (
    req: Request<ParamsDictionary, any, BookmarkTweetReqBody>, 
    res: Response,
    next: NextFunction  // To call the next middleware or route handler in the stack
) => {
    const {user_id} = req.decoded_authorization as TokenPayload
    const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
    return res.json({
        message: 'create bookmark successfully',
        result
    })
}