import request from "supertest"
import {app} from "../src/server.ts"
import { env } from "../env.ts"
import { cleanupDatabase,createTestUser } from "./setup/dbHalpers.ts"
import { except } from "drizzle-orm/gel-core"

describe("authentification Endpoints",()=>{
    afterEach(async()=>{
        await cleanupDatabase()
    })
//     describe('POST /api/auth/register', () => {
//        it('should register a new user with valid data', async () => {
//       const userData = {
//         email: `islam.jdfk@opopo.com`,
//         username: `testuser-${Date.now()}`,
//         password: 'TestPassword123!',
//         firstName: 'Test',
//         lastName: 'User',
//       }

//       const response = await request(app)
//         .post('/api/auth/register')
//         .send(userData)
//         .expect(201)

//       expect(response.body).toHaveProperty('details')
//       expect(response.body).toHaveProperty('token')
//       expect(response.body.details).not.toHaveProperty('password')
//     })
//         it('should return 400 for invalid email', async () => {
//       const userData = {
//         email: 'invalid-email',
//         username: `testuser-${Date.now()}`,
//         password: 'TestPassword123!',
//       }

//       const response = await request(app)
//         .post('/api/auth/register')
//         .send(userData)
//         .expect(400)

//       expect(response.body).toHaveProperty('error', 'Validation failed')
//     })


// })

      describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create a test user first
      const { user, rawPassword } = await createTestUser({
        email: `test-${Date.now()}@pop.com`,
        password: 'TestPassword123!',
      })

      const credentials = {
        email: user.email,
        password: rawPassword,
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Login successful')
      expect(response.body).toHaveProperty('details')
      expect(response.body).toHaveProperty('token')
      expect(response.body.details).not.toHaveProperty('password')
    })
        it('should return 400 for missing email', async () => {
      const credentials = {
        password: 'TestPassword123!',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
    })
})
})