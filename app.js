import express from 'express';
import 'dotenv/config'; 
import {router} from './router/askRouter.js'

const app = express();
const port = process.env.PORT

app.use(express.json());

app.post('/ask', router);

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});