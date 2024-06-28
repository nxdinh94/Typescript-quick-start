import jwt, {SignOptions} from 'jsonwebtoken'

type paramsType = {
    payload: string | Buffer| object, 
    privateKey?: string, 
    option?: SignOptions
}


export const signToken = ({payload, privateKey = process.env.JWT_SECRET  as string, option = {algorithm : 'HS256'}}: paramsType)=>{
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
    {token, privateKey = process.env.JWT_SECRET  as string}:
    {token: string, privateKey? : string}
)=>{
    return new Promise<jwt.JwtPayload>((resolve, reject)=>{
        jwt.verify(token, privateKey, (error, decoded)=>{
            if(error){
                throw reject(error)
            }
            resolve(decoded as jwt.JwtPayload)
        })
    })
}
