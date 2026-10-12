import type {Response,Request,NextFunction}from 'express'
import type { AuthenticatedRequest } from '../middelware/auth.ts'
import {db} from '../db/connections.ts'
import { habits,entries,habitTags,tags } from '../db/schema.ts'
import {eq,and,desc,inArray} from 'drizzle-orm'

export const createHabit = async(
    req:AuthenticatedRequest,
    res:Response
)=>{

    try {
        const {name,description,frequency,targetCount,tagIds}= req.body
        
        const result = await db.transaction(async(tx)=>{

            const [newHabit] = await tx.insert(habits).values({
                userId:req.user.id,
                name,
                frequency,
                description,
                targetCount
            }).returning()

            if (tagIds && tagIds.length>0){
                const habitTagValues =tagIds.map((tagId)=>({
                  habitId: newHabit.id,
                   tagId,

                }))
        await tx.insert(habitTags).values(habitTagValues)
            }
        
        return newHabit

        })


    res.status(201).json({
      message: 'Habit created successfully',
      habit: result,
    })
    } catch (e) {
        
    console.error('Create habit error:', e)
    res.status(500).json({ error: 'Failed to create habit' })
    }
}

export const getUserHabit = async(
    req:AuthenticatedRequest,
    res:Response
)=>{


    try {

        const userHabitsWithTags= await db.query.habits.findMany({
            where: eq(habits.userId,req.user.id),
            with :{
                habitTags:{
                    with:{
                        tag: true
                    }    
                }
            },
            orderBy: [desc(habits.createdAt)]
        }    
    )
     // Transform the data to include tags directly
    const habitsWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined, // Remove intermediate relation
    }))

    res.json({
      habits: habitsWithTags,
    })
    } catch (e) {
        
            console.error('Get habits error:', e)
    res.status(500).json({ error: 'Failed to fetch habits' })
    }
}

export const getHabitById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, userId)),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
    })

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    // Transform the data
    const habitWithTags = {
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }

    res.json({
      habit: habitWithTags,
    })
  } catch (error) {
    console.error('Get habit error:', error)
    res.status(500).json({ error: 'Failed to fetch habit' })
  }
}


export const updateHabit = async(
  req: AuthenticatedRequest,
  res: Response
)=>{
try {
    const id = req.params.id
    const {tagIds,...updates}= req.body
    
    const result =  await db.transaction(async(tx)=>{

      const [updatedHabit] = await tx.update(habits).set({...updates,
            updateAt:new Date()}).
            where(and(eq(habits.id, id), eq(habits.userId, req.user.id)))
            .returning()
        if (!updateHabit) {
                    throw new Error('Habit not found')
                  }
                   // If tagIds are provided, update the associations
      if (tagIds !== undefined) {
        // Remove existing tags
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))

        // Add new tags
        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId: string) => ({
            habitId: id,
            tagId,
          }))
          await tx.insert(habitTags).values(habitTagValues)
        }
      }

      return updatedHabit
    })

    res.json({
      message: 'Habit updated successfully',
      habit: result,
    })
} catch (e) {
    console.error('Update habit error:', e)
    res.status(500).json({ error: 'Failed to update habit' })
}
}

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const [deletedHabit] = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning()

    if (!deletedHabit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    res.json({
      message: 'Habit deleted successfully',
    })
  } catch (error) {
    console.error('Delete habit error:', error)
    res.status(500).json({ error: 'Failed to delete habit' })
  }
}