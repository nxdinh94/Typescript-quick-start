import { NextFunction, Request, Response } from "express"
import databaseService from "~/services/database.services"
import User from "~/models/schemas/User.schema"
import userService from "~/services/users.services"
import {ParamsDictionary} from 'express-serve-static-core'
import { FollowUserReqBody, ForgotPasswordReqBody, GetProfileReqParams, LoginReqBody, LogoutReqBody, RegisterRequestBody, ResetPaswordReqBody, TokenPayload, UpdateMeReqBody, VerifyEmailReqBody, VerifyForgotPasswordReqBody } from "~/models/requests/User.requests"
import { USERS_MESSAGES } from "~/constants/messages"
import { ObjectId } from "mongodb"
import HTTP_STATUS from "~/constants/httpStatus"
import { json } from "stream/consumers"
import { UserVerifyStatus } from "~/constants/enum"


export const loginController = async(req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) =>{
    const user = req.user as User
    const user_id = user._id.toString()

    const result = await userService.login({user_id: user_id.toString(), verify: user.verify})
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
export const emailVerifyController = async(req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response, next: NextFunction) =>{
    const {user_id} = req.decoded_email_verify_token as TokenPayload
    const user = await databaseService.users.findOne({
        _id: new ObjectId(user_id)
    })
    if(!user){
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: USERS_MESSAGES.USER_NOT_FOUND
        })
    }
    // verified email already
    if(user.email_verify_token === ''){
        return res.json({
            message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
        })
    }
    const result = await userService.verifyEmail(user_id)
    return res.json({
        message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS,
        result
    })
}

export const resendEmailVerifyController =async (req: Request, res: Response, next: NextFunction) =>{
    const {user_id} = req.decoded_authorization as TokenPayload
    const user = await databaseService.users.findOne({_id: new ObjectId(user_id)})
    if(!user){
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: USERS_MESSAGES.USER_NOT_FOUND
        })
    }
    if(user.verify === UserVerifyStatus.Verrified){
        return res.json({
            message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
        })
    }
    const result = await userService.resendVerifyEmail(user_id)
    return res.json(result)
}

export const forgotPasswordController = async(
    req: Request<ParamsDictionary, any, ForgotPasswordReqBody>, 
    res: Response, 
    next: NextFunction
) =>{
    const {_id, verify} = req.user as User
    const result  = await userService.forgotPassword({user_id : (_id as ObjectId).toString(), verify: verify})
    return res.json(result)
}

export const verifyForgotPasswordController = async (
    req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>, 
    res: Response, 
    next: NextFunction
) =>{
    return res.json({
        message: USERS_MESSAGES.VERIFIED_FORGOT_PASSWORD_SUCCESS
    })
}
export const resetPasswordController = async (
    req: Request<ParamsDictionary, any, ResetPaswordReqBody>, 
    res: Response, 
    next: NextFunction
)=>{
    const {user_id} = req.decoded_forgot_password_token as TokenPayload
    const {password} = req.body
    console.log(user_id, password);
    const result = await userService.resetPassword(user_id, password)
    return res.json(result)
}
export const getMeController = async (
    req: Request<ParamsDictionary, any, ResetPaswordReqBody>, 
    res: Response, 
    next: NextFunction
)=>{
    const {user_id} = req.decoded_authorization as TokenPayload
    const user = await userService.getMe(user_id)
    return res.json({
        message: USERS_MESSAGES.GET_ME_SUCCESS,
        result: user
    })
}

export const updateMeController = async (
    req: Request<ParamsDictionary, any, UpdateMeReqBody>, 
    res: Response, 
    next: NextFunction
) =>{
    const {user_id} = req.decoded_authorization as TokenPayload 
    const {body} = req
    const user = await userService.updateMe(user_id, body);
    return res.json({
        message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
        result: user
    })
}
export const getProfileController = async (
    req: Request<ParamsDictionary, any, GetProfileReqParams>, 
    res: Response, 
    next: NextFunction
) =>{
    const {username} = req.params 
    const user = await userService.getProfile(username);
    return res.json({
        message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
        result: user
    })
}
export const followUserController = async (
    req: Request<ParamsDictionary, any, FollowUserReqBody>, 
    res: Response, 
    next: NextFunction
) =>{
    const {user_id} = req.decoded_authorization as TokenPayload
    const {followed_user_id} = req.body
    const result = await userService.follow(user_id, followed_user_id)
    return res.json(result)
}