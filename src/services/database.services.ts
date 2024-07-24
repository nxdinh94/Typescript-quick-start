
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import Follower from '~/models/schemas/Follower.schema';
import Tweet from '~/models/schemas/Tweet.schema';
import Hashtag from '~/models/schemas/Hashtags.schema';

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
    get tweets() : Collection<Tweet>{
        return this.db.collection(`${process.env.DB_TWEETS_COLLECTION}`)
    }

    get refreshToken():Collection<RefreshToken>{
        return this.db.collection(`${process.env.DB_REFRESH_TOKEN_COLLECTION}`)
    }
    get followers():Collection<Follower>{
        return this.db.collection(`${process.env.DB_FOLLOWERS_COLLECTION}`)
    }
    get hashtags(): Collection<Hashtag>{
        return this.db.collection(`${process.env.DB_HASHTAGS_COLLECTION}`)
    }

}

const databaseService  = new DatabaseService()
export default databaseService
