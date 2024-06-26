import User from "~/models/schemas/User.schema";
import databaseService from "./database.services"

class UsersService{
    constructor(){

    }
    async register(payload: User){
        const {email, password} = payload
        const newUser = new User({ email, password });

        await databaseService.users.insertOne(newUser);

    }
}

const userService = new UsersService()
export default userService
