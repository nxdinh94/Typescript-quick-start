import { Router } from "express"
import { bookmarkTweetController, unBookmarkTweetController } from "~/controllers/bookmarks.controller"
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

/**
 * Description: Create a new BookMark tweet
 * Path /:tweet_id
 * Method: DELETE
 * Body: {tweet_id: string}
 * Header: {Authorization: Bearer<access_token>}
 */
bookmarksRouter.delete('/tweets/:tweet_id', accessTokenValidator, verifiedUserValidator,  wrapRequestHandler(unBookmarkTweetController))

export default bookmarksRouter