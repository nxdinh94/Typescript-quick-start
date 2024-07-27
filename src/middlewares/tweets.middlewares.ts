import { NextFunction, Request, Response } from 'express';
import { ErrorWithStatus } from './../models/Errors';
import { checkSchema } from "express-validator";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enum";
import HTTP_STATUS from "~/constants/httpStatus";
import { TWEET_MESSAGES, USERS_MESSAGES } from "~/constants/messages";
import Tweet from '~/models/schemas/Tweet.schema';
import databaseService from "~/services/database.services";
import { numberEnumToArray } from "~/ultils/common";
import { wrapRequestHandler } from '~/ultils/handler';
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
                    // use destructuring
                    const [tweet] = await databaseService.tweets
                    .aggregate<Tweet>([
                      {
                        $match: {
                          _id: new ObjectId(value)
                        }
                      },
                      {
                        $lookup: {
                          from: 'hashtags',
                          localField: 'hashtags',
                          foreignField: '_id',
                          as: 'hashtags'
                        }
                      },
                      {
                        $lookup: {
                          from: 'users',
                          localField: 'mentions',
                          foreignField: '_id',
                          as: 'mentions'
                        }
                      },
                      {
                        $addFields: {
                          mentions: {
                            $map: {
                              input: '$mentions',
                              as: 'mention',
                              in: {
                                _id: '$$mention._id',
                                name: '$$mention.name',
                                username: '$$mention.username',
                                email: '$$mention.email'
                              }
                            }
                          }
                        }
                      },
                      {
                        $lookup: {
                          from: 'bookmarks',
                          localField: '_id',
                          foreignField: 'tweet_id',
                          as: 'bookmarks'
                        }
                      },
                      {
                        $lookup: {
                          from: 'tweets',
                          localField: '_id',
                          foreignField: 'parent_id',
                          as: 'tweet_children'
                        }
                      },
                      {
                        $addFields: {
                          bookmarks: {
                            $size: '$bookmarks'
                          },
                          retweet_count: {
                            $size: {
                              $filter: {
                                input: '$tweet_children',
                                as: 'item',
                                cond: {
                                  $eq: ['$$item.type', TweetType.Retweet]
                                }
                              }
                            }
                          },
                          comment_count: {
                            $size: {
                              $filter: {
                                input: '$tweet_children',
                                as: 'item',
                                cond: {
                                  $eq: ['$$item.type', TweetType.Comment]
                                }
                              }
                            }
                          },
                          quote_count: {
                            $size: {
                              $filter: {
                                input: '$tweet_children',
                                as: 'item',
                                cond: {
                                  $eq: ['$$item.type', TweetType.QuoteTweet]
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        $project: {
                          tweet_children: 0
                        }
                      }
                    ])
                    .toArray()
                    console.log(tweet)
                    if(!tweet){
                        throw new ErrorWithStatus({
                            message: TWEET_MESSAGES.TWEET_NOT_FOUND,
                            status: HTTP_STATUS.NOT_FOUND
                        })
                    }
                    ;(req as Request).tweet = tweet
                    return true
                }
            }
        }
    })
)


// Muốn sử dụng async await trong handler express thì phải có try catch
// Nếu không dùng try catch thì phải dùng wrapRequestHandler
export const audienceValidator = wrapRequestHandler(
    async (req: Request, res: Response, next: NextFunction) => {
    const tweet = req.tweet as Tweet
    if (tweet.audience === TweetAudience.TwitterCircle) {
      // Kiểm tra người xem tweet này đã đăng nhập hay chưa
      if (!req.decoded_authorization) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        })
      }
      const author = await databaseService.users.findOne({
        _id: tweet.user_id
      })
      
      // Kiểm tra tài khoản tác giả có ổn (bị khóa hay bị xóa chưa) không
      if (!author || author.verify === UserVerifyStatus.Banned) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: USERS_MESSAGES.USER_NOT_FOUND
        })
      }
      // Kiểm tra người xem tweet này có trong Twitter Circle của tác giả hay không
      const { user_id } = req.decoded_authorization
      const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
      // Nếu bạn không phải là tác giả và không nằm trong twitter circle thì quăng lỗi
      if (!author._id.equals(user_id) && !isInTwitterCircle) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.FORBIDDEN,
          message: TWEET_MESSAGES.TWEET_IS_NOT_PUBLIC
        })
      }
    }
    next()
  })
  