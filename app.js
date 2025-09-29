import express from 'express';
import 'dotenv/config'; 
import {router} from './router/askRouter.js'
import { setupRag } from './setupRag.js'

const app = express();
const port = process.env.PORT

app.use(express.json());

app.use('/ask', router);

const startServer = async () => {
    await setupRag();
    
    app.listen(port, () => {
        console.log(`Server running at ${port}`);
    });
}

startServer();
