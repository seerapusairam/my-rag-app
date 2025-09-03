import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"; // used to get the ai models
import { TextLoader } from "langchain/document_loaders/fs/text"; // used to load the data
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // used to split the data 
import { CloudClient } from "chromadb"; // imported client to connect chormadb cloud
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import 'dotenv/config';
// --- Initialize the Gemini models --- // this will search for the API key in .env file
const embeddings = new GoogleGenerativeAIEmbeddings({ 
    modelName: "gemini-embedding-001",
});
const llm = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
});

let retrievalChain;

const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE
});

const collection = await client.getOrCreateCollection({
    name: process.env.CHROMA_DATABASE,
    embeddingFunction: async (texts) => {
    return embeddings.embedDocuments(texts); // we are giving our embedding model google
  }
});

async function setupRag() {
    console.log("Setting up RAG with Gemini AI...");
    //load my text
    const load = new TextLoader("./data.txt"); // loader will take the file path and file name which we will use to load
    const file = await load.load(); // document object which has "pageContent-file data","metadata-like source","id"

    //split documents into chunks
    const split = new RecursiveCharacterTextSplitter({ // creating a 200 char chunk with 20-overlap so we wont loss any data
        chunkSize: 200,
        chunkOverlap: 20,
    });
    const splitDocs = await split.splitDocuments(file); //split the text file into induvidual document object 

    
    const texts = splitDocs.map(d => d.pageContent); // pageContent has the data
    const vectors = await embeddings.embedDocuments(texts); // contains embedded values of the data in chunks ex: [0.001,0.034],[0.0121,0.1231]
    console.log(vectors) 
    
    //making the prompt to send to llm model
    // context will take the documents we got in retriever
    const aiPromp = ChatPromptTemplate.fromTemplate(`
        Answer the user's question based only on the following context:
        <context>
        {context}
        </context>

        Question: {input}
    `);

    //combining - "question which user asked + the top documents" and the ai model
    const combineDocsChain = await createStuffDocumentsChain(
        { 
            llm:llm,
            prompt: aiPromp
        });

    //stuff all docs + user question into prompt → call LLM
    retrievalChain = await createRetrievalChain({
        retriever,
        combineDocsChain,
    });
    
    console.log("Gemini RAG pipeline is ready!");
}

export async function askQuestion(question) {
    if (!retrievalChain) {
        throw new Error("I think RAG pipeline caught an error");
    }
    const response = await retrievalChain.invoke({ input: question });// take the user question
    return response.answer; // extract the ans from the response

}

// Initialize the pipeline on startup
setupRag();