import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import 'dotenv/config';
// --- Initialize the Gemini models ---
const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "gemini-embedding-001",
});
const llm = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
});

async function setupRag() {
    console.log("Setting up RAG with Gemini AI...");
    // 1. Load my text
    const loader = new TextLoader("./data.txt"); // loader will take the file path and file name which we will use to load
    const file = await loader.load(); // document object which has "pageContent-file data","metadata-like source","id"

    console.log(file)

}

// Initialize the pipeline on startup
setupRag();