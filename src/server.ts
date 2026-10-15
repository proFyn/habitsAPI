import express from 'express'

import authRoutes from './routes/authRoutes.ts'
import habitRoutes from './routes/habitRoutes.ts'
import userRoutes from './routes/userRoutes.ts'

import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { isTest } from '../env.ts'
import { errorHandler, notFound } from './middelware/errorHandler.ts'
import { APIError } from './middelware/errorHandler.ts'



const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  morgan('combined', {
    skip: () => isTest(),
  })
)
app.get('/health',(req,res)=>{

    res.json({message :'hello'}).status(200)
})
app.get('/',(req,res)=>{

    res.send('welcome :)').status(200)
})



app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/habits',habitRoutes)

app.use(notFound)
app.use(errorHandler)

export {app}
export default app