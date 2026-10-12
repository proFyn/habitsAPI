import type { Request, Response, NextFunction } from 'express'
import env from '../../env.ts'

export class APIError extends Error {
  status: number
  name:string
  message: string
  constructor(message:string,name:string,status:number){
    super()
    this.message=message
    this.name=name
    this.status=status
  }
}

export const errorHandler = (
  err: APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack)

  // Default error
  let status = err.status || 500
  let message = err.message || 'Internal Server Error'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400
    message = 'Validation Error'
  }

  if (err.name === 'UnauthorizedError') {
    status = 401
    message = 'Unauthorized'
  }
  if (err.name ==='ForbiddenError') {
    status = 403
    message = 'Forbidden'
  }
  
  if (err.name ==='NotFoundError') {
      status = 404
      message = 'Not Found'
    }
    
    if (err.name ==='ConflictError') {
        status = 409
        message = 'Conflict'
    }

  res.status(status).json({
    error: message,
    ...(env.APP_STAGE === 'dev' && {
      stack: err.stack,
      details: err.message,
    }),
  })
}


export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new APIError(`Not found - ${req.originalUrl}`,"NotFoundError",404)
  next(err)
}