import { Router } from "express"
import { createTweetController } from "~/controllers/tweets.controllers"
import { createTweetValidator } from "~/middlewares/tweets.middlewares"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares"
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
export default tweetsRouter