import { Config } from 'payload/generated-types'
import payload from 'payload'

type ValueOf<T> = T[keyof T]

export type CollectionType = ValueOf<Config['collections']>

export const isString = (resource: CollectionType | string) => {
  return typeof resource === 'string' || resource instanceof String
}

export const getResourceId = (resourceOrId: CollectionType | string): string => {
  if (isString(resourceOrId)) {
    return resourceOrId as string
  }

  // @ts-ignore
  return resourceOrId.id
}

export const getResource = <CollectionType>(
  resourceOrId: CollectionType | string,
  collection: keyof Config['collections'],
): Promise<CollectionType> => {
  if (!isString(resourceOrId)) {
    return resourceOrId
  }

  const options = {
    collection,
    id: resourceOrId,
  }

  return payload.findByID(options) as Promise<CollectionType>
}
