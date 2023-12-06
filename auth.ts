import { FastifyInstance } from 'fastify';

type UserType = "user" | "tailor";

interface User {
  username: string;
  password: string; 
  userType: UserType;
}

export default async function authRoutes(server: FastifyInstance) {

  let users: User[] = [];

  server.post('/auth/register', async (request, reply) => {
    const { username, password, userType = "user" } = request.body as User;

    const alreadyExists = users.find(user => user.username === username);
    if(alreadyExists) {
      return { status: "error", message: `username ${username} already taken`}
    }
    users.push({ username, password, userType });
    return { status: 'success',  username, password, userType, allUsers: users };
  });

  server.post('/auth/login', async (request, reply) => {
    const { username, password } = request.body as User;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      return { status: 'success', username };
    } else {
      return { status: 'error', message: 'Invalid username or password' };
    }
  });
}
