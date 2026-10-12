import { db } from './connections.ts'
import { users, habits, entries, tags, habitTags } from './schema.ts'
// import { hashPassword } from '../utils/password.ts'
const seed =async()=>{
  console.log('🌱 Starting database seed...')

  try {
      // Step 1: Clear existing data (order matters!)
     console.log('Clearing existing data...')
     await db.delete(entries)      // Delete entries first (foreign keys)
     await db.delete(habitTags)    // Delete junction table
     await db.delete(habits)       // Delete habits
     await db.delete(tags)         // Delete tags
     await db.delete(users)        // Delete users last
    
     // Step 2: Create foundation data
    console.log('Creating demo users...')
    // const hashedPassword = await hashPassword('demo123')

    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'demo@habittracker.com',
        username: 'demouser',
        password: 'password',
        firstName: 'Demo',
        lastName: 'User',
      })
      .returning()

      // Step 3: Create tags for categorization
    console.log('Creating tags...')
    const [healthTag] = await db
      .insert(tags)
      .values({ name: 'Health', color: '#10B981' })
      .returning()

    const [productivityTag] = await db
      .insert(tags)
      .values({ name: 'Productivity', color: '#3B82F6' })
      .returning()

       // Step 4: Create habits with relationships
    console.log('Creating demo habits...')
    const [exerciseHabit] = await db
      .insert(habits)
      .values({
        userId: demoUser.id,
        name: 'Exercise',
        description: 'Daily workout routine',
        frequency: 'daily',
        targetCount: 1,
      })
      .returning()

       // Step 5: Create many-to-many relationships
    await db.insert(habitTags).values([
      { habitId: exerciseHabit.id, tagId: healthTag.id },
    ])

 // Step 6: Create historical completion data
    console.log('Adding completion entries...')
    const today = new Date()
    today.setHours(12, 0, 0, 0)

    // Exercise habit - completions for past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      await db.insert(entries).values({
        habitId: exerciseHabit.id,
        completionDate: date
     
      })
    }


 console.log('✅ Database seeded successfully!')
    console.log('\n🔑 user Credentials:')
    console.log(`Email: ${demoUser.email}`)
    console.log(`username: ${demoUser.username}`)
    console.log(`Password: ${demoUser.password}`)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seed
