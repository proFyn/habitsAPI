import { Router } from "express";
import { validateBody } from "../middelware/validation.ts";
import z from 'zod'
import { authenticateToken } from "../middelware/auth.ts";

const zodschema= z.object({
    name:z.string()
})
const router = Router()

router.use(authenticateToken)

router.get('/',(req,res)=>{

res.json({message:'get all users'})
})

router.get('/:id',(req,res)=>{

res.json({message:'got user'})
})

router.put('/',validateBody(zodschema),(req,res)=>{

res.json({message:'user updated'})
})


router.delete('/:id',(req,res)=>{

res.json({message:'user deleted'})
})

export default router