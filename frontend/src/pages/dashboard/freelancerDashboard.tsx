import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import Button from "../../components/Button";
import ProfileSection from "../../components/ProfileSection";
import ProjectsList from "../../components/ProjectsList";
import ProposalsListFreelancer from "../../components/ProposalsListFreelancer";
import ProposalForm from "../../components/ProposalForm";
import ReviewFormFreelancer from "../../components/ReviewFormFreelancer";
import RecommendationsList from "../../components/RecommendationsList";
import Chat from "../../components/Chat";
import ErrorBoundary from "../../components/ErrorBoundary";
import { AuthContext } from "../../contexts/AuthContext";
import styles from "./FreelancerDashboard.module.css";

interface Profile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  skills?: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  skills_required: string;
  budget: number;
  deadline: string;
  status: string;
  client_id: number;
  freelancer_id?: number;
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

export default function FreelancerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "freelancer") {
      navigate("/freelancer/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get("/freelancer/profile");
        console.log("Perfil carregado:", response.data);
        setProfile(response.data);
      } catch (err: any) {
        console.error("Erro ao carregar perfil:", err);
        setError(err.response?.data?.message || "Erro ao carregar perfil.");
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await api.get("/project/all");
        console.log("Projetos carregados:", response.data);
        setProjects(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.error("Erro ao carregar projetos:", err);
        setError(err.response?.data?.message || "Erro ao carregar projetos.");
      }
    };

    const fetchCompletedProjects = async () => {
      try {
        const response = await api.get("/freelancer/projects/completed");
        console.log("Projetos concluídos carregados:", response.data);
        setCompletedProjects(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.error("Erro ao carregar projetos concluídos:", err);
        setError(
          err.response?.data?.message || "Erro ao carregar projetos concluídos."
        );
      }
    };

    const fetchProposals = async () => {
      try {
        const response = await api.get("/proposal/freelancer/proposals");
        console.log("Propostas carregadas:", response.data);
        setProposals(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.error("Erro ao carregar propostas:", err);
        setError(err.response?.data?.message || "Erro ao carregar propostas.");
      }
    };

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProfile(),
          fetchProjects(),
          fetchCompletedProjects(),
          fetchProposals(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const handleCreateProposal = async (
    newProposal: Omit<Proposal, "id" | "freelancer_id" | "status">
  ) => {
    if (!user) {
      setError("Usuário não autenticado.");
      return;
    }
    try {
      const response = await api.post("/proposal/create", newProposal);
      console.log("Proposta criada:", response.data);
      setProposals([
        ...proposals,
        {
          ...newProposal,
          id: response.data.proposal.id,
          freelancer_id: user.id,
          status: "pending",
        },
      ]);
      setShowProposalForm(false);
      setSuccess("Proposta enviada com sucesso!");
    } catch (err: any) {
      console.error("Erro ao criar proposta:", err);
      setError(err.response?.data?.message || "Erro ao enviar proposta.");
    }
  };

  const handleProposalAction = async (
    proposalId: number,
    action: "delete" | "complete"
  ) => {
    try {
      if (action === "delete") {
        if (!window.confirm("Tem certeza que deseja excluir esta proposta?")) {
          return;
        }
        await api.delete(`/proposal/${proposalId}`);
        console.log("Proposta excluída:", proposalId);
        setProposals(proposals.filter((p) => p.id !== proposalId));
        setSuccess("Proposta excluída com sucesso!");
      } else if (action === "complete") {
        await api.patch(`/proposal/${proposalId}/complete`);
        console.log("Proposta concluída:", proposalId);
        setProposals(
          proposals.map((p) =>
            p.id === proposalId
              ? { ...p, status: "completed_by_freelancer" }
              : p
          )
        );
        setSuccess("Proposta marcada como concluída com sucesso!");
      }
    } catch (err: any) {
      console.error("Erro ao realizar ação na proposta:", err);
      setError(
        err.response?.data?.message || "Erro ao realizar ação na proposta."
      );
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
      await api.delete("/freelancer/account");
      console.log("Conta excluída com sucesso");
      logout();
    } catch (err: any) {
      console.error("Erro ao excluir conta:", err);
      setError(err.response?.data?.message || "Erro ao excluir conta.");
    }
  };

  if (loading) {
    return <p className={styles.loading}>Carregando dashboard...</p>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard do Freelancer</h1>
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
          role="freelancer"
        />
      </ErrorBoundary>

      <section className={styles.projectsSection}>
        <div className={styles.projectsHeader}>
          <h2 className={styles.sectionTitle}>Projetos Disponíveis</h2>
          {selectedProjectId && (
            <Button
              label={showProposalForm ? "Cancelar" : "Criar Proposta"}
              onClick={() => setShowProposalForm(!showProposalForm)}
              primary
            />
          )}
        </div>
        {selectedProjectId && showProposalForm && (
          <ErrorBoundary componentName="ProposalForm" setError={setError}>
            <ProposalForm
              projectId={selectedProjectId}
              onSubmit={handleCreateProposal}
              setError={setError}
              setSuccess={setSuccess}
            />
          </ErrorBoundary>
        )}
        <ErrorBoundary componentName="ProjectsList" setError={setError}>
          <ProjectsList
            projects={projects}
            setSelectedProjectId={setSelectedProjectId}
            onUpdateProjectStatus={() => {}}
            setError={setError}
            setSuccess={setSuccess}
          />
        </ErrorBoundary>
      </section>

      <section className={styles.completedProjectsSection}>
        <h2 className={styles.sectionTitle}>Projetos Concluídos</h2>
        <ErrorBoundary componentName="ProjectsList" setError={setError}>
          <ProjectsList
            projects={completedProjects}
            setSelectedProjectId={setSelectedProjectId}
            onUpdateProjectStatus={() => {}}
            setError={setError}
            setSuccess={setSuccess}
          />
        </ErrorBoundary>
      </section>

      <section className={styles.proposalsSection}>
        <h2 className={styles.sectionTitle}>Minhas Propostas</h2>
        <ErrorBoundary
          componentName="ProposalsListFreelancer"
          setError={setError}
        >
          <ProposalsListFreelancer
            projectId={null}
            proposals={proposals}
            onProposalAction={handleProposalAction}
            setError={setError}
            setSuccess={setSuccess}
            onClose={() => {}}
          />
        </ErrorBoundary>
      </section>

      {selectedProjectId && (
        <section className={styles.projectDetailsSection}>
          <ErrorBoundary
            componentName="ReviewFormFreelancer"
            setError={setError}
          >
            <ReviewFormFreelancer
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
