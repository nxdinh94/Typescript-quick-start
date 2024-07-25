import { NextFunction, Request, Response } from "express"
import { ParamSchema, check, checkSchema } from "express-validator"
import { JsonWebTokenError } from "jsonwebtoken"
import { capitalize } from "lodash"
import { ObjectId } from "mongodb"
import { UserVerifyStatus } from "~/constants/enum"
import HTTP_STATUS from "~/constants/httpStatus"
import { USERS_MESSAGES } from "~/constants/messages"
import { REGEX_USERNAME } from "~/constants/regex"
import { ErrorWithStatus } from "~/models/Errors"
import { TokenPayload } from "~/models/requests/User.requests"
import databaseService from "~/services/database.services"
import userService from "~/services/users.services"
import { hashPassword } from "~/ultils/crypto"
import { verifyToken } from "~/ultils/jwt"
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
                        throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
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
    }, ["body"])
)

const passwordSchema: ParamSchema = {
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
}
const userIdSchema: ParamSchema = {
    custom : {
        options: async(value:string, {req}) =>{
            if(!ObjectId.isValid(value)){
                throw new ErrorWithStatus({
                    message: USERS_MESSAGES.INVALID_USER_ID,
                    status: HTTP_STATUS.NOT_FOUND
                })
            }
            const followed_user = await databaseService.users.findOne({_id : new ObjectId(value)})
            if(followed_user === null){
                throw new ErrorWithStatus({
                    message: USERS_MESSAGES.USER_NOT_FOUND,
                    status: HTTP_STATUS.NOT_FOUND
                })
            }
        }
    }
}
const confirmPasswordSchena : ParamSchema = {
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
}
const nameSchema : ParamSchema = {
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
}
const dateOfBirthSchema : ParamSchema = {
    isISO8601:{
        options:{
            strict: true,
            strictSeparator: true
        },
        errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
    }
}
const forgotPasswordTokenSchema : ParamSchema = {
    custom:{
        options : async (value: string, {req})=>{
            if(!value){
                throw new ErrorWithStatus({
                    message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                    status: HTTP_STATUS.UNAUTHORIZED
                })
            }
            try {
                const decoded_forgot_password_token = await verifyToken({token: value, privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string})
                
                const {user_id} = decoded_forgot_password_token
                const user = await databaseService.users.findOne({_id: new ObjectId(user_id)})
                if(user ===null){
                    throw new ErrorWithStatus({
                        message : USERS_MESSAGES.USER_NOT_FOUND,
                        status : HTTP_STATUS.UNAUTHORIZED
                    })
                }
                if(user.forgot_password_token !== value){
                    throw new ErrorWithStatus({
                        message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                        status: HTTP_STATUS.UNAUTHORIZED
                    })
                }
                req.decoded_forgot_password_token = decoded_forgot_password_token
            } catch (error) {
                if(error instanceof JsonWebTokenError){
                    throw new ErrorWithStatus({
                        message : capitalize(error.message),
                        status : HTTP_STATUS.UNAUTHORIZED
                    })
                }
                throw error
            }
            return true
        }
    },
    trim: true,

}
export const registerValidator = validate(
    checkSchema({
        name : nameSchema,
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
        password: passwordSchema,
        confirm_password: confirmPasswordSchena,
        date_of_birth: dateOfBirthSchema
    },
    ["body"])
)

export const accessTokenValidator = validate(
    checkSchema({
        Authorization:{
            custom: {
                options:async(value, {req})=>{
                    const access_token = (value || '').split(' ')[1]
                    if(!access_token){
                        throw new ErrorWithStatus({
                            message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                            status : HTTP_STATUS.UNAUTHORIZED
                        })
                    }
                    try {
                        const decoded_authorization = await verifyToken({token: access_token, privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string})
                        //cast req from express-validator to Request type of express
                        //user semi collumn because we use bracket here
                        ;(req as Request).decoded_authorization = decoded_authorization

                    } catch (error) {
                        throw new ErrorWithStatus({
                            message : capitalize((error as JsonWebTokenError).message),
                            status:  HTTP_STATUS.UNAUTHORIZED
                        })
                    } 
                    return true
                }
            },
            trim: true,

        }
    })
)

export const refreshTokenValidator = validate(
    checkSchema({
        refresh_token:{
            trim: true,
            custom : {
                options : async (value: string, {req})=>{
                    if(!value){
                        throw new ErrorWithStatus({
                            message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                            status: HTTP_STATUS.UNAUTHORIZED
                        })
                    }
                    try {
                        const [decoded_refresh_token, refresh_token] = await Promise.all([
                            verifyToken({token: value, privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string}),
                            databaseService.refreshToken.findOne({token: value})
                        ])
                        if(refresh_token ===null){
                            throw new ErrorWithStatus({
                                message : USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXISTS,
                                status : HTTP_STATUS.UNAUTHORIZED
                            })
                        }
                        (req as Request).decoded_refresh_token = decoded_refresh_token

                    } catch (error) {
                        if(error instanceof JsonWebTokenError){
                            throw new ErrorWithStatus({
                                message : capitalize(error.message),
                                status : HTTP_STATUS.UNAUTHORIZED
                            })
                        }
                        throw error
                    }
                    
                }
            }
        },
    })
)

