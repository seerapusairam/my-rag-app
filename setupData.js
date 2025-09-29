import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"; // Imports Google's Generative AI models for embeddings.
import { TextLoader } from "langchain/document_loaders/fs/text"; // Imports a loader for text files.
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // Imports a utility to split text into smaller chunks.
import { CloudClient } from "chromadb"; // Imports the client to connect to ChromaDB cloud.
import { Document } from "langchain/document"; // Imports the Document class for handling text content and metadata.
import 'dotenv/config'; // Configures dotenv to load environment variables from a .env file.

// Create a new instance of GoogleGenerativeAIEmbeddings for text embedding.
const embeddings = new GoogleGenerativeAIEmbeddings({ 
    modelName: "gemini-embedding-001", // Use the "gemini-embedding-001" model for generating embeddings.
});

// Create a new ChromaDB client using API key, tenant, and database name from environment variables.
const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY, // API key for authenticating with ChromaDB.
  tenant: process.env.CHROMA_TENANT, // Tenant ID for the ChromaDB instance.
  database: process.env.CHROMA_DATABASE // Database name to connect to in ChromaDB.
});

let collection; // Declare a variable to store the ChromaDB collection after it's initialized.

/**
 * Sets up the data by loading, splitting, embedding, and storing documents in ChromaDB.
 * This function is responsible for preparing the knowledge base for the RAG pipeline.
 */
export async function setupData() {
    console.log("Setting up data with ChromaDB...");

    // Get or create a ChromaDB collection.
    collection = await client.getOrCreateCollection({
        name: process.env.CHROMA_DATABASE, // Use the database name from environment variables for the collection.
        embeddingFunction: async (texts) => {
            return embeddings.embedDocuments(texts); // Use the Gemini embedding model to create embeddings for documents.
        }
    });

    // Load text data from the 'data.txt' file.
    const load = new TextLoader("./data.txt"); // Initialize a TextLoader to read from 'data.txt'.
    const file = await load.load(); // Load the content of the text file.

    // Split the loaded documents into smaller chunks.
    const split = new RecursiveCharacterTextSplitter({ // Configure the text splitter.
        chunkSize: 200, // Each chunk will have a maximum of 200 characters.
        chunkOverlap: 20, // Chunks will overlap by 20 characters to maintain context between them.
    });
    const splitDocs = await split.splitDocuments(file); // Split the loaded document into smaller, manageable parts.

    // Extract page content and generate embeddings for each chunk.
    const texts = splitDocs.map(d => d.pageContent); // Get the plain text content from each split document.
    const vectors = await embeddings.embedDocuments(texts); // Generate vector embeddings for these text chunks using the Gemini model.

    // Add the processed documents and their embeddings to ChromaDB.
    await collection.add({
        ids: splitDocs.map((_, i) => `${i}`), // Assign unique string IDs to each document based on its index.
        embeddings: vectors, // Store the generated embedding vectors for similarity search.
        documents: texts, // Store the original text content of the document chunks.
        metadatas: splitDocs.map(d => {
            return { source: JSON.stringify(d.metadata || {}) }; // Store metadata for each document, converting it to a JSON string.
        }),
    });
    console.log("documents added to ChromaDB.");
}

//Custom retriever function that queries ChromaDB for relevant documents based on a user's query.
export async function customRetriever(query) {
    // Extract the query string from the input object.
    const queryString = query.input; // Get the actual query string from the input object.
    const queryVector = await embeddings.embedQuery(queryString); // Embed the user's query into a vector for comparison.

    // Query ChromaDB to find the top 2 most relevant documents.
    const result = await collection.query({
        queryEmbeddings: [queryVector], // Use the query vector to search for similar documents in the collection.
        n_results: 2, // Retrieve the top 2 most relevant results.
    });

    // Extract documents and metadatas from the query result.
    const docsArray = Array.isArray(result.documents?.[0]) ? result.documents[0] : []; // Safely extract the first array of documents.
    const metadatasArray = Array.isArray(result.metadatas?.[0]) ? result.metadatas[0] : []; // Safely extract the first array of metadatas.

    // Convert retrieved texts and metadatas into Langchain Document objects.
    const documents = docsArray.map((text, i) => new Document({
        pageContent: text, // The content of the retrieved document.
        metadata: metadatasArray[i] || {}, // Associated metadata for the document, or an empty object if none.
    }));

    return documents; // Return the array of Langchain Document objects.
}
