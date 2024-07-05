import { ObjectId } from "mongodb";
import { TokenType, UserVerifyStatus } from "~/constants/enum";
import { USERS_MESSAGES } from "~/constants/messages";
import { RegisterRequestBody, UpdateMeReqBody } from "~/models/requests/User.requests";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import User from "~/models/schemas/User.schema";
import { hashPassword } from "~/ultils/crypto";
import { signToken } from "~/ultils/jwt";
import databaseService from "./database.services";

class UsersService{
    private signAccessToken({user_id, verify} : {user_id: string, verify: UserVerifyStatus}){
        return signToken({
            payload : {
                user_id, 
                token_type: TokenType.AccessToken,
                verify
            },
            option:{
                expiresIn : process.env.ACCESS_TOKEN_EXPIRES_IN
            },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
        })
    }
    private signRefreshToken({user_id, verify} : {user_id: string, verify: UserVerifyStatus}){
        return signToken({
            payload : {
                user_id, 
                token_type: TokenType.RefreshToken,
                verify
            },
            option:{
                expiresIn : process.env.REFRESH_TOKEN_EXPIRES_IN
            },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
        })
    }
    private signEmailVerifyToken({user_id, verify} : {user_id: string, verify: UserVerifyStatus}){
        return signToken({
            payload : {
                user_id, 
                token_type: TokenType.EmailVerifyToken,
                verify
            },
            option:{
                expiresIn : process.env.EMAIL_VERIFIED_TOKEN_EXPIRES_IN
            },
            privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
        })
    }
    private signForgotPasswordToken({user_id, verify} : {user_id: string, verify: UserVerifyStatus}){
        return signToken({
            payload : {
                user_id,
                token_type: TokenType.ForgotPasswordToken,
                verify
            },
            option:{
                expiresIn : process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
        },
            privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
    }
    private signAccessAndRefreshToken({user_id, verify} : {user_id: string, verify: UserVerifyStatus}){
        return Promise.all([
            this.signAccessToken({user_id, verify}), 
            this.signRefreshToken({user_id, verify})
        ])
    }
    async register(payload: RegisterRequestBody){
        // gen user_id instead of mongodb 
        const user_id = new ObjectId()
        const email_verify_token = await this.signEmailVerifyToken({
            user_id :user_id.toString(), 
            verify: UserVerifyStatus.Unverified
        })
        const newUser = new User({   
            ...payload, 
            _id: user_id,
            email_verify_token,
            date_of_birth: new Date(payload.date_of_birth),
            password : hashPassword(payload.password)
        });
        await databaseService.users.insertOne(newUser)
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
            user_id : user_id.toString(), 
            verify: UserVerifyStatus.Unverified
        })
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
    async login({user_id, verify}: {user_id: string, verify: UserVerifyStatus}){
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({user_id, verify})
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
            this.signAccessAndRefreshToken({
                user_id :user_id.toString(), 
                verify: UserVerifyStatus.Verrified
            }),
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
        const email_verify_token = await this.signEmailVerifyToken({
            user_id :user_id.toString(), 
            verify: UserVerifyStatus.Unverified
        })
        console.log('resend verify email: ', email_verify_token);

        // update email-verify-token in collection
        await databaseService.users.updateOne(
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
    async forgotPassword({user_id, verify}: {user_id: string, verify: UserVerifyStatus}){
        const forgot_password_token = await this.signForgotPasswordToken({user_id, verify})
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
    async resetPassword(user_id: string, password: string){
        await databaseService.users.updateOne(
            {_id: new ObjectId(user_id)},
            {
                $set: {
                    forgot_password_token: '',
                    password: hashPassword(password),
                    verify: UserVerifyStatus.Verrified
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )
        return {
            message : USERS_MESSAGES.RESET_PASSWORD_SUCCESS
        }
    }
    async getMe(user_id: string){
        const user = await databaseService.users.findOne(
            {_id: new ObjectId(user_id)},
            {
                projection: {
                    password: 0,
                    email_verify_token: 0,
                    forgot_password_token: 0
                }
            }
        )
        return user
    }
    async updateMe(user_id: string, payload: UpdateMeReqBody){
        const _payload = payload.date_of_birth ? {
            ...payload, date_of_birth : new Date(payload.date_of_birth)
        }: payload
        const user  = await databaseService.users.findOneAndUpdate(
            {_id: new ObjectId(user_id)},
            {
                $set: {
                    ..._payload  as {date_of_birth?: Date}
                },
                $currentDate: {
                    updated_at: true
                },
            },
            {
                returnDocument: "after",
                projection: {
                    password: 0,
                    email_verify_token: 0,
                    forgot_password_token: 0
                }
            }
        )
        return user
    }
}

const userService = new UsersService()
export default userService
