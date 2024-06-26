import User from "~/models/schemas/User.schema";
import databaseService from "./database.services"

class UsersService{
    async register(payload: User){
        const {email, password} = payload
        const newUser = new User({ email, password });

        await databaseService.users.insertOne(newUser);

    }
    async checkEmailExist(email: string){
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    }
}

const userService = new UsersService()
export default userService
