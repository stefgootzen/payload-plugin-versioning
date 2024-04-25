import type { Server } from 'http'
import mongoose from 'mongoose'
import payload from 'payload'
import { start } from './src/server'

describe('Plugin tests', () => {
  let server: Server

  beforeAll(async () => {
    await start({ local: true })
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    server.close()
  })

  // Add tests to ensure that the plugin works as expected

  it('base field is set on versions', async () => {

  })
  it('versions field is set on base', async () => {

  })

  // base is set on child
  // Example test to check for seeded data
  // VersionNumber is set
  // Deleting and adding stuff
  it('seeds data accordingly', async () => {
    const newCollectionQuery = await payload.find({
      collection: 'new-collection',
      sort: 'createdAt',
    })

    expect(newCollectionQuery.totalDocs).toEqual(1)
  })
})
