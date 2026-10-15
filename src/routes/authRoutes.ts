import { Router } from "express";
import { login, register } from "../controllers/authController.ts";
import { validateBody, validateQuery } from "../middelware/validation.ts";
import {db} from "../db/connections.ts";
import {eq,and,gt } from "drizzle-orm";
import { users } from "../db/schema.ts";
import { z } from "zod";


const loginSchema = z.object({
  email : z.email('invalid email'),
  password : z.string().min(1,'password is required')

})
const registerSchema = z.object({
  username:z.string().min(1,'username is required'),
  email : z.email('invalid email'),
  password : z.string().min(1,'password is required'),
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
})

const router = Router()

router.post('/register',validateBody(registerSchema),register)

router.post('/login',validateBody(loginSchema),login)
// router.get(
//   '/verify',
//   validateQuery(
//     z.object({
//       token: z.string()
//     })
//   ),
//   async (req, res) => {

//     const { token } = req.query as { token: string }

//     const user = await db.query.users.findFirst({
//       where: and(
//         eq(users.verificationToken, token),
//         gt(users.verificationExpires, new Date())
//       )
//     })

//      if (!user) {
//     return res.status(400).json({ error: 'Invalid or expired token' })

    
//   }
//   await db.update(users)
//     .set({ 
//       emailVerified: true,
//       verificationToken: null,
//       verificationExpires: null
//     })
//     .where(eq(users.id, user.id))

//   res.json({ message: 'Email verified successfully' })
//   }
// )


export default router