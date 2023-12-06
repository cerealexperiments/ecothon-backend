import { FastifyInstance } from 'fastify';
import { pipeline } from 'stream';
import fs from 'fs';
import path from 'path';
import util from 'util';

const pump = util.promisify(pipeline);

async function uploadHandler(app: FastifyInstance) {
    app.post('/upload', async (request, reply) => {
        const data = await request.file();
        const filename = path.join(__dirname, 'uploads', data.filename);
        await pump(data.file, fs.createWriteStream(filename));

        // Here, you can save the file path (filename) to your database
        // ...

        return { success: true, filename };
    });
}

export default uploadHandler;