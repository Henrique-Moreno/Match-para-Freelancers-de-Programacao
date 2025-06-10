import { useState } from "react";
import { api } from "../api/axios";
import Button from "./Button";
import styles from "./ReviewFormFreelancer.module.css";

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

interface ReviewFormFreelancerProps {
  projectId: number;
  projects: Project[];
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export default function ReviewFormFreelancer({
  projectId,
  projects,
  setError,
  setSuccess,
}: ReviewFormFreelancerProps) {
  const project = projects.find((p) => p.id === projectId);
  const [review, setReview] = useState({
    rating: "",
    comment: "",
  });

  if (!project || project.status !== "completed" || !project.client_id) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/freelancer/review", {
        project_id: projectId,
        client_id: project.client_id,
        rating: parseInt(review.rating),
        comment: review.comment || undefined,
      });
      setSuccess("Avaliação enviada com sucesso!");
      setReview({ rating: "", comment: "" });
    } catch (err: any) {
      console.error("Erro ao enviar avaliação:", err);
      setError(err.response?.data?.error || "Erro ao enviar avaliação.");
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Avaliar Cliente do Projeto #{projectId}</h2>
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
