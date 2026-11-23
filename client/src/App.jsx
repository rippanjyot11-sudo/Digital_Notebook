import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const emptySubject = "";
const emptyNote = { title: "", content: "" };

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = mode === "login"
        ? await api.login({
            email: form.email || undefined,
            username: form.username || undefined,
            password: form.password
          })
        : await api.register(form);

      if (mode === "login") {
        api.setToken(payload.data.accessToken);
        onAuthenticated(payload.data.user);
      } else {
        setMode("login");
        setForm((current) => ({ ...current, password: "" }));
        setError("Account created. Please log in.");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark">DN</div>
        <p className="eyebrow">Digital Notebook</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your notebook"}</h1>
        <p className="muted">
          {mode === "login"
            ? "Sign in to continue where you left off."
            : "Start organizing subjects and study notes."}
        </p>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Full name
              <input name="fullname" value={form.fullname} onChange={update} required />
            </label>
          )}
          {mode === "register" && (
            <label>
              Username
              <input name="username" value={form.username} onChange={update} required />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              required
            />
          </label>
          {mode === "login" && (
            <label>
              Username <span className="optional">(or use email)</span>
              <input name="username" value={form.username} onChange={update} />
            </label>
          )}
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              minLength={6}
              required
            />
          </label>
          {error && (
            <p className={error.includes("created") ? "notice" : "form-error"}>
              {error}
            </p>
          )}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setMode((current) => current === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [subjectDraft, setSubjectDraft] = useState(emptySubject);
  const [noteDraft, setNoteDraft] = useState(emptyNote);
  const [subjectModal, setSubjectModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [studyQuestion, setStudyQuestion] = useState("");

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject._id === selectedSubjectId),
    [subjects, selectedSubjectId]
  );

  const loadSubjects = async () => {
    const payload = await api.subjects();
    setSubjects(payload.data);
    setSelectedSubjectId((current) =>
      payload.data.some((subject) => subject._id === current)
        ? current
        : payload.data[0]?._id || ""
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    api.currentUser()
      .then((payload) => {
        setUser(payload.data);
        return loadSubjects();
      })
      .catch(() => {
        api.clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) {
      setNotes([]);
      setSelectedNote(null);
      setAiResult(null);
      return;
    }
    api.notes(selectedSubjectId)
      .then((payload) => {
        setNotes(payload.data.notes);
        setSelectedNote(payload.data.notes[0] || null);
      })
      .catch((requestError) => setError(requestError.message));
  }, [selectedSubjectId]);

  useEffect(() => {
    setAiResult(null);
  }, [selectedNote?._id]);

  const runAiAction = async (action) => {
    if (!selectedNote) return;
    setAiBusy(true);
    setError("");
    setAiResult(null);
    try {
      const payload = await action(selectedNote._id);
      setAiResult(payload.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAiBusy(false);
    }
  };

  const askQuestion = async (event) => {
    event.preventDefault();
    if (!studyQuestion.trim() || !selectedSubjectId) return;
    setAiBusy(true);
    setError("");
    setAiResult(null);
    try {
      const payload = await api.askStudyQuestion(studyQuestion.trim(), selectedSubjectId);
      setAiResult(payload.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAiBusy(false);
    }
  };

  const createSubject = async (event) => {
    event.preventDefault();
    try {
      await api.createSubject(subjectDraft);
      setSubjectDraft("");
      setSubjectModal(false);
      await loadSubjects();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const saveNote = async (event) => {
    event.preventDefault();
    if (!selectedSubjectId) return;
    try {
      if (selectedNote?._id) {
        await api.updateNote(selectedSubjectId, selectedNote._id, noteDraft);
      } else {
        await api.createNote(selectedSubjectId, noteDraft);
      }
      setNoteModal(false);
      setNoteDraft(emptyNote);
      const payload = await api.notes(selectedSubjectId);
      setNotes(payload.data.notes);
      setSelectedNote(payload.data.notes.find((note) => note.title === noteDraft.title)
        || payload.data.notes[0]
        || null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const editNote = (note) => {
    setSelectedNote(note);
    setNoteDraft({ title: note.title, content: note.content || "" });
    setNoteModal(true);
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.deleteNote(selectedSubjectId, noteId);
      setNotes((current) => current.filter((note) => note._id !== noteId));
      setSelectedNote(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      api.clearToken();
      setUser(null);
      setSubjects([]);
      setNotes([]);
    }
  };

  if (loading) return <main className="loading">Loading your notebook...</main>;
  if (!user) {
    return (
      <AuthScreen
        onAuthenticated={async (authenticatedUser) => {
          setUser(authenticatedUser);
          await loadSubjects();
        }}
      />
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">DN</div>
          <span>Notebook</span>
        </div>

        <div className="sidebar-heading">
          <span>Subjects</span>
          <button
            className="icon-button"
            type="button"
            onClick={() => setSubjectModal(true)}
            aria-label="Add subject"
          >
            +
          </button>
        </div>

        <nav className="subject-list">
          {subjects.map((subject) => (
            <button
              key={subject._id}
              type="button"
              className={subject._id === selectedSubjectId ? "active" : ""}
              onClick={() => setSelectedSubjectId(subject._id)}
            >
              {subject.name}
            </button>
          ))}
          {!subjects.length && <p className="empty-sidebar">No subjects yet</p>}
        </nav>

        <div className="profile">
          <div className="avatar">{user.fullname?.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{user.fullname}</strong>
            <button type="button" onClick={logout}>Sign out</button>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>{selectedSubject?.name || "Digital Notebook"}</h1>
          </div>
          {selectedSubject && (
            <button
              className="primary-button compact"
              type="button"
              onClick={() => {
                setSelectedNote(null);
                setNoteDraft(emptyNote);
                setNoteModal(true);
              }}
            >
              + New note
            </button>
          )}
        </header>

        {error && <div className="toast" role="alert">{error}</div>}

        <div className="notes-layout">
          <aside className="notes-list">
            {notes.map((note) => (
              <button
                key={note._id}
                type="button"
                className={selectedNote?._id === note._id ? "active" : ""}
                onClick={() => setSelectedNote(note)}
              >
                <strong>{note.title}</strong>
                <span>{note.content?.slice(0, 90) || "Empty note"}</span>
              </button>
            ))}
            {!notes.length && selectedSubject && (
              <div className="empty-list">
                <p>No notes in this subject.</p>
                <button
                  type="button"
                  onClick={() => setNoteModal(true)}
                >
                  Create the first note
                </button>
              </div>
            )}
          </aside>

          <article className="note-editor">
            {selectedNote ? (
              <>
                <header>
                  <h2>{selectedNote.title}</h2>
                  <div>
                    <button type="button" onClick={() => editNote(selectedNote)}>
                      Edit
                    </button>
                    <button
                      className="danger"
                      type="button"
                      onClick={() => deleteNote(selectedNote._id)}
                    >
                      Delete
                    </button>
                  </div>
                </header>
                <pre>{selectedNote.content || "This note is empty."}</pre>
              </>
            ) : (
              <div className="empty-note">
                <div className="brand-mark">DN</div>
                <h2>Select or create a note</h2>
                <p>Choose a subject and keep your study material organized.</p>
              </div>
            )}

            <section className="ai-tools">
              <div className="ai-heading">
                <div>
                  <p className="eyebrow">Study assistant</p>
                  <h2>AI tools</h2>
                </div>
                {aiBusy && <span className="ai-status">Working…</span>}
              </div>

              <div className="ai-actions">
                <button
                  type="button"
                  disabled={!selectedNote || !selectedNote.content?.trim() || aiBusy}
                  onClick={() => runAiAction(api.summarizeNote)}
                >
                  Summarize note
                </button>
                <button
                  type="button"
                  disabled={!selectedNote || !selectedNote.content?.trim() || aiBusy}
                  onClick={() => runAiAction(api.generateQuestions)}
                >
                  Generate practice questions
                </button>
                <button
                  type="button"
                  disabled={!selectedNote || !selectedNote.content?.trim() || aiBusy}
                  onClick={() => runAiAction(api.ingestNote)}
                >
                  Add note to study search
                </button>
              </div>

              <form className="question-form" onSubmit={askQuestion}>
                <label htmlFor="study-question">Ask across notes in this subject</label>
                <div>
                  <input
                    id="study-question"
                    value={studyQuestion}
                    onChange={(event) => setStudyQuestion(event.target.value)}
                    placeholder="Ask a question about your indexed notes..."
                    disabled={!selectedSubject || aiBusy}
                  />
                  <button
                    className="primary-button compact"
                    type="submit"
                    disabled={!selectedSubject || !studyQuestion.trim() || aiBusy}
                  >
                    Ask
                  </button>
                </div>
              </form>

              {aiResult && (
                <div className="ai-result" aria-live="polite">
                  {aiResult.summary && <h3>Summary</h3>}
                  {aiResult.summary && <pre>{aiResult.summary}</pre>}
                  {aiResult.questions && <h3>Practice questions</h3>}
                  {aiResult.questions && <pre>{aiResult.questions}</pre>}
                  {aiResult.chunks_indexed !== undefined && (
                    <p>Indexed {aiResult.chunks_indexed} note chunk(s) for study search.</p>
                  )}
                  {aiResult.answer && <h3>Answer</h3>}
                  {aiResult.answer && <pre>{aiResult.answer}</pre>}
                  {aiResult.sources?.length > 0 && (
                    <p className="ai-sources">
                      Sources: {aiResult.sources.map((source) => source.title).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </section>
          </article>
        </div>
      </section>

      {subjectModal && (
        <Modal title="New subject" onClose={() => setSubjectModal(false)}>
          <form onSubmit={createSubject}>
            <label>
              Subject name
              <input
                value={subjectDraft}
                onChange={(event) => setSubjectDraft(event.target.value)}
                required
                autoFocus
              />
            </label>
            <button className="primary-button" type="submit">Create subject</button>
          </form>
        </Modal>
      )}

      {noteModal && (
        <Modal
          title={selectedNote?._id ? "Edit note" : "New note"}
          onClose={() => setNoteModal(false)}
        >
          <form onSubmit={saveNote}>
            <label>
              Title
              <input
                value={noteDraft.title}
                onChange={(event) =>
                  setNoteDraft((current) => ({ ...current, title: event.target.value }))
                }
                required
                autoFocus
              />
            </label>
            <label>
              Content
              <textarea
                value={noteDraft.content}
                onChange={(event) =>
                  setNoteDraft((current) => ({
                    ...current,
                    content: event.target.value
                  }))
                }
                rows={12}
              />
            </label>
            <button className="primary-button" type="submit">
              {selectedNote?._id ? "Save changes" : "Create note"}
            </button>
          </form>
        </Modal>
      )}
    </main>
  );
}
