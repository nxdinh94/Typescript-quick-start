import express, {Request, Response, NextFunction, ErrorRequestHandler} from 'express'
import { emailVerifyController, forgotPasswordController, loginController, logoutController, registerController, resendEmailVerifyController } from '~/controllers/users.controllers'
import { accessTokenValidator, emailVerifyTokenValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, registerValidator,  } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/ultils/handler'

const usersRouters = express.Router()


/**
 * Description: Login user
 * Path /login
 * Method: Post
 * Body: {email: string, password: string}
 */
usersRouters.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description: register a new user
 * Path /register
 * Method: Post
 * Body: {name: string, email: string, password: string, confirm_password: string,date_of_birth: isoString}
 */
usersRouters.post('/register',registerValidator, wrapRequestHandler(registerController))

/**
 * Description: logout 
 * Path /logout
 * Method: Post
 * Header: {Authorization: Bearer: <accesstoken>}
 * Body: {refresh_token: string}
 */
usersRouters.post('/logout',refreshTokenValidator ,accessTokenValidator, wrapRequestHandler(logoutController))
/**
 * Description: Verify email when user click on the link in email 
 * Path /verify-email
 * Method: Post
 * Body: {email-verify-token: string}
 */
usersRouters.post('/verify-email' ,emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))
/**
 * Description: Verify email when user click on the link in email 
 * Path /resend-verify-email
 * Method: Post
 * Body:{}
 */
usersRouters.post('/resend-verify-email' ,accessTokenValidator ,wrapRequestHandler(resendEmailVerifyController))

/**
 * Description: Submit email to reset password, send email to user
 * Path /forgot-password
 * Method: Post
 * Body:{email: string}
 */
usersRouters.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))



export default usersRouters