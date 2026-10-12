import type { NextFunction, Request,Response } from "express";
import bcrypt from 'bcrypt'
import {db} from '../db/connections.ts'
import {users, type NewUser}from '../db/schema.ts'
import { generateToken } from "../utils/jwt.ts";
import { comparePssword, hashPassword } from "../utils/passwords.ts";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.ts";
import { eq,or } from "drizzle-orm";
import { APIError } from "../middelware/errorHandler.ts";


export const register = async(req:Request<any,any,NewUser>,res:Response)=>{
 
        const {email,username,password,firstName,lastName}= req.body
        // verify existing email and user
        const existing = await db
          .select({ email: users.email, username: users.username })
          .from(users)
          .where(or(eq(users.email, email), eq(users.username, username)));
              if (existing.some((u) => u.email === email)) {
                throw new APIError("Email already in use", "ConflictError", 409);
              }
              if (existing.some((u) => u.username === username)) {
                throw new APIError("Username already taken", "ConflictError", 409);
              }
        const hashedPassword= await hashPassword(password)
        const [user]=await db.insert(users).values({
            
          ...req.body,
            password:hashedPassword,
            emailVerified: false,
            verificationToken : crypto.randomBytes(32).toString("hex"),
            verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
           
        }).returning({
            id:users.id,
            email:users.email,
            username:users.username,
            firstName:users.firstName,
            lastName:users.lastName,
            createdAt:users.createdAt,
            emailVerified:users.emailVerified,
            verificationToken:users.verificationToken
            
        })
    
        // Generate JWT for auto-login
    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    // 2. Send verification email
  
    try {
      
      await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `
        <h1>Welcome!</h1>
        <p>Please verify your email by clicking:</p>
        <a href="http://localhost:3000/api/auth/verify?token=${user.verificationToken}">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      `
    })
    } catch (e) {
      console.error("error in sending email " , e)
    }

    const { verificationToken, ...details } = user
    return res.status(201).json({
        message: 'Account created. Please check your email to verify.',
        requiresVerification: true,
        details,
        token
    })
  
    }


export const login = async(req:Request,res:Response,next:NextFunction)=>{
    const {email,password}= req.body

   const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user){
  
      throw new APIError("invalid credentials","UnauthorizedError",401)
      // return res.status(401).json({
      //   error:'invalid credentials'
      // })
    }
    const isValidedPassword = await comparePssword(password,user.password)

    if (!isValidedPassword){
        throw new APIError("invalid credentials","UnauthorizedError",401)

      // return res.status(401).json({
      //   error:"invalid credentials"
      // })
    }
    if (!user.emailVerified){
        throw new APIError("Please verify your email first","ForbiddenError",403)

      // return res.status(401).json({
      //   error : "email isn't valid,Please check your email to verify."
      // })
    }
    const token = await generateToken({
      id : user.id,
      email : user.email,
      username : user.username
    })

    return res.json({
      message : 'Login successful',
      details :{
            id:user.id,
            email:user.email,
            username:user.username,
            firstName:user.firstName,
            lastName:user.lastName
      },
      token
    })

  }

