import express from 'express'
import { emailVerifyController, followUserController, forgotPasswordController, getMeController, getProfileController, loginController, logoutController, registerController, resendEmailVerifyController, resetPasswordController, updateMeController, verifyForgotPasswordController } from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { accessTokenValidator, emailVerifyTokenValidator, followValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, registerValidator, resetValidator, updateMeVaidator, verifiedUserValidator, verifyForgotPasswordTokenValidator, } from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
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
/**
 * Description: Verify link in email to reset password
 * Path //verify-forgot-password
 * Method: Post
 * Body:{forgot_password_token: string}
 */
usersRouters.post('/verify-forgot-password', verifyForgotPasswordTokenValidator, wrapRequestHandler(verifyForgotPasswordController))
/**
 * Description: Verify link in email to reset password
 * Path /reset-password
 * Method: Post
 * Body:{forgot_password_token: string, password:string, confirm_password:string}
 */
usersRouters.post('/reset-password', resetValidator, wrapRequestHandler(resetPasswordController))
/**
 * Description: get my profile
 * Path /me
 * Method: Get
 * Header: {Authorization: Bearer<access_token>}
 */
usersRouters.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: update my profile
 * Path /me
 * Method: Patch
 * Header: {Authorization: Bearer<access_token>}
 * Body: UserSchema
 */
usersRouters.patch(
    '/me', 
    accessTokenValidator, 
    verifiedUserValidator, 
    updateMeVaidator, 
    filterMiddleware<UpdateMeReqBody>(['avatar', 'bio', 'cover_photo', 'date_of_birth', 'location', 'name', 'username', 'website']), 
    wrapRequestHandler(updateMeController)
) 

/**
 * Description: get user profile
 * Path /:username
 * Method: Get
 * Header: 
 * Body: 
 */
usersRouters.get('/:username', wrapRequestHandler(getProfileController)) 
/**
 * Description: follow user
 * Path /follow
 * Method: Post
 * Header: 
 * Body: {followed_user_id: string}
 */
usersRouters.post('/follow', accessTokenValidator, verifiedUserValidator, followValidator,wrapRequestHandler(followUserController)) 
/**
 * Description: Unfollow user
 * Path /follow/:user_id
 * Method: Delete
 * Header: 
 * Body: {followed_user_id: string}
 */
usersRouters.delete('/follow/:user_id', accessTokenValidator, verifiedUserValidator, followValidator, wrapRequestHandler(followUserController)) 



export default usersRouters