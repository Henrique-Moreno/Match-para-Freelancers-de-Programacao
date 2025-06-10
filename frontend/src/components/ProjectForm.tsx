import { useState } from "react";
import { api } from "../api/axios";
import Button from "./Button";
import styles from "./ProjectForm.module.css";

interface Project {
  id: number;
  title: string;
  description: string;
  skills_required: string;
  budget: number;
  deadline: string;
  status: string;
  client_id: number;
}

interface ProjectFormProps {
  onSubmit: (project: Project) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export default function ProjectForm({ onSubmit, setError, setSuccess }: ProjectFormProps) {
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    skills_required: "",
    budget: "",
    deadline: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...newProject,
        budget: parseFloat(newProject.budget),
        deadline: new Date(newProject.deadline).toISOString(),
      };
      const response = await api.post("/project/create", payload);
      onSubmit(response.data.project);
      setSuccess("Projeto criado com sucesso!");
      setNewProject({
        title: "",
        description: "",
        skills_required: "",
        budget: "",
        deadline: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar projeto.");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={newProject.title}
        onChange={handleChange}
        placeholder="Título"
        className={styles.input}
        required
      />
      <textarea
        name="description"
        value={newProject.description}
        onChange={handleChange}
        placeholder="Descrição"
        className={styles.textarea}
        required
      />
      <input
        type="text"
        name="skills_required"
        value={newProject.skills_required}
        onChange={handleChange}
        placeholder="Habilidades requeridas (ex.: Python, React)"
        className={styles.input}
        required
      />
      <input
        type="number"
        name="budget"
        value={newProject.budget}
        onChange={handleChange}
        placeholder="Orçamento (R$)"
        className={styles.input}
        min="0"
        required
      />
      <input
        type="date"
        name="deadline"
        value={newProject.deadline}
        onChange={handleChange}
        className={styles.input}
        required
      />
      <div className={styles.actions}>
        <Button label="Criar Projeto" type="submit" />
      </div>
    </form>
  );
}