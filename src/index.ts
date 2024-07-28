import express, {Request, Response, NextFunction} from 'express';
import usersRouters from './routes/users.routes'
import databaseService from  '~/services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middleware';
import tweetsRouter from './routes/tweets.routes';
import bookmarksRouter from './routes/bookmarks.routes';
// import '~/ultils/faker'


databaseService.connect()
const app = express()
const port = process.env.PORT
app.use(express.json())

app.use('/users', usersRouters)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)

//custom default error handler
app.use(defaultErrorHandler)


app.listen(port, () =>{
    console.log(`Listening on http://localhost:${port}`);
}) 