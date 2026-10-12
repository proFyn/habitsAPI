import {db} from '../../src/db/connections.ts'
import {users,habits,entries,tags,habitTags} from '../../src/db/schema.ts'
import { sql } from 'drizzle-orm'
import { execSync } from 'child_process'

if (process.env.APP_STAGE !== 'test') {
  throw new Error('Refusing to run test setup outside the test stage')
}
export default async function setup() {
    console.log('🗄️ Setting up test database...')

    try {
            // Drop all tables if they exist to ensure clean state
    await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)   
        
    // Use drizzle-kit CLI to push schema to database
    console.log('🚀 Pushing schema using drizzle-kit...')

      execSync(
      `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --force --schema="./src/db/schema.ts" --dialect="postgresql"`,
      {
        stdio: 'inherit',
        cwd: process.cwd(),
      }
   
    )
    console.log('✅ Test database setup complete')
    } catch (e) {
    console.error('❌ Failed to setup test database:', e)
    throw e
        
    }
    return async () => {
    console.log('🧹 Tearing down test database...')

    try {
      // Final cleanup - drop all test data
  await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)


      console.log('✅ Test database teardown complete')
      process.exit(0)
    } catch (error) {
      console.error('❌ Failed to teardown test database:', error)
    }
  }
}

