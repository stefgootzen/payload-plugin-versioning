import { globalSetup, globalTeardown } from './helpers/setup'
import payload from 'payload'
import { cleanupCollections } from './helpers/cleanupCollections'

beforeAll(async () => {
  await globalSetup()
})

afterAll(async () => {
  await globalTeardown()
})

describe('Base', () => {
  beforeEach(async () => {})
  afterEach(async () => {
    await cleanupCollections()
  })
  it('has .versions field', async () => {
    const versionField = payload.collections.bases?.config?.fields.find(
      field => field?.name === 'versions',
    )
    expect(versionField).toBeDefined()
  })
  it('creates a version on create', async () => {
    const base = await payload.create({
      collection: 'bases',
      data: {},
    })

    const versions = await payload.find({
      collection: 'versions',
      where: {
        base: {
          equals: base.id,
        },
      },
    })

    expect(versions.totalDocs).toBe(1)
  })

  it('deletes corresponding versions on delete', async () => {
    const base = await payload.create({
      collection: 'bases',
      data: {},
    })
    await payload.delete({
      collection: 'bases',
      id: base.id,
    })

    const versions = await payload.find({
      collection: 'versions',
      where: {
        base: {
          equals: base.id,
        },
      },
    })

    expect(versions.totalDocs).toBe(0)
  })
})
