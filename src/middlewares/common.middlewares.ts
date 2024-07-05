import { NextFunction, Request, Response } from "express"
import { pick } from "lodash"

// An array get item from key of T
type FilterKeys<T> = Array<keyof T>

export const filterMiddleware =<T> (filterKeys: FilterKeys<T>)  => (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
} 