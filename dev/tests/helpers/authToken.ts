import { User } from 'payload/generated-types'
import { adminCredentials } from '../fixtures/credentials'

type Credentials = {
  email: string
  password: string
}
export const logIn = async (url: string, credentials: Credentials) => {
  const result: {
    token: string
    user: User
  } = await fetch(`${url}/api/users/login`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  }).then(res => res.json())
  return result.token
}

export const logInAdmin = async (url: string) => {
  return logIn(url, {
    email: adminCredentials.email,
    password: adminCredentials.password,
  })
}
