import { globalSetup, globalTeardown } from './helpers/setup'
import payload from 'payload'
import { cleanupCollections } from './helpers/cleanupCollections'

beforeAll(async () => {
  await globalSetup()
})

afterAll(async () => {
  await globalTeardown()
})

describe('Version', () => {
  beforeEach(async () => {})
  afterEach(async () => {
    await cleanupCollections()
  })

  it('has .versionNumber field', async () => {
    const versionField = payload.collections.versions?.config?.fields.find(
      field => field?.name === 'versionNumber',
    )
    expect(versionField).toBeDefined()
  })
  it('has .base field', async () => {
    const baseField = payload.collections.versions?.config?.fields.find(
      field => field?.name === 'base',
    )
    expect(baseField).toBeDefined()
  })

  it('Sets the version on the base as relationship', async () => {
    let base = await payload.create({
      collection: 'bases',
      data: {},
    })

    base = await payload.findByID({
      collection: 'bases',
      id: base.id,
    })

    await payload.create({
      collection: 'versions',
      data: {
        base: base.id,
        someField: 'someValue',
      },
    })

    base = await payload.findByID({
      collection: 'bases',
      id: base.id,
    })

    expect(base.versions.length).toBe(1)
  })

  it('creates versionNumbers based on the latest known (undeleted) version', async () => {
    let base = await payload.create({
      collection: 'bases',
      data: {},
    })

    base = await payload.findByID({
      collection: 'bases',
      id: base.id,
    })

    const version1 = await payload.create({
      collection: 'versions',
      data: {
        base: base.id,
        someField: 'someValue',
      },
    })

    expect(version1.versionNumber).toBe(1)

    const version2 = await payload.create({
      collection: 'versions',
      data: {
        base: base.id,
        someField: 'someValue',
      },
    })

    expect(version2.versionNumber).toBe(2)

    await payload.delete({
      collection: 'versions',
      id: version2.id,
    })

    const versionAfterDelete = await payload.create({
      collection: 'versions',
      data: {
        base: base.id,
        someField: 'someValue',
      },
    })

    expect(versionAfterDelete.versionNumber).toBe(2)
  })
})
