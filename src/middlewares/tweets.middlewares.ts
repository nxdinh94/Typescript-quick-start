import { ErrorWithStatus } from './../models/Errors';
import { checkSchema } from "express-validator";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { MediaType, TweetAudience, TweetType } from "~/constants/enum";
import HTTP_STATUS from "~/constants/httpStatus";
import { TWEET_MESSAGES } from "~/constants/messages";
import databaseService from "~/services/database.services";
import { numberEnumToArray } from "~/ultils/common";
import { validate } from "~/ultils/validation";


const tweetTypes =  numberEnumToArray(TweetType)
const tweetAudience =  numberEnumToArray(TweetAudience)
const mediaType =  numberEnumToArray(MediaType)
export const createTweetValidator = validate(
    checkSchema(
        {
            type: {
                // in range
                isIn: {
                    options: [tweetTypes],
                    errorMessage: TWEET_MESSAGES.INVALID_TYPE
                }
            },
            audience: {
                isIn: {
                    options: [tweetAudience],
                    errorMessage: TWEET_MESSAGES.INVALID_AUDIENCE
                }
            },
            parent_id:{
                custom :{
                    options : (value: string, {req})=>{
                        const type = req.body.type as TweetType
                        // if `type` is retweet, comment, quotetweet , `parent_id` must be `tweet_id` of tweet father
                        if([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type)
                        && !ObjectId.isValid(value)){
                            throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID);
                        }
                        // if `type` is tweet , `parent_id` must be `null`
                        if(type === TweetType.Tweet && value !== null){
                            throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_NULL)
                        }
                        return true
                    }
                }
            },
            content:{
                isString: true,
                custom :{
                    options : (value: string, {req})=>{
                        const type = req.body.type as TweetType
                        const hastags = req.body.hashtags as string[]
                        const mentions = req.body.mentions as string[]

                        if([TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) && 
                            isEmpty(hastags) && isEmpty(mentions) && value === ''){
                                throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
                            }
                        if(type === TweetType.Retweet && value !==''){
                            throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
                        }
                        return true
                    }
                }
            },
            hashtags:{
                isArray: true,
                custom: {
                    options: (value: string[], {req})=>{
                        // each element in array must be a string is required
                        if(!value.every((item) => typeof item === 'string')){
                            throw new Error (TWEET_MESSAGES.HASTAGS_MUST_BE_ARRAY_OF_STRING)
                        }
                        return true
                    }
                }
            },
            mentions:{
                isArray: true,
                custom: {
                    options: (value: string[], {req})=>{
                        // each element in array must be a string is required
                        if(value.some((item) => !ObjectId.isValid(item))){
                            throw new Error (TWEET_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
                        }
                        return true
                    }
                } 
            },
            medias:{
                isArray: true,
                custom: {
                    options: (value: any, {req})=>{
                        // each element in array must be a Media Object is required
                        if(value.some((item: any) => {
                            return typeof item.url !== 'string' || !mediaType.includes(item.type)
                        })){
                            throw new Error (TWEET_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
                        }
                        return true
                    }
                }
            },
        }

    )
)   

export const tweetIdValidator = validate(
    checkSchema({
        tweet_id:{
            custom:{
                options: async(value: string, {req})=>{

                    if(!ObjectId.isValid(value)){
                        throw new ErrorWithStatus({
                            status: HTTP_STATUS.FORBIDDEN,
                            message: TWEET_MESSAGES.INVALID_TWEET_ID
                        })
                    }

                    // check if tweet id exist in database
                    const tweet = await databaseService.tweets.findOne({
                        _id: new ObjectId(value)
                    })
                    if(!tweet){
                        throw new ErrorWithStatus({
                            message: TWEET_MESSAGES.TWEET_NOT_FOUND,
                            status: HTTP_STATUS.NOT_FOUND
                        })
                    }
                    return true
                }
            }
        }
    })
)