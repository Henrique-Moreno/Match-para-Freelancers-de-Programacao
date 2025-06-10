import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import Button from "../../components/Button";
import ProfileSection from "../../components/ProfileSection";
import ProjectForm from "../../components/ProjectForm";
import ProjectsList from "../../components/ProjectsList";
import ProposalsList from "../../components/ProposalsList";
import ReviewForm from "../../components/ReviewForm";
import RecommendationsList from "../../components/RecommendationsList";
import Chat from "../../components/Chat";
import ErrorBoundary from "../../components/ErrorBoundary";
import { AuthContext } from "../../contexts/AuthContext";
import styles from "./ClientDashboard.module.css";

interface Profile {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

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

interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  bid_amount: number;
  estimated_days: number;
  message?: string;
  status: string;
}

export default function ClientDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "client") {
      navigate("/sign");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get("/client/profile");
        setProfile(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Erro ao carregar perfil do cliente."
        );
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await api.get("/project/all");
        setProjects(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Erro ao carregar projetos.");
      }
    };

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProfile(), fetchProjects()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (selectedProjectId) {
        try {
          const response = await api.get(`/proposal/all/${selectedProjectId}`);
          setProposals(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
          setError(
            err.response?.data?.message || "Erro ao carregar propostas."
          );
        }
      } else {
        setProposals([]);
      }
    };

    fetchProposals();
  }, [selectedProjectId]);

  const handleCreateProject = (newProject: Project) => {
    setProjects([...projects, newProject]);
    setShowProjectForm(false);
    setSuccess("Projeto criado com sucesso!");
  };

  const handleUpdateProjectStatus = (
    projectId: number,
    updatedProject: Project
  ) => {
    setProjects(projects.map((p) => (p.id === projectId ? updatedProject : p)));
    setSuccess("Projeto atualizado com sucesso!");
  };

  const handleProposalAction = async (
    proposalId: number,
    action: "accept" | "reject" | "complete"
  ) => {
    try {
      if (action === "accept" || action === "reject") {
        await api.put(`/proposal/${proposalId}`, {
          status: action === "accept" ? "accepted" : "rejected",
        });
        setProposals(
          proposals.map((p) =>
            p.id === proposalId
              ? { ...p, status: action === "accept" ? "accepted" : "rejected" }
              : p
          )
        );
        if (action === "accept") {
          setProjects(
            projects.map((p) =>
              p.id === selectedProjectId ? { ...p, status: "in_progress" } : p
            )
          );
        }
        setSuccess(
          `Proposta ${
            action === "accept" ? "aceita" : "rejeitada"
          } com sucesso!`
        );
      } else if (action === "complete") {
        await api.patch(`/project/${selectedProjectId}/complete`);
        setProjects(
          projects.map((p) =>
            p.id === selectedProjectId ? { ...p, status: "completed" } : p
          )
        );
        setSuccess("Projeto marcado como concluído com sucesso!");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao atualizar proposta.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação é irreversível."
      )
    ) {
      return;
    }
    try {
      await api.delete("/client/account");
      logout();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao excluir conta.");
    }
  };

  if (loading) {
    return <p className={styles.loading}>Carregando dashboard...</p>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard do Cliente</h1>
        <Button label="Sair" onClick={logout} primary={false} />
      </header>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}

      <ErrorBoundary componentName="ProfileSection" setError={setError}>
        <ProfileSection
          profile={profile}
          setProfile={setProfile}
          setError={setError}
          setSuccess={setSuccess}
          onDeleteAccount={handleDeleteAccount}
          role="client"
        />
      </ErrorBoundary>

      <section className={styles.projectsSection}>
        <div className={styles.projectsHeader}>
          <h2 className={styles.sectionTitle}>Meus Projetos</h2>
          <Button
            label={showProjectForm ? "Cancelar" : "Criar Novo Projeto"}
            onClick={() => setShowProjectForm(!showProjectForm)}
            primary
          />
        </div>
        {showProjectForm && (
          <ErrorBoundary componentName="ProjectForm" setError={setError}>
            <ProjectForm
              onSubmit={handleCreateProject}
              setError={setError}
              setSuccess={setSuccess}
            />
          </ErrorBoundary>
        )}
        <ErrorBoundary componentName="ProjectsList" setError={setError}>
          <ProjectsList
            projects={projects}
            setSelectedProjectId={setSelectedProjectId}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            setError={setError}
            setSuccess={setSuccess}
          />
        </ErrorBoundary>
      </section>

      {selectedProjectId && (
        <section className={styles.projectDetailsSection}>
          <ErrorBoundary componentName="ProposalsList" setError={setError}>
            <ProposalsList
              projectId={selectedProjectId}
              proposals={proposals}
              onProposalAction={handleProposalAction}
              setError={setError}
              setSuccess={setSuccess}
              onClose={() => setSelectedProjectId(null)}
            />
          </ErrorBoundary>
          <ErrorBoundary componentName="ReviewForm" setError={setError}>
            <ReviewForm
              projectId={selectedProjectId}
              projects={projects}
              setError={setError}
              setSuccess={setSuccess}
            />
          </ErrorBoundary>
          <ErrorBoundary
            componentName="RecommendationsList"
            setError={setError}
          >
            <RecommendationsList
              projectId={selectedProjectId}
              setError={setError}
              setSuccess={setSuccess}
            />
          </ErrorBoundary>
          <ErrorBoundary componentName="Chat" setError={setError}>
            <Chat
              projectId={selectedProjectId}
              projects={projects}
              setError={setError}
              setSuccess={setSuccess}
            />
          </ErrorBoundary>
        </section>
      )}
    </div>
  );
}
