import type{NextFunction,Request,Response}from 'express'
import{type ZodSchema,ZodError}from 'zod'

import { insertUserSchema } from "../db/schema.ts";
import {db} from "../db/connections.ts";
import {eq,and,gt } from "drizzle-orm";
import { users } from "../db/schema.ts";


export const validateBody =(schema :ZodSchema)=>{
    return (req:Request,res:Response,next:NextFunction)=>{

        try{
            const validateData= schema.parse(req.body)
            req.body=validateData
            next()
        }catch(e){
            if (e instanceof ZodError){
                res.status(400).json({
                    error:"Validation failed",
                    details: e.issues.map((err)=>({
                        field:err.path.join(','),
                        message:err.message
                    }))
                })
            }
            next(e)
        }
    }

}

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid parameters',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        })
      }
      next(error)
    }
  }
}


export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        })
      }
      next(error)
    }
  }
}

export const validatedEmail = async(email)=>{
  const validEmail = await db.select().from(users).where(eq(users.email,email))
}