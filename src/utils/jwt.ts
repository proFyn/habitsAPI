import {SignJWT,type JWTPayload,jwtVerify, decodeJwt} from 'jose'

import {createSecretKey} from 'node:crypto'

import {env} from '../../env.ts'

export interface MyJwtPayload extends JWTPayload{
  id: string
  email: string
  username: string
}

export const generateToken = (payload: MyJwtPayload) => {
  const secret = env.JWT_SECRET
  const secretKey = createSecretKey(secret, 'utf-8')

	return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || '7d')
    .sign(secretKey)
}

export const verifyToken = async(token:string): Promise<MyJwtPayload>=>{

const secretKey = createSecretKey(env.JWT_SECRET, 'utf-8')
  const { payload } = await jwtVerify(token, secretKey)

  return {
    id: payload.id as string,
    email: payload.email as string,
    username: payload.username as string,
  } 
}