import { de } from 'zod/v4/locales'
import {db} from '../../src/db/connections.ts'
import {users,habits,entries, type NewUser, type NewHabit} from '../../src/db/schema.ts'
import { hashPassword } from '../../src/utils/passwords.ts'
import { generateToken } from '../../src/utils/jwt.ts'

export const createTestUser=async(userData:Partial<NewUser>={})=>{
const defaultData={
    email:`test-${Date.now()}-${Math.random()}@example.com`,
    username:`testuser-${Date.now()}-${Math.random()}`,
    password:'adminpassword1234',
    firstName:'Test',
    lastName:'User(here it;s me) ',
    ...userData
}
const hashedPassword= await hashPassword(defaultData.password)
const [user]= await db.insert(users).values({
...defaultData,
password : hashedPassword
}).returning()
const token = generateToken(
    {
        id:user.id,
        email:user.email,
        username:user.username
    }
)
return{user,token,rawPassword:defaultData.password}
}

export const createHabit=async(userId:string, habitData:Partial<NewHabit>)=>{
    const defaultData={
        name:`Test habit ${Date.now()}`,
        description:' a test habit',
        frequency:'daily',
        targetCount:1,
        ...habitData
    }
    const [habit]= await db.insert(habits).values({
        userId,
        ...defaultData
    }).returning()
    return habit
}

export async function cleanupDatabase() {
  // Clean up in the right order due to foreign key constraints
  await db.delete(entries)
  await db.delete(habits)
  await db.delete(users)
}