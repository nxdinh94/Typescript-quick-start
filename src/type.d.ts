
import { Request } from "express";
import User from "./models/schemas/User.schema";

declare module 'express-serve-static-core' {
    interface Request {
        now?: number;
        user: User
    }
}