import { CreateTweetReqBody } from "~/models/requests/tweets.requests";
import databaseService from "./database.services";
import Tweet from "~/models/schemas/Tweet.schema";
import { ObjectId, WithId } from "mongodb";
import Hashtag from "~/models/schemas/Hashtags.schema";

class TweetsService{
    
    async checkAndCreateHashtags(hashtags: string[]){
        const hashtagDoc = await Promise.all(
            hashtags.map((hashtag)=>{
                //find hashtag in db, create hashtag if not found
                return databaseService.hashtags.findOneAndUpdate(
                    {name: hashtag},
                    {$setOnInsert : new Hashtag({name: hashtag})},
                    {upsert: true, returnDocument: 'after'}
                )
            })
        )
        return hashtagDoc.map((item)=>(item as WithId<Hashtag>)._id)
    }

    async createTweet(user_id: string, body: CreateTweetReqBody){
        const hashtags = await this.checkAndCreateHashtags(body.hashtags)
        const result = await databaseService.tweets.insertOne(
            new Tweet({
                audience: body.audience,
                content: body.content,
                hashtags,
                mentions: body.mentions,
                medias: body.medias,
                parent_id : body.parent_id,
                type : body.type,
                user_id: new ObjectId(user_id),
            })
        )
        return result
    }
}
const tweetsService = new TweetsService();

export default tweetsService;