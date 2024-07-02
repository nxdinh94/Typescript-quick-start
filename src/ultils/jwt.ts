import jwt, {SignOptions} from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'

type paramsType = {
    payload: string | Buffer| object, 
    privateKey: string, 
    option?: SignOptions
}


export const signToken = ({payload, privateKey , option = {algorithm : 'HS256'}}: paramsType)=>{
    return new Promise<string>((resolve, reject)=>{
        jwt.sign(payload, privateKey, option, (error, token)=>{
        if(error){
            throw reject(error)
        }
        resolve(token as string)
        })
    })
}


export const verifyToken = (
    {token, privateKey}:
    {token: string, privateKey : string}
)=>{
    return new Promise<TokenPayload>((resolve, reject)=>{
        jwt.verify(token, privateKey, (error, decoded)=>{
            if(error){
                throw reject(error)
            }
            resolve(decoded as TokenPayload)
        })
    })
}
