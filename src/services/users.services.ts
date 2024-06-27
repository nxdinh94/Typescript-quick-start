import User from "~/models/schemas/User.schema";
import databaseService from "./database.services"
import { RegisterRequestBody } from "~/models/requests/User.requests";
import { hashPassword } from "~/ultils/crypto";
import { signToken } from "~/ultils/jwt";
import { TokenType } from "~/constants/enum";

class UsersService{
    private signAccessToken(user_id: string){
        return signToken({
            payload : {
                user_id, 
                token_type: TokenType.AccessToken
            },
            option:{
                expiresIn : process.env.ACCESS_TOKEN_EXPIRES_IN
            }
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
            }
        })
    }
    private signAccessAndRefreshToken(user_id: string){
        return Promise.all([
            this.signAccessToken(user_id), 
            this.signRefreshToken(user_id)
        ])
    }
    async register(payload: RegisterRequestBody){
        const newUser = new User({   
            ...payload, 
            date_of_birth: new Date(payload.date_of_birth),
            password : hashPassword(payload.password)
        });
        const result = await databaseService.users.insertOne(newUser)
        const user_id = result.insertedId.toString()
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
        return {access_token, refresh_token}
    }
    async checkEmailExist(email: string){
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    } 
    async login(user_id: string){
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
        return {access_token, refresh_token}
    }
}

const userService = new UsersService()
export default userService
