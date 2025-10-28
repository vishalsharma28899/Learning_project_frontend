import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submissions, setSubmissions] = useState([]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("https://learning-project-5jlc.onrender.com/api/form", formData);
    setFormData({ name: "", email: "", message: "" });
    fetchForms();
  };

  const fetchForms = async () => {
    const res = await axios.get("https://learning-project-5jlc.onrender.com/api/forms");
    setSubmissions(res.data);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return (
    <div className="container">
      <h1>📋 Feedback Form</h1>

      <form className="form-card" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Enter your message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <h2>🗂️ Submissions</h2>
      <div className="submissions">
        {submissions.map((s) => (
          <div className="card" key={s._id}>
            <h3>{s.name}</h3>
            <p>{s.email}</p>
            <p>{s.message}</p>
            <small>{new Date(s.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
