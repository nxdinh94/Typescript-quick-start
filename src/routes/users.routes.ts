import express, {Request, Response, NextFunction} from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'

import { loginValidator,  } from '~/middlewares/users.middlewares'

const usersRouters = express.Router()

usersRouters.post('/login', loginValidator, loginController)

usersRouters.post('/register', registerController)

export default usersRouters