export const emailVerifyTokenValidator = validate(
    checkSchema({
        email_verify_token:{
            custom : {
                options : async (value: string, {req})=>{
                    if(!value){
                        throw new ErrorWithStatus({
                            message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                            status: HTTP_STATUS.UNAUTHORIZED
                        })
                    }
                    try {
                        const decoded_email_verify_token = await verifyToken({
                            token: value, 
                            privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
                        })
                        ;(req as Request).decoded_email_verify_token = decoded_email_verify_token

                    } catch (error) {
                        throw new ErrorWithStatus({
                            message: capitalize((error as JsonWebTokenError).message),
                            status: HTTP_STATUS.UNAUTHORIZED
                        })
                    }
                    
                }
            },
            trim: true,

        },
    })
)

export const forgotPasswordValidator = validate(
    checkSchema({
        email:{
            isEmail : {
                errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
            },
            custom:{
                options: async(value, {req})=>{
                    const user = await databaseService.users.findOne({email: value})
                    if(user === null){
                        throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
                    }
                    req.user = user
                    return true
                }
            },
            trim: true,
        },
    }, ['body'])
)
export const verifyForgotPasswordTokenValidator = validate(
    checkSchema({
        forgot_password_token: forgotPasswordTokenSchema,
    }, ['body'])
)
export const resetValidator = validate(
    checkSchema({
        password: passwordSchema,
        confirm_password: confirmPasswordSchena,
        forgot_password_token: forgotPasswordTokenSchema
    }, ["body"])
)

export const verifiedUserValidator = (
    req: Request, 
    res: Response,
    next: NextFunction
) =>{
    const {verify} = req.decoded_authorization as TokenPayload
    if(verify !== UserVerifyStatus.Verrified){
        return next(
            new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_VERIFIED,
                status: HTTP_STATUS.FORBIDDEN
            })
        )
        
    }
    next()
}
export const updateMeVaidator = validate(
    checkSchema({
        name : {
            ...nameSchema,
            optional: true,
            notEmpty: undefined
        },
        date_of_birth: {
            ...dateOfBirthSchema,
            optional: true
        },
        bio: {
            optional: true,
            isString: {
                errorMessage: USERS_MESSAGES.BIO_MUST_BE_STRING
            },
            isLength:{
                options:{
                    min: 1, max: 200
                },
                errorMessage : USERS_MESSAGES.BIO_LENGTH_MUST_BE_FROM_1_TO_200
            },
            trim: true,
        },
        location: {
            isString: {
                errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_STRING
            },
            optional: true,
            isLength:{
                options:{
                    min: 1, max: 200
                },
                errorMessage : USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_FROM_1_TO_200
            },
            trim: true,
        },
        website: {
            optional: true,
            isString: {
                errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_STRING
            },
            isLength:{
                options:{
                    min: 1, max: 200
                },
                errorMessage : USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200
            },
            trim: true,
        },
        username: {
            optional: true,
            isString: {
                errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING
            },
            custom : {
                options : async(value: string, {req})=>{
                    if(REGEX_USERNAME.test(value) === false){
                        throw Error(USERS_MESSAGES.USERNAME_IS_INVALID)
                    }
                    const user = await databaseService.users.findOne({
                        username: value
                    })
                    // if exists username in db, we dont allow to update
                    if(user){
                        throw Error(USERS_MESSAGES.USERNAME_EXISTED)
                    }
                }
            },
            trim: true,
        },
        avatar: {
            optional: true,
            isString: {
                errorMessage: USERS_MESSAGES.AVATAR_MUST_BE_STRING
            },
            isLength:{
                options:{
                    min: 1, max: 200
                },
                errorMessage : USERS_MESSAGES.AVATAR_LENGTH_MUST_BE_FROM_1_TO_50
            },
            trim: true,

        },
        cover_photo: {
            optional: true,
            isString: {
                errorMessage: USERS_MESSAGES.COVER_PHOTO_MUST_BE_STRING
            },
            isLength:{
                options:{
                    min: 1, max: 200
                },
                errorMessage : USERS_MESSAGES.COVER_PHOTO_LENGTH_MUST_BE_FROM_1_TO_50
            },
            trim: true,
        },

    }, ["body"])
)

export const followValidator  = validate(
    checkSchema({
        followed_user_id : userIdSchema
    }, ["body"])
)
export const unFollowValidator  = validate(
    checkSchema({
        user_id : userIdSchema
    }, ["params"])
)

export const isUserLoggedInValidator = (middleware: (req: Request, res:Response, next: NextFunction) => void)  => {
    return (req: Request, res:Response, next: NextFunction)=> { 
        if(req.headers.authorization){
            return middleware(req, res, next)
        }
        next()
    }
}