import { Router } from "express"
import { createTweetController, getTweetChildrenController, getTweetController } from "~/controllers/tweets.controllers"
import { audienceValidator, createTweetValidator, getTweetChildrenValidator, paginationValidator, tweetIdValidator } from "~/middlewares/tweets.middlewares"
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/ultils/handler"

const tweetsRouter = Router()


/**
 * Description: Create a new tweet
 * Path /
 * Method: POST
 * Body: TweetReqBody
 * 
 */
tweetsRouter.post('/', accessTokenValidator, verifiedUserValidator, createTweetValidator, wrapRequestHandler(createTweetController))

/**
 * Description: Get a  tweet
 * Path /:tweet_id
 * Method: GET
 * Headers: {Authorization?: Bearer <access_token>}
 */
tweetsRouter.get(
    '/:tweet_id', 
    tweetIdValidator, 
    isUserLoggedInValidator(accessTokenValidator),
    isUserLoggedInValidator(verifiedUserValidator),
    audienceValidator,
    wrapRequestHandler(getTweetController)
)

/**
 * Description: Get a  children
 * Path /:tweet_id/children
 * Method: GET
 * Headers: {Authorization?: Bearer <access_token>}
 * Query : {limit: number, page : number, tweet_type: TweetType}
 */
tweetsRouter.get(
    '/:tweet_id/children', 
    tweetIdValidator, 
    getTweetChildrenValidator,
    paginationValidator,
    isUserLoggedInValidator(accessTokenValidator),
    isUserLoggedInValidator(verifiedUserValidator),
    audienceValidator,
    wrapRequestHandler(getTweetChildrenController)
)


export default tweetsRouter