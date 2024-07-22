import { TweetAudience, TweetType } from "~/constants/enum";
import { Media } from "../Others";

export interface CreateTweetReqBody{
    type: TweetType
    audience: TweetAudience
    content: string
    parent_id: null | string 
    hashtags: string[]
    mentions: string[]
    medias: Media[]
}