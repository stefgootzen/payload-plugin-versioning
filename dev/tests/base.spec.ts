import { getPayload, type Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import config from '@payload-config'
import { cleanupCollections } from './helpers/cleanupCollections.js'
import { devUser } from '../helpers/credentials.js'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {})

describe('Base', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  beforeEach(async () => {})
  afterEach(async () => {
    await cleanupCollections(payload)
  })
  it('has .versions field', async () => {
    const versionField = payload.collections.bases?.config?.fields.find(
      // @ts-ignore
      (field) => field?.name === 'versions',
    )
    expect(versionField).toBeDefined()
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

  it('does not create a version, if no version data is passed.', async () => {
    return payload.create({
      collection: 'bases',
      data: {},
    })

    const bases = await payload.find({
      collection: 'bases',
    })
    expect(bases.totalDocs).toBe(1)

    const versions = await payload.find({
      collection: 'versions',
    })
    expect(versions.totalDocs).toBe(0)
  })

  it('creates a version, if version data is passed.', async () => {
    const userResult = await payload.find({
      collection: 'users',
      where: {
        email: { equals: devUser.email },
      },
    })

    const user = userResult.docs[0]

    const firstVersionData = {
      someField: 'someValue',
    }

    await payload.create({
      collection: 'bases',
      data: {},
      context: {
        version: firstVersionData,
      },
      user,
    })

    const bases = await payload.find({
      collection: 'bases',
    })

    const versions = await payload.find({
      collection: 'versions',
    })

    expect(bases.totalDocs).toBe(1)
    expect(versions.totalDocs).toBe(1)

    expect(versions.docs[0]).toHaveProperty('createdBy') // true
  })

  it('rollbacks itself, when version data is passed, but required values for it are missing.', async () => {
    const firstVersionData = {
      wrongField: 'someValue',
    }

    await payload.create({
      collection: 'bases',
      data: {},
      context: {
        version: firstVersionData,
      },
    })

    const bases = await payload.find({
      collection: 'bases',
    })
    expect(bases.totalDocs).toBe(0)

    const versions = await payload.find({
      collection: 'versions',
    })
    expect(versions.totalDocs).toBe(0)
  })
})
