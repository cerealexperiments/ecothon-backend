import Fastify from 'fastify'
import authRoutes from "./auth"
import { Pool } from "pg"
import multipart from "@fastify/multipart"
import { pipeline } from 'stream';
import fs from 'fs';
import path from 'path';
import staticPlugin from "@fastify/static"
import { promisify } from 'util';
import cors from "@fastify/cors";

const pump = promisify(pipeline)

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


fastify.register(cors, {
  origin: "*"
})
fastify.register(multipart)
fastify.register(staticPlugin, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/', // this is the public URL prefix
});

authRoutes(fastify, pool)


type PortfolioUploadBody = {
  tailorId: number;
}

//file upload endpoints

fastify.post("/uploadTailorPortfolio", async (request, reply) => {
  const queryParameters = request.query as {
    tailorId: string;
  };

  const tailorId = Number(queryParameters.tailorId)
  console.log(tailorId)

  const data = await request.file();
  const newFilename = `tailor-${tailorId}-portfolio-${data!.filename}`
  const filePath = path.join(__dirname, 'uploads', newFilename);

  try {
    await pump(data!.file, fs.createWriteStream(filePath));
    // Here, you can save the file path (filename) to your database
    // ...
    await pool.query(
      'UPDATE tailors SET portfolio = array_append(portfolio, $1) WHERE id = $2',
      [newFilename, tailorId]
    );

    return { success: true, filePath };
  } catch (err) {
    console.error(err);
    reply.code(500).send('Error processing file upload');
  }
}) 


type OrderBody = {
  ordered_by: string;
  ordered_by_id: number;
  details: string;
}

fastify.get("/orders", async(request, reply) => {
  const {userId} = request.query as {
    userId: string;
  };
  const {rows} = await pool.query(`SELECT * FROM orders where ordered_by_id = ${Number(userId)}`);
  return {
    ...rows
  }
})

fastify.post("/order", async(request, reply) => {
  const {ordered_by, ordered_by_id, details} = request.body as OrderBody;
  await pool.query(`INSERT INTO orders (ordered_by, details, ordered_by_id) VALUES ($1, $2, $3)`, [ordered_by, details, ordered_by_id])
  return {
    status: "success",
    order: {
      ordered_by,
      details,
      ordered_by_id
    }
  }
})

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.get("/users", async (request, reply) => {
  const {rows} = await pool.query('SELECT * FROM users;')
  return rows
})

const start = async () => {
  try {
    await fastify.listen({ port: 3030 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
