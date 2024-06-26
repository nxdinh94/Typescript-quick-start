import express, {Request, Response, NextFunction, ErrorRequestHandler} from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator,  } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/ultils/handler'

const usersRouters = express.Router()

usersRouters.post('/login', loginValidator, loginController)

/**
 * Description: register a new user
 * Path /register
 * Method: Post
 * Body: {name: string, email: string, password: string, confirm_password: string,date_of_birth: isoString}
 */
usersRouters.post('/register',registerValidator, wrapRequestHandler(registerController))

export default usersRouters