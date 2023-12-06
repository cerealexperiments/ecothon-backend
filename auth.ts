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

type LoginType = {
  email: string;
  password: string;
  userType: string;
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
    const {userType, email, password} = request.body as LoginType;
    if(userType === "user") {
      const {rows} = await pool.query(`select * from users where email = $1 and password = $2`, [email, password]);
      if(rows.length === 0) {
        return {
          message: "user not found"
        }
      }
      return {
        user: rows[0] 
      }
    } else {
      const {rows} = await pool.query(`select * from tailors where email = $1 and password = $2`, [email, password]);
      if(rows.length === 0) {
        return {
          message: "user not found"
        }
      }
      return {
        user: rows[0] 
      }
    }
  });
}
