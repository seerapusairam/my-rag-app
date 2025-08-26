# my-rag-app

This project is a simple Retrieval-Augmented Generation (RAG) application built with Node.js, Express, and LangChain. It uses Google's Gemini models for embeddings and language generation.

## Features

- **Express Server**: Sets up a simple server with an `/ask` endpoint to handle questions.
- **LangChain Integration**: Utilizes LangChain for document loading, text splitting, and creating a RAG pipeline.
- **In-Memory Vector Store**: Uses an in-memory vector store for simplicity and ease of use.
- **Google Gemini**: Leverages Google's `gemini-embedding-001` for creating embeddings and `gemini-1.5-flash` for generating answers.

## Prerequisites

- Node.js (v18 or higher)
- A Google AI API key

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
   Create a `.env` file in the root of the project and add your Google AI API key:
   ```
   GOOGLE_API_KEY=your_google_api_key
   PORT=<port number>
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
    *   When the server starts, the `setupRagPipeline` function in `rag.js` is called.
    *   It loads the text from `data.txt` using `TextLoader`.
    *   The text is split into smaller chunks using `RecursiveCharacterTextSplitter`.
    *   These chunks are then converted into vector embeddings using `GoogleGenerativeAIEmbeddings` (`gemini-embedding-001`).
    *   The embeddings are stored in an in-memory `MemoryVectorStore`.

2.  **Retrieval and Generation**:
    *   The `/ask` endpoint in `app.js` receives a question.
    *   The `askQuestion` function in `rag.js` is called with the user's question.
    *   A retriever searches the `MemoryVectorStore` for the most relevant document chunks based on the question.
    *   The retrieved chunks and the original question are passed to a prompt template.
    *   The `ChatGoogleGenerativeAI` model (`gemini-1.5-flash`) generates an answer based on the provided context.
    *   The answer is then sent back as a JSON response.

## Project Structure

```
.
├── app.js              # Express server setup
├── rag.js              # RAG pipeline logic
├── data.txt            # Your custom data
├── package.json        # Project dependencies and scripts
├── .env                # Environment variables (contains API key and PORT)
└── README.md           # This file
