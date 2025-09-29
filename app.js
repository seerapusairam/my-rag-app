import express from 'express';
import 'dotenv/config'; 
import {router} from './router/askRouter.js'
import { setupRag } from './setupRag.js';
import { setupData } from './setupData.js';

const app = express();
const port = process.env.PORT

app.use(express.json());

app.use('/ask', router);

const start = async () => {
    await setupData(); // Setup data
    await setupRag(); // Setup RAG

    app.listen(port, () => {
        console.log(`Server running at ${port}`);
    });
}

start();
