import express from 'express';
import 'dotenv/config'; 
import { askQuestion } from './setupRag.js';

const app = express();
const port = process.env.PORT

app.use(express.json());

app.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ msg: 'pls provide the question' });
    }

    try {
        // When a request comes in, it calls your askQuestion function
        const ans = await askQuestion(question);
        res.json({ans});
    } catch (error) {
        res.status(500).json({ msg: 'sorry, i cant process the question' });
    }
});

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});