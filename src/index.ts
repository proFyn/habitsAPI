import app from './server.ts'
import { env } from '../env.ts'

const PORT= env.PORT|| 3000
app.listen(PORT,()=>{
    console.log(`server running on port ${env.PORT}`)
})