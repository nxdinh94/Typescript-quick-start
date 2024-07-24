import { Router } from "express"
import { bookmarkTweetController } from "~/controllers/bookmarks.controller"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/ultils/handler"

const bookmarksRouter = Router()

/**
 * Description: Create a new BookMark tweet
 * Path /
 * Method: POST
 * Body: {tweet_id: string}
 * Header: {Authorization: Bearer<access_token>}
 */
bookmarksRouter.post('/', accessTokenValidator, verifiedUserValidator,  wrapRequestHandler(bookmarkTweetController))

export default bookmarksRouter