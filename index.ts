import Fastify from 'fastify'
import authRoutes from "./auth"
import { Pool } from "pg"

const fastify = Fastify({
  logger: true
})

const pool = new Pool({
  user: "lain",
  host: "localhost",
  database: "ecothon",
  password: "iwakura",
  port: 5432
})


authRoutes(fastify, pool)

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.get("/users", async (request, reply) => {
  const {rows} = await pool.query('SELECT * FROM users;')
  return rows
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()