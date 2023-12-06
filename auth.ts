import { FastifyInstance } from 'fastify';
import { Pool } from 'pg';

type User = {
  name: string;
  email: string;
  password: string;
  profile_picture?: string;
  additional_info?: string;
}

type Tailor = {
  name: string;
  email: string;
  password: string;
  category?: string;
  additionalInfo?: string;
  profile_picture?: string;
  portfolio?: string[];
}

export default async function authRoutes(server: FastifyInstance, pool: Pool ) {

  server.post('/auth/registerUser', async (request, reply) => {
    const {name, email, password } = request.body as User;
    await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, password]);

    return {
      status: "success",
      user: {
        name, email, password
      }
    }
  });

  server.post('/auth/registerTailor', async (request, reply) => {
    const {name, email, password, category = "universal"} = request.body as Tailor;
    await pool.query('INSERT INTO tailors (name, email, password, category) VALUES ($1, $2, $3, $4)', [name, email, password, category]);

    return {
      status: "success",
      user: {
        name, email, password, category
      }
    }
  })

  server.post('/auth/login', async (request, reply) => {
  });
}
