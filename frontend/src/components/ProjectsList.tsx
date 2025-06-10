import { api } from "../api/axios";
import Button from "./Button";
import styles from "./ProjectsList.module.css";

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

interface ProjectsListProps {
  projects: Project[];
  setSelectedProjectId: (id: number | null) => void;
  onUpdateProjectStatus: (projectId: number, updatedProject: Project) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export default function ProjectsList({
  projects,
  setSelectedProjectId,
  onUpdateProjectStatus,
  setError,
  setSuccess,
}: ProjectsListProps) {
  const handleCompleteProject = async (projectId: number) => {
    setError("");
    setSuccess("");
    try {
      const response = await api.patch(`/project/${projectId}/complete`);
      onUpdateProjectStatus(projectId, response.data.project);
      setSuccess("Projeto marcado como concluído!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao marcar projeto como concluído.");
    }
  };

  if (projects.length === 0) {
    return <p className={styles.noProjects}>Nenhum projeto encontrado.</p>;
  }

  return (
    <div className={styles.list}>
      {projects.map((project) => (
        <div key={project.id} className={styles.card}>
          <h3 className={styles.cardTitle}>{project.title}</h3>
          <p><strong>Descrição:</strong> {project.description}</p>
          <p><strong>Habilidades:</strong> {project.skills_required}</p>
          <p><strong>Orçamento:</strong> R${project.budget.toFixed(2)}</p>
          <p><strong>Prazo:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {project.status}</p>
          <div className={styles.actions}>
            <Button
              label="Ver Propostas"
              onClick={() => setSelectedProjectId(project.id)}
            />
            {project.status === "in_progress" && (
              <Button
                label="Marcar como Concluído"
                onClick={() => handleCompleteProject(project.id)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}