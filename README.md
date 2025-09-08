# RAG Q&A Application

I have started this project cuz i'm pissed off looking for answer in textbook. i started small where i will gradually increases it from text to pdf and docs but as for now it will be from text. it was a simple RAG project where it will take the data and answers the questions users ask on that data. 

i used nodejs genarally mostly of the people will use python but i'm good at node so i thought of trying with JS.

## Features

- **Express**: The application uses Express.js with a structured routing system (`router/askRouter.js` and `controller/appController.js`) to handle the `/ask` endpoint.
- **LangChain**: Utilizes LangChain for document loading, text splitting, and creating a RAG pipeline.
- **ChromaDB Vector Store**: Replaced the in-memory store with ChromaDB for persistent storage of vector embeddings.
- **Google Gemini**: Uses Gemini for both embedding generation (`gemini-embedding-001`) and large language model (`gemini-1.5-flash`).

## Prerequisites

- Node.js (v18 or higher)
- A Google AI API key - https://aistudio.google.com/
- ChromaDB Cloud credentials (API Key, Tenant, Database Name) - https://www.trychroma.com/

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/seerapusairam/my-rag-app.git
   cd my-rag-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   Create a `.env` file in the root of the project and add your Google AI API key and ChromaDB credentials:
   ```
   GOOGLE_API_KEY=your_google_api_key
   PORT=<port number>
   CHROMA_API_KEY=your_chroma_api_key
   CHROMA_TENANT=your_chroma_tenant
   CHROMA_DATABASE=your_chroma_database_name
   ```

4. **Add your data:**
   Place the text data you want to query in the `data.txt` file.

## Usage

1. **Start the server:**
   ```bash
   npm start
   ```
   The server will be running at `http://localhost:<PORT>`.

2. **Ask a question:**
   You can use a tool like `curl` or Postman to send a POST request to the `/ask` endpoint.

   **Example using `curl`:**
   ```bash
   curl -X POST http://localhost:3000/ask \
   -H "Content-Type: application/json" \
   -d '{"question": "Your question here"}'
   ```

## How It Works

1.  **Indexing**:
    *   When the server starts, the `setupRag` function in `setupRag.js` is called.
    *   It loads the text from `data.txt` using `TextLoader`.
    *   The text is split into smaller chunks using `RecursiveCharacterTextSplitter`.
    *   These chunks are then converted into vector embeddings using `GoogleGenerativeAIEmbeddings` (`gemini-embedding-001`).
    *   The embeddings are then added to a ChromaDB collection.

2.  **Retrieval and Generation**:
    *   The `/ask` endpoint (handled by `router/askRouter.js` and `controller/appController.js`) receives a question.
    *   The `askController` function calls `askQuestion` from `setupRag.js` with the user's question.
    *   A retriever queries the ChromaDB collection for the most relevant document chunks based on the question.
    *   The retrieved chunks and the original question are passed to a prompt template.
    *   The `ChatGoogleGenerativeAI` model (`gemini-1.5-flash`) generates an answer based on the provided context.
    *   The answer is then sent back as a JSON response.

## Project Structure

```
.
├── app.js              # Main Express server setup
├── controller/         # Contains controller logic
│   └── appController.js  # Handles the /ask endpoint logic
├── data.txt            # Your custom data
├── package.json        # Project dependencies and scripts
├── .env                # Environment variables (contains API keys and PORT)
├── README.md           # This file
├── router/             # Contains route definitions
│   └── askRouter.js    # Defines the /ask route
└── setupRag.js         # RAG pipeline logic and ChromaDB integration
