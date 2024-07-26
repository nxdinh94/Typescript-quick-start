import { Router } from "express"
import { createTweetController, getTweetController } from "~/controllers/tweets.controllers"
import { audienceValidator, createTweetValidator, tweetIdValidator } from "~/middlewares/tweets.middlewares"
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


export default tweetsRouter