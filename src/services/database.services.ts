
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
import 'dotenv/config'
import User from '~/models/schemas/User.schema'

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@test.ckxh0gq.mongodb.net/?retryWrites=true&w=majority&appName=test`;

class DatabaseService{
    private client : MongoClient
    private db : Db
    constructor(){
        this.client = new MongoClient(uri, {
            serverApi: {
              version: ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true,
            }
        });
        this.db = this.client.db(`${process.env.DB_NAME}`)
    }
    async connect(){
        try {
            await this.client.connect();

            await this.db.command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } catch(error){
            console.log(error);
        }
    }

    get users() : Collection<User>{
        return this.db.collection(`${process.env.DB_USER_COLLECTION}`)
    }

}

const databaseService  = new DatabaseService()
export default databaseService
