export enum UserVerifyStatus{
    Unverified,
    Verrified,
    Banned
}

export enum TokenType{
    AccessToken,
    RefreshToken,
    ForgotPasswordToken,
    EmailVerifyToken
}

export enum MediaType{
    Image,
    Video,
    HLS
}
export enum EncodingStatus{
    Pending, Processing, Success, Failed
}
export enum TweetType{
    Tweet, Retweet, Comment, QuoteTweet
}

export enum TweetAudience{
    Everyone, TwitterCircle
}