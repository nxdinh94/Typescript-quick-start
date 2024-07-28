import { CreateTweetReqBody } from "~/models/requests/tweets.requests";
import databaseService from "./database.services";
import Tweet from "~/models/schemas/Tweet.schema";
import { ObjectId, WithId } from "mongodb";
import Hashtag from "~/models/schemas/Hashtags.schema";
import { TweetType } from "~/constants/enum";

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
    async increaseView(tweet_id: string, user_id?: string) {
      const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
      const result = await databaseService.tweets.findOneAndUpdate(
        { _id: new ObjectId(tweet_id) },
        {
          $inc: inc,
          $currentDate: {
            updated_at: true
          }
        },
        {
          returnDocument: 'after',
          projection: {
            guest_views: 1,
            user_views: 1,
            updated_at: 1
          } 
        }
      )
      return result as WithId<{
        guest_views: number
        user_views: number
        updated_at: Date
      }>
    }
    async getTweetChildren(
      {tweet_id, tweet_type, limit, page, user_id} : {
        tweet_id: string, tweet_type: TweetType, limit: number, page: number, user_id?: string
      }
    ){
      const result = await databaseService.tweets.aggregate<Tweet>(
        [
          {
            '$match': {
              'parent_id': new ObjectId(tweet_id), 
              'type': tweet_type
            }
          }, {
            '$lookup': {
              'from': 'hashtags', 
              'localField': 'hashtags', 
              'foreignField': '_id', 
              'as': 'hashtags'
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'mentions', 
              'foreignField': '_id', 
              'as': 'mentions'
            }
          }, {
            '$addFields': {
              'mentions': {
                '$map': {
                  'input': '$mentions', 
                  'as': 'mention', 
                  'in': {
                    '_id': '$$mention._id', 
                    'name': '$$mention.name', 
                    'username': '$$mention.username', 
                    'email': '$$mention.email'
                  }
                }
              }
            }
          }, {
            '$lookup': {
              'from': 'bookmarks', 
              'localField': '_id', 
              'foreignField': 'tweet_id', 
              'as': 'bookmarks'
            }
          }, {
            '$lookup': {
              'from': 'tweets', 
              'localField': '_id', 
              'foreignField': 'parent_id', 
              'as': 'tweet_children'
            }
          }, {
            '$addFields': {
              'bookmarks': {
                '$size': '$bookmarks'
              }, 
              'comment_count': {
                '$size': {
                  '$filter': {
                    'input': '$tweet_children', 
                    'as': 'item', 
                    'cond': {
                      '$eq': [
                        '$$item.type', TweetType.Comment
                      ]
                    }
                  }
                }
              }, 
              'retweet_count': {
                '$size': {
                  '$filter': {
                    'input': '$tweet_children', 
                    'as': 'item', 
                    'cond': {
                      '$eq': [
                        '$$item.type', TweetType.Retweet
                      ]
                    }
                  }
                }
              }
            }
          }, {
            '$project': {
              'tweet_children': 0
            }
          }, {
            '$skip': limit * (page -1 )// pagination formula
          }, {
            '$limit': limit
          }
        ]
      ).toArray()
      const ids = result.map(tweet => tweet._id as ObjectId)
      const inc = user_id ? {user_views : 1} : {guest_views : 1}
      const date =  new Date()
      //updateMany doesnot have updated_at
      const [, total_item] = await Promise.all([
        databaseService.tweets.updateMany(
          {
            // update _id which exists in ids array
            _id: {
              $in: ids
            },
          },
          {
            $inc : inc,
            $set: {
              updated_at: date
            }
          }
        ), 
        databaseService.tweets.countDocuments({
          parent_id: new ObjectId(tweet_id),
          type: tweet_type
        })
      ]) 

      result.forEach((tweet) => {
        tweet.updated_at = date  
        if(user_id){
          tweet.user_views += 1
        }else {
          tweet.guest_views += 1 
        }
      })
      return {result, total_item} 
    }
    async getNewFeeds({user_id, limit, page} :{
      user_id: string, limit: number, page: number 
    }){
      const results = await  databaseService.followers.find({
        user_id: new ObjectId(user_id),
      },{
        projection:{
          followed_user_id: 1,
          _id: 0
        }
      }).toArray()
      const followed_user_id =  results.map((item)=>{
        return item.followed_user_id;
      })
      //Mong muon newfeeds se lay luon tweets cua minh
      followed_user_id.push(new ObjectId(user_id))
      return followed_user_id;
    }

}
const tweetsService = new TweetsService();

export default tweetsService;