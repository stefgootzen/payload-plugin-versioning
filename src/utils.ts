import { Payload } from 'payload'
import { Document } from './types'

export const isString = (thing: any) => {
  return typeof thing === 'string' || thing instanceof String
}

// Extends document
export const getResourceId = <T extends Document>(resourceOrId: T | string): string => {
  if (isString(resourceOrId)) {
    return resourceOrId as string
  }

  // @ts-ignore
  return resourceOrId.id
}

export const getResource = async <T extends Document>(
  resourceOrId: T | string,
  collection: string,
  payload: Payload,
  req: Request,
): Promise<T> => {
  // @ts-ignore
  if (!isString(resourceOrId)) {
    return resourceOrId as T
  }

  const options = {
    collection: collection,
    id: resourceOrId as string,
    req,
  }

  return payload.findByID(options) as Promise<T>
}
