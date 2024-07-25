import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enum";

interface UserType{
    _id?: ObjectId,
    name: string,
    email: string,
    date_of_birth: Date,
    password: string,
    created_at?: Date,
    updated_at?: Date,
    email_verify_token?: string,
    forgot_password_token?:string,
    verify?: UserVerifyStatus
    twitter_circle? : ObjectId[] //  list id of this user add to circle
    bio?: String,        //optional
    location?: String,   //optional
    website?: String,    //optional
    username?: String,   //optional
    avatar?: String,     //optional
    cover_photo?: String,//optional
}

export default class User{
    _id: ObjectId
    name: string
    email: string
    date_of_birth: Date
    password: string
    created_at: Date
    updated_at: Date
    email_verify_token: string
    forgot_password_token:string
    verify: UserVerifyStatus
    twitter_circle: ObjectId[] 
    bio: String
    location: String
    website: String
    username: String
    avatar: String
    cover_photo: String
    
    constructor(user: UserType){
        const now = new Date()
        this._id = user._id || new ObjectId()
        this.name = user.name  || ''
        this.email = user.email
        this.date_of_birth = user.date_of_birth|| now.toISOString()
        this.password = user.password
        this.created_at = user.created_at   || now
        this.updated_at = user.updated_at   || now
        this.email_verify_token = user.email_verify_token   || ''
        this.forgot_password_token = user.forgot_password_token  || ''
        this.verify = user.verify  || 0
        this.twitter_circle = user.twitter_circle || []
        this.bio = user.bio  || ''
        this.location = user.location  || ''
        this.website = user.website  || ''
        this.username = user.username  || ''
        this.avatar = user.avatar  || ''
        this.cover_photo = user.cover_photo  || ''
    }
}