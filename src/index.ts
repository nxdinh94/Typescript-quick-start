import express, {Request, Response, NextFunction} from 'express';
import usersRouters from './routes/users.routes'
import databaseService from  '~/services/database.services'
const app = express()
const port = 3000
app.use(express.json())


app.use('/users', usersRouters)

//custom default error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction)=>{
    res.status(400).json({msg: err.message})
})
databaseService.connect()

app.listen(port, () =>{
    console.log('Listening on http://localhost:3000');
}) 