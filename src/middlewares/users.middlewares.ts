import {Request, Response, NextFunction } from "express"
import { checkSchema } from "express-validator"
import userService from "~/services/users.services"
import { validate } from "~/ultils/validation"

export const loginValidator = (req: Request, res: Response, next:NextFunction) =>{
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({
            msg : 'Missing email or password'
        })
    }else next()
}
export const registerValidator = validate(
    checkSchema({
        name : {
            isLength:{
                options:{
                    min: 1, max: 100
                }
            },
            notEmpty: true,
            trim: true,
            isString: true
        },
        email:{
            notEmpty: true,
            isEmail : true,
            trim: true,
            custom:{
                options: async(value)=>{
                    const isExistEmail = await userService.checkEmailExist(value)
                    if(isExistEmail){
                        throw new Error('Email already exists')
                    }
                    return true
                }
            }
        },
        password: {
            isLength:{
                options : {
                    min : 6, max: 50
                }
            },
            isString: true,
            notEmpty: true,
            isStrongPassword: {
                options: {
                    minLength: 6,
                    minLowercase : 1,
                    minUppercase : 1,
                    minNumbers: 1,
                    minSymbols: 1,
                },
                errorMessage: 'Password must be at least 6 character long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
            }
        },
        confirm_password: {
            isLength:{  
                options : {
                    min : 6, max: 50
                }
            },
            isString: true,
            notEmpty: true,
            isStrongPassword: {
                options: {
                    minLength: 6,
                    minLowercase : 1,
                    minUppercase : 1,
                    minNumbers: 1,
                    minSymbols: 1,
                }
            },
            errorMessage: 'Password must be at least 6 character long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
            custom:{
                options: (value, {req}) =>{
                    if(value !== req.body.password){
                        throw new Error('Password confirmation does not match password')
                    }
                    return true
                }
            }
        },
        date_of_birth:{
            isISO8601:{
                options:{
                    strict: true,
                    strictSeparator: true
                }
            }
        }
    }
))