import payload from 'payload'
import { adminCredentials } from '../fixtures/credentials'
import express from 'express'
import { logInAdmin } from './authToken'

export const globalTeardown = async () => {}

export const globalSetup = async () => {
  const app = express()
  app.use(express.json())

  function listen(port) {
    return new Promise((resolve, reject) => {
      app
        .listen(port)
        .once('listening', function () {
          port = this.address().port
          resolve(port)
        })
        .once('error', reject)
    })
  }

  await payload.init({
    secret: 'secret',
    express: app,
  })

  const port = await listen(0)
  global.__PORT__ = port

  // todo: If test sometimes fail, it's because of some sort of race condition.
  // Awaiting probably fixes it but destroys Mongoose.
  // await setTimeout(3000)

  const response = await fetch(`http://localhost:${port}/api/users/first-register`, {
    body: JSON.stringify({
      email: adminCredentials.email,
      password: adminCredentials.password,
      roles: ['admin'],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
  })

  const data = await response.json()

  if (!data?.user || !data?.user?.token) {
    throw new Error('Failed to register first user')
  }

  const url = `http://localhost:${port}`

  const token = await logInAdmin(url)

  return [url, token]
}
