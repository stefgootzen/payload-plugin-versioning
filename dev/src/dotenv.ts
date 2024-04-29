import * as dotenv from 'dotenv'
import path from 'path'

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
const envPath = path.resolve(__dirname, `../${envFile}`)

dotenv.config({
  path: envPath,
})
