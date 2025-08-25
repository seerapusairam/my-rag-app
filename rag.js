import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"; // used to get the ai models
import { TextLoader } from "langchain/document_loaders/fs/text"; // used to load the data
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // used to split the data 
import 'dotenv/config';
// --- Initialize the Gemini models --- // this will search for the API key in .env file
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

    // 2. Split documents into chunks
    const split = new RecursiveCharacterTextSplitter({ // creating a 200 char chunk with 20-overlap so we wont loss any data
        chunkSize: 200,
        chunkOverlap: 20,
    });
    const splitDocs = await split.splitDocuments(file); //split the text file into induvidual document object 

    console.log(splitDocs)
}

// Initialize the pipeline on startup
setupRag();