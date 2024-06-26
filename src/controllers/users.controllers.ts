import { Request, Response } from "express"
import databaseService from "~/services/database.services"
import User from "~/models/schemas/User.schema"
import userService from "~/services/users.services"

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

export const registerController = async (req: Request, res: Response) =>{
    const {email, password} = req.body
    try{
        const newUser = new User({ email, password });
        await userService.register(newUser)
        return res.json({
            msg:"Register successfully",
        })
    }catch(error){
        return res.status(400).json({
            msg:"Register failed"
        })
    }   
}


