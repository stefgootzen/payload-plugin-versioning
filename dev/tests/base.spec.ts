import { globalSetup, globalTeardown } from './helpers/setup'
import payload from 'payload'
import { cleanupCollections } from './helpers/cleanupCollections'
import axios from 'axios'

const postBase = async (url, token, data) => {
  // To prevent axios from leaving an open handle:
  // src: https://stackoverflow.com/questions/69169492/async-external-function-leaves-open-handles-jest-supertest-express
  await process.nextTick(() => {})

  return axios.post(`${url}/api/bases`, data, {
    timeout: 5000,
    headers: {
      Authorization: `JWT ${token}`,
    },
  })
}

let token
let url
beforeAll(async () => {
  ;[url, token] = await globalSetup()
})

afterAll(async () => {
  await globalTeardown()
})

describe('Base', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
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
    const baseData = {}

    await postBase(url, token, baseData)

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
    const baseData = {}
    // const token = await logInAdmin(url)

    const firstVersionData = {
      someField: 'someValue',
    }
    const postData = {
      ...baseData,
      version: firstVersionData,
    }

    await postBase(url, token, postData)

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
    const baseData = {}
    // const token = await logInAdmin(url)

    const firstVersionData = {
      wrongField: 'someValue',
    }
    const postData = {
      ...baseData,
      version: firstVersionData,
    }

    await postBase(url, token, postData)

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
