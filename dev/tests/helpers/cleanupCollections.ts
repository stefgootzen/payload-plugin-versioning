import { Payload } from 'payload'

export const cleanupCollections = async (payload: Payload) => {
  const collections = payload.collections
  let collectionNames = Object.keys(collections)
  collectionNames = collectionNames.filter((name) => name !== 'users')

  const promises = collectionNames.map((collectionName) => {
    return payload.db.collections[collectionName].deleteMany({})
  })

  await Promise.all(promises)
}
