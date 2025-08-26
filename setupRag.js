import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"; // used to get the ai models
import { TextLoader } from "langchain/document_loaders/fs/text"; // used to load the data
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // used to split the data 
import { MemoryVectorStore } from "langchain/vectorstores/memory"; //in-memory vector store
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

let vectorStore;
let retrievalChain;

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

    //in future i'll add chromedb so we can store the results for long time 
    //right now im using in memory where the data will be deleted after i stopped the app
    vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

    //TODO: in future i'll add chromedb so we can store the results for long time

    const retriever = vectorStore.asRetriever({ k: 2 }); // this will take the top 2 results 
    
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
    const combineDocsChain = await createStuffDocumentsChain({ llm, aiPromp });

    //stuff all docs + user question into prompt → call LLM
    retrievalChain = await createRetrievalChain({
        retriever,
        combineDocsChain,
    });
    
    console.log("Gemini RAG pipeline is ready!");
}

export async function askQuestion(question) {
    if (!retrievalChain) {
        throw new Error("I think RAG pipeline caugth an error");
    }
    const response = await retrievalChain.invoke({ input: question });// take the user question
    return response.answer; // extract the ans from the response

}

// Initialize the pipeline on startup
setupRag();