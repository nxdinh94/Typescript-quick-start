
import { Request } from "express";
import User from "./models/schemas/User.schema";
import { TokenPayload } from "./models/requests/User.requests";

declare module 'express-serve-static-core' {
    interface Request {
        now?: number
        user: User
        decoded_authorization?: TokenPayload
        decoded_refresh_token?: TokenPayload
        decoded_email_verify_token?: TokenPayload
    }
}