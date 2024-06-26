import express, {Request, Response, NextFunction} from 'express';
import usersRouters from './routes/users.routes'
import databaseService from  '~/services/database.services'
const app = express()
const port = 3000
app.use(express.json())

app.use('/users', usersRouters)

databaseService.connect()

app.listen(port, () =>{
    console.log('Listening on http://localhost:3000');
}) 