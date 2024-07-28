import { TweetAudience, TweetType } from "~/constants/enum";
import { Media } from "../Others";
import { ParamsDictionary, Query } from 'express-serve-static-core'

export interface CreateTweetReqBody{
    type: TweetType
    audience: TweetAudience
    content: string
    parent_id: null | string 
    hashtags: string[]
    mentions: string[]
    medias: Media[]
}
export interface TweetQuery extends Pagination, Query {
    tweet_type: string
}
  
export interface TweetParam extends ParamsDictionary {
    tweet_id: string
}
  

export interface Pagination {
    limit: string
    page: string
}