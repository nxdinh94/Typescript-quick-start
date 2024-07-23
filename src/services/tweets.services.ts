import { CreateTweetReqBody } from "~/models/requests/tweets.requests";
import databaseService from "./database.services";
import Tweet from "~/models/schemas/Tweet.schema";
import { ObjectId } from "mongodb";

class TweetsService{
    async createTweet(user_id: string, body: CreateTweetReqBody){
        const result = await databaseService.tweets.insertOne(
            new Tweet({
                audience: body.audience,
                content: body.content,
                hashtags: [],
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