import { NextFunction, Request, Response } from "express"
import databaseService from "~/services/database.services"
import User from "~/models/schemas/User.schema"
import userService from "~/services/users.services"
import {ParamsDictionary} from 'express-serve-static-core'
import { RegisterRequestBody } from "~/models/requests/User.requests"


export const loginController = (req: Request, res: Response) =>{
    const {email, password} = req.body
    if(email === "nguyenxuandinh336@gmail.com" && password === "111"){
        return res.json({
            msg : "Loggin successfully"
        })
    }else return res.status(400).json({
        msg:"Loggin failed"
    })
}

export const registerController = async (
    req: Request<ParamsDictionary, any, RegisterRequestBody>, 
    res: Response,
    next: NextFunction
) =>{
    const result = await userService.register(req.body)
    return res.json({msg: 'Register successfully',result})} 


