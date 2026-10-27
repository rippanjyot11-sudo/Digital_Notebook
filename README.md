# 📚 Digital Notebook — AI-Powered Study Assistant

Digital Notebook is an AI-integrated study and note management application built to help students organize their study materials, manage subjects, track study sessions, and learn more effectively using Artificial Intelligence.

The project combines a Node.js and Express.js backend with a Python-based AI service to provide intelligent note summarization, question generation, and Retrieval-Augmented Generation (RAG).

## ✨ Features

### 📝 Notes & Subject Management
- Create, read, update, and delete notes and subjects.
- Organize notes subject-wise.
- Search notes by title and subject.
- Pagination and sorting of notes.
- Track study sessions and study duration.
- Associate notes and subjects with individual users.

### 🔐 Authentication & Security
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Access and refresh token support.
- Protected API routes.
- User-specific data access.

### 🤖 AI-Powered Features

**1. AI Note Summarizer**
- Generates concise summaries from lengthy study notes.
- Helps students revise important concepts quickly.

**2. AI Question Generator**
- Generates practice questions based on note content.
- Helps students test their understanding and prepare for examinations.

**3. Retrieval-Augmented Generation (RAG)**
- Splits notes into smaller text chunks.
- Generates vector embeddings using Sentence Transformers.
- Stores and retrieves relevant chunks using ChromaDB.
- Retrieves context relevant to a user's query.
- Supports context-aware answer generation using retrieved study material.
- Stores metadata such as user ID, subject ID, and note ID to associate chunks with their source.

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose, MongoDB Atlas |
| Authentication | JWT, bcrypt |
| AI Service | Python, FastAPI |
| LLM Integration | LangChain, Hugging Face |
| Embeddings | Sentence Transformers |
| Vector Database | ChromaDB |
| File Uploads | Multer, Cloudinary |
| API Testing | Postman |
| Version Control | Git, GitHub |

## 🏗️ System Architecture

The application consists of two main services:

- **Node.js + Express.js:** Handles authentication, notes, subjects, study tracking, and REST APIs.
- **Python + FastAPI:** Handles AI summarization, question generation, document ingestion, context retrieval, and answer generation.

MongoDB stores application data, while ChromaDB stores note embeddings and associated metadata for semantic retrieval.

```text
                  Client / Postman
                         |
                         v
               Node.js + Express API
                    Port 8000
                         |
               +---------+---------+
               |                   |
               v                   v
          MongoDB Atlas       Python AI Service
                                FastAPI
                               Port 8001
                                   |
                         +---------+---------+
                         |                   |
                         v                   v
                  Hugging Face          ChromaDB
                  + LangChain        Vector Storage
                         |
                         v
                  AI-Generated Results
```

## 🔄 RAG Workflow

1. Create a subject and add study notes.
2. Send a request to ingest a note into the AI service.
3. Split the note into smaller chunks.
4. Generate embeddings for the chunks.
5. Store the embeddings and metadata in ChromaDB.
6. Submit a query to retrieve relevant chunks.
7. Pass the retrieved context to the answer-generation component.
8. Generate a context-aware response based on the retrieved study material.

User-specific metadata filtering is important to ensure that retrieval only accesses notes the user is authorized to view.

## 📁 Project Structure

```text
Digital_Notebook/
│
├── ai.service/
│   ├── main.py
│   ├── summarize.py
│   ├── question_generate.py
│   ├── rag_gen.py
│   ├── rag_ingest.py
│   ├── rag_retrieval.py
│   └── chroma_db/
│
├── src/
│   ├── controller/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── app.js
├── index.js
├── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Python and pip
- MongoDB Atlas account or a MongoDB instance
- Hugging Face access token if required by the configured model

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Digital_Notebook
```

### 2. Run the Node.js Backend

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root and configure the required environment variables:

```env
PORT=8000
DB_name=Digitalbook
MONGODB_URI=<YOUR_MONGODB_URI>
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=<YOUR_ACCESS_TOKEN_SECRET>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<YOUR_REFRESH_TOKEN_SECRET>
REFRESH_TOKEN_EXPIRY=10d
```

Start the backend using the script defined in `package.json`. For example:

```bash
npm run dev
```

### 3. Run the Python AI Service

Open a separate terminal:

```bash
cd ai.service
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the Python dependencies listed in your project's dependency file, then configure the AI service's required environment variables.

Start the FastAPI application:

```bash
uvicorn main:app --reload --port 8001
```

The command assumes that `main.py` defines a FastAPI application named `app`.

### 4. Access the Services

- Node.js backend: `http://localhost:8000`
- Python AI service: `http://localhost:8001`
- FastAPI interactive documentation: `http://localhost:8001/docs`

## 🔌 AI API Endpoints

The Express AI router includes the following endpoint patterns:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/ai/summarize/:note_id` | Summarize a note |
| POST | `/api/v1/ai/questiongenerate/:note_id` | Generate questions from a note |
| POST | `/api/v1/ai/ingest/:note_id` | Ingest a note into the RAG pipeline |

These paths assume the AI router is mounted at `/api/v1/ai`. Confirm the actual route mounting and endpoint definitions in the source code.

The Python AI service also provides functionality for note summarization, question generation, ingestion, retrieval, and answer generation, according to its configured routes.

## 🧪 Testing

API endpoints can be tested using Postman.

Suggested testing workflow:

1. Register or log in to obtain authentication credentials.
2. Create a subject.
3. Create a note linked to that subject.
4. Test note CRUD operations.
5. Test AI summarization and question generation.
6. Ingest the note into the RAG pipeline.
7. Test context retrieval and context-aware answer generation.

## 🔒 Security

- Keep database credentials, API tokens, and JWT secrets private.
- Never commit `.env` files to GitHub.
- Configure appropriate CORS origins for production.
- Validate authentication and ownership of notes and subjects.
- Apply user-level filters during vector retrieval.

## 🔮 Future Improvements

- Frontend integration for a complete user experience.
- Cloud deployment of the backend and AI service.
- Docker containerization and Docker Compose.
- CI/CD pipeline automation.
- Automated testing and monitoring.
- Further improvements to conversational and context-aware AI features.

## 👩‍💻 Author

**Rippan Jot Kaur**

*An AI-powered study companion designed to make learning, revision, and knowledge retrieval more efficient.*

