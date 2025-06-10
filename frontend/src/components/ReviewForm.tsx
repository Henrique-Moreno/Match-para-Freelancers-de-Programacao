import { useState } from "react";
import { api } from "../api/axios";
import Button from "./Button";
import styles from "./ReviewForm.module.css";

interface Project {
  id: number;
  title: string;
  description: string;
  skills_required: string;
  budget: number;
  deadline: string;
  status: string;
  freelancer_id?: number;
  client_id: number;
}

interface ReviewFormProps {
  projectId: number;
  projects: Project[];
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export default function ReviewForm({ projectId, projects, setError, setSuccess }: ReviewFormProps) {
  const project = projects.find((p) => p.id === projectId);
  const [review, setReview] = useState({
    rating: "",
    comment: "",
  });

  if (!project || project.status !== "completed" || !project.freelancer_id) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/client/review", {
        project_id: projectId,
        freelancer_id: project.freelancer_id,
        rating: parseInt(review.rating),
        comment: review.comment || undefined,
      });
      setSuccess("Avaliação enviada com sucesso!");
      setReview({ rating: "", comment: "" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao enviar avaliação.");
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Avaliar Projeto #{projectId}</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="number"
          name="rating"
          value={review.rating}
          onChange={handleChange}
          placeholder="Nota (1 a 5)"
          className={styles.input}
          min="1"
          max="5"
          required
        />
        <textarea
          name="comment"
          value={review.comment}
          onChange={handleChange}
          placeholder="Comentário (opcional)"
          className={styles.textarea}
        />
        <div className={styles.actions}>
          <Button label="Enviar Avaliação" type="submit" />
        </div>
      </form>
    </section>
  );
}