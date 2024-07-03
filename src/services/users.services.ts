import User from "~/models/schemas/User.schema";
import databaseService from "./database.services"
import { RegisterRequestBody } from "~/models/requests/User.requests";
import { hashPassword } from "~/ultils/crypto";
import { signToken } from "~/ultils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enum";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import { ObjectId } from "mongodb";
import { USERS_MESSAGES } from "~/constants/messages";

class UsersService{
    private signAccessToken(user_id: string){
        return signToken({
            payload : {
                user_id, 
                token_type: TokenType.AccessToken
            },
            option:{
                expiresIn : process.env.ACCESS_TOKEN_EXPIRES_IN
            },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
        })
    }
    private signRefreshToken(user_id: string){
        return signToken({
            payload : {
                user_id, 
                token_type: TokenType.RefreshToken
            },
            option:{
                expiresIn : process.env.REFRESH_TOKEN_EXPIRES_IN
            },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
        })
    }
    private signEmailVerifyToken(user_id: string){
        return signToken({
            payload : {
                user_id, 
                token_type: TokenType.EmailVerifyToken
            },
            option:{
                expiresIn : process.env.EMAIL_VERIFIED_TOKEN_EXPIRES_IN
            },
            privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
        })
    }
    private signForgotPasswordToken(user_id: string){
        return signToken({
            payload : {
                user_id,
                token_type: TokenType.ForgotPasswordToken
            },
            option:{
                expiresIn : process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
        },
            privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
    }
    private signAccessAndRefreshToken(user_id: string){
        return Promise.all([
            this.signAccessToken(user_id), 
            this.signRefreshToken(user_id)
        ])
    }
    async register(payload: RegisterRequestBody){
        // gen user_id instead of mongodb 
        const user_id = new ObjectId()
        const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
        const newUser = new User({   
            ...payload, 
            _id: user_id,
            email_verify_token,
            date_of_birth: new Date(payload.date_of_birth),
            password : hashPassword(payload.password)
        });
        await databaseService.users.insertOne(newUser)
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
        await databaseService.refreshToken.insertOne(
            new RefreshToken({
                user_id : new ObjectId(user_id), 
                token: refresh_token
            })
        )
        console.log('email_verified_token', email_verify_token);
        return {access_token, refresh_token}
    }
    async checkEmailExist(email: string){
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    } 
    async login(user_id: string){
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
        await databaseService.refreshToken.insertOne(new RefreshToken({
            user_id : new ObjectId(user_id), token: refresh_token
        }))
        return {access_token, refresh_token}
    }
    async logout (refresh_token: string) {
        await databaseService.refreshToken.deleteOne({token: refresh_token})
        return {
            message: USERS_MESSAGES.LOGOUT_SUCCESS
        }
    }
    async verifyEmail(user_id: string){
        
        const [token] = await Promise.all([
            this.signAccessAndRefreshToken(user_id),
            databaseService.users.updateOne(
                {_id: new ObjectId(user_id)},
                {
                    $set: {
                        email_verify_token: '', 
                        verify: UserVerifyStatus.Verrified
                    },
                    $currentDate:{
                        updated_at: true
                    }
                }
            )
        ])
        const [access_token, refresh_token] = token
        return {
            access_token, refresh_token
        }
    }
    async resendVerifyEmail(user_id: string){
        // gia su gui email bang console log
        const email_verify_token = await this.signEmailVerifyToken(user_id)
        console.log('resend verify email: ', email_verify_token);

        // update email-verify-token in collection
        const result = await databaseService.users.updateOne(
            {_id: new ObjectId(user_id)},
            {
                $set: {
                    email_verify_token,
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )
        return {
            message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
        }

    }
    async forgotPassword(user_id: string){
        const forgot_password_token = await this.signForgotPasswordToken(user_id)
        await databaseService.users.updateOne(
            {_id: new ObjectId(user_id)},
            {
                $set: {
                    forgot_password_token,
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )
        // send email with link to email user: https://twitter.com/forgot-password?token=token
        console.log('forgot-password-token', forgot_password_token);
        return {
            message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
        }
    }
}

const userService = new UsersService()
export default userService
