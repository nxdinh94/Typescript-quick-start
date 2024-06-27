import {Request, Response, NextFunction } from "express"
import { check, checkSchema } from "express-validator"
import { USERS_MESSAGES } from "~/constants/messages"
import { ErrorWithStatus } from "~/models/Errors"
import databaseService from "~/services/database.services"
import userService from "~/services/users.services"
import { hashPassword } from "~/ultils/crypto"
import { validate } from "~/ultils/validation"

export const loginValidator = validate(
    checkSchema({
        email:{
            isEmail : {
                errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
            },
            trim: true,
            custom:{
                options: async(value, {req})=>{
                    const user = await databaseService.users.findOne({email: value,  password: hashPassword(req.body.password)})
                    if(user === null){
                        throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
                    }
                    req.user = user
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
            isString: {
                errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
            },
            notEmpty: {
                errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
            },
            isStrongPassword: {
                options: {
                    minLength: 6,
                    minLowercase : 1,
                    minUppercase : 1,
                    minNumbers: 1,
                    minSymbols: 1,
                },
                errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
            }
        },
    })
)


export const registerValidator = validate(
    checkSchema({
        name : {
            isLength:{
                options:{
                    min: 1, max: 100
                },
                errorMessage : USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
            },
            notEmpty: {
                errorMessage : USERS_MESSAGES.NAME_IS_REQUIRED
            },
            trim: true,
            isString: {
                errorMessage: USERS_MESSAGES.NAME_MUST_BE_STRING
            }
        },
        email:{
            isEmail : {
                errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
            },
            trim: true,
            custom:{
                options: async(value)=>{
                    const isExistEmail = await userService.checkEmailExist(value)
                    if(isExistEmail){
                        throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXIST)
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
            isString: {
                errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
            },
            notEmpty: {
                errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
            },
            isStrongPassword: {
                options: {
                    minLength: 6,
                    minLowercase : 1,
                    minUppercase : 1,
                    minNumbers: 1,
                    minSymbols: 1,
                },
                errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
            }
        },
        confirm_password: {
            isLength:{  
                options : {
                    min : 6, max: 50
                },
                errorMessage : USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
            },
            isString: {
                errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
            },
            notEmpty: {
                errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
            },
            isStrongPassword: {
                options: {
                    minLength: 6,
                    minLowercase : 1,
                    minUppercase : 1,
                    minNumbers: 1,
                    minSymbols: 1,
                },
                errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
            },
            custom:{
                options: (value, {req}) =>{
                    if(value !== req.body.password){
                        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_IS_INVALID)
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
                },
                errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
            }
        }
    }
))