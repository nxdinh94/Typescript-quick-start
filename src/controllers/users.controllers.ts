import { NextFunction, Request, Response } from "express"
import databaseService from "~/services/database.services"
import User from "~/models/schemas/User.schema"
import userService from "~/services/users.services"
import {ParamsDictionary} from 'express-serve-static-core'
import { LogoutReqBody, RegisterRequestBody } from "~/models/requests/User.requests"
import { USERS_MESSAGES } from "~/constants/messages"


export const loginController = async(req: Request, res: Response) =>{
    const user = req.user as User
    const user_id = user._id.toString()

    const result = await userService.login(user_id)
    return res.json({message: USERS_MESSAGES.LOGGIN_SUCCESS, result})
}

export const registerController = async (
    req: Request<ParamsDictionary, any, RegisterRequestBody>, 
    res: Response,
    next: NextFunction  
) =>{
    const result = await userService.register(req.body)
    return res.json({msg: USERS_MESSAGES.REGISTER_SUCCESS, result})
}

export const logoutController = async(
    req:  Request<ParamsDictionary, any, LogoutReqBody>, 
    res: Response
) =>{
    const {refresh_token} = req.body
    const result = await userService.logout(refresh_token)
    return res.json(result)
}


