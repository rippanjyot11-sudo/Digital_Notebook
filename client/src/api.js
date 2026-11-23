const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const getToken = () => localStorage.getItem("accessToken");
const setToken = (token) => {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
};

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  const payload = await response.json().catch(() => ({
    success: false,
    message: "The server returned an invalid response"
  }));

  if (!response.ok) {
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const api = {
  setToken,
  clearToken: () => setToken(null),
  register: (body) => request("/api/v1/users/register", {
    method: "POST",
    body: JSON.stringify(body)
  }),
  login: (body) => request("/api/v1/users/login", {
    method: "POST",
    body: JSON.stringify(body)
  }),
  logout: () => request("/api/v1/users/logout", { method: "POST" }),
  currentUser: () => request("/api/v1/users/current-user"),
  subjects: () => request("/api/v1/subjects/allsubjects"),
  createSubject: (name) => request("/api/v1/subjects/createsubject", {
    method: "POST",
    body: JSON.stringify({ name })
  }),
  updateSubject: (id, name) => request(`/api/v1/subjects/updateSub/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name })
  }),
  deleteSubject: (id) => request(`/api/v1/subjects/deleteSub/${id}`, {
    method: "DELETE"
  }),
  notes: (subjectId, page = 1) =>
    request(`/api/v1/notes/allnotes/${subjectId}?page=${page}&limit=50`),
  createNote: (subjectId, body) =>
    request(`/api/v1/notes/createnote/${subjectId}`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateNote: (subjectId, noteId, body) =>
    request(`/api/v1/notes/updatenote/${noteId}/${subjectId}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  deleteNote: (subjectId, noteId) =>
    request(`/api/v1/notes/deletenote/${noteId}/${subjectId}`, {
      method: "DELETE"
    }),
  summarizeNote: (noteId) =>
    request(`/api/v1/ai/summarize/${noteId}`, { method: "POST" }),
  generateQuestions: (noteId) =>
    request(`/api/v1/ai/questiongenerate/${noteId}`, { method: "POST" }),
  ingestNote: (noteId) =>
    request(`/api/v1/ai/ingest/${noteId}`, { method: "POST" }),
  askStudyQuestion: (question, subjectId) =>
    request("/api/v1/ai/query", {
      method: "POST",
      body: JSON.stringify({ question, subjectId })
    })
};
