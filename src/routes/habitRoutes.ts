import { Router } from "express";
import { authenticateToken } from "../middelware/auth.ts";
import { createHabit, deleteHabit, getHabitById, getUserHabit, updateHabit } from "../controllers/habitController.ts";
import { validateBody } from "../middelware/validation.ts";
import {z} from 'zod'

const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  frequency: z.string(),
 
  targetCount: z.number().int().positive().optional().default(1),
  tagIds: z.array(z.string().uuid()).optional(),
})

const router = Router()

router.use(authenticateToken)

router.get('/',getUserHabit)

router.get('/:id',getHabitById)

router.post('/',validateBody(createHabitSchema),createHabit)

router.patch('/:id',updateHabit)


router.delete('/:id',deleteHabit)



export default router