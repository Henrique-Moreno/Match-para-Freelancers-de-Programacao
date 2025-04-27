import { useState, useEffect } from "react";
import { api } from "../../api/axios";
import Button from "../../components/Button";
import "./clientDashboard.css";

export default function ClientDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    skills_required: "",
    budget: "",
    deadline: "",
  });
  const [editProfile, setEditProfile] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Carregar perfil e projetos ao montar o componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/client/profile");
        setProfile(response.data);
        setEditProfile({
          name: response.data.name,
          email: response.data.email,
          company: response.data.company || "",
          phone: response.data.phone || "",
        });
      } catch (err: any) {
        setError(err.response?.data?.error || "Erro ao carregar perfil.");
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await api.get("/project/all");
        setProjects(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Erro ao carregar projetos.");
      }
    };

    fetchProfile();
    fetchProjects();
  }, []);

  // Carregar propostas quando um projeto for selecionado
  useEffect(() => {
    if (selectedProjectId) {
      const fetchProposals = async () => {
        try {
          const response = await api.get(`/proposal/all/${selectedProjectId}`);
          setProposals(response.data);
        } catch (err: any) {
          setError(err.response?.data?.error || "Erro ao carregar propostas.");
        }
      };
      fetchProposals();
    }
  }, [selectedProjectId]);

  const handleNewProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleEditProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await api.post("/project/create", {
        ...newProject,
        budget: parseFloat(newProject.budget),
        deadline: new Date(newProject.deadline).toISOString(),
      });
      setProjects([...projects, response.data.project]);
      setNewProject({ title: "", description: "", skills_required: "", budget: "", deadline: "" });
      setShowProjectForm(false);
      setSuccess("Projeto criado com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar projeto.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await api.put("/client/update", editProfile);
      setProfile(response.data.client);
      setShowEditProfile(false);
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao atualizar perfil.");
    }
  };

  const handleProposalAction = async (proposalId: number, status: "accepted" | "rejected") => {
    setError("");
    setSuccess("");
    try {
      const response = await api.put(`/proposal/${proposalId}`, { status });
      setProposals(proposals.map((p) => (p.id === proposalId ? response.data.proposal : p)));
      if (status === "accepted") {
        setProjects(
          projects.map((p) =>
            p.id === selectedProjectId ? { ...p, status: "in_progress" } : p
          )
        );
      }
      setSuccess(`Proposta ${status === "accepted" ? "aceita" : "rejeitada"} com sucesso!`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao atualizar proposta.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/sign";
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard do Cliente</h1>
        <Button label="Sair" onClick={handleLogout} primary={false} />
      </header>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Perfil */}
      <section className="profile-section">
        <h2>Meu Perfil</h2>
        {profile && !showEditProfile ? (
          <div className="profile-card">
            <p><strong>Nome:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            {profile.company && <p><strong>Empresa:</strong> {profile.company}</p>}
            {profile.phone && <p><strong>Telefone:</strong> {profile.phone}</p>}
            <Button label="Editar Perfil" onClick={() => setShowEditProfile(true)} />
          </div>
        ) : (
          <form className="form" onSubmit={handleUpdateProfile}>
            <input
              type="text"
              name="name"
              value={editProfile.name}
              onChange={handleEditProfileChange}
              placeholder="Nome"
              required
            />
            <input
              type="email"
              name="email"
              value={editProfile.email}
              onChange={handleEditProfileChange}
              placeholder="Email"
              required
            />
            <input
              type="text"
              name="company"
              value={editProfile.company}
              onChange={handleEditProfileChange}
              placeholder="Empresa (opcional)"
            />
            <input
              type="text"
              name="phone"
              value={editProfile.phone}
              onChange={handleEditProfileChange}
              placeholder="Telefone (opcional)"
            />
            <div className="form-actions">
              <Button label="Salvar" type="submit" />
              <Button label="Cancelar" onClick={() => setShowEditProfile(false)} primary={false} />
            </div>
          </form>
        )}
      </section>

      {/* Projetos */}
      <section className="projects-section">
        <h2>Meus Projetos</h2>
        <Button
          label={showProjectForm ? "Cancelar" : "Criar Novo Projeto"}
          onClick={() => setShowProjectForm(!showProjectForm)}
        />
        {showProjectForm && (
          <form className="form" onSubmit={handleCreateProject}>
            <input
              type="text"
              name="title"
              value={newProject.title}
              onChange={handleNewProjectChange}
              placeholder="Título"
              required
            />
            <textarea
              name="description"
              value={newProject.description}
              onChange={handleNewProjectChange}
              placeholder="Descrição"
              required
            />
            <input
              type="text"
              name="skills_required"
              value={newProject.skills_required}
              onChange={handleNewProjectChange}
              placeholder="Habilidades requeridas (ex.: Python, React)"
              required
            />
            <input
              type="number"
              name="budget"
              value={newProject.budget}
              onChange={handleNewProjectChange}
              placeholder="Orçamento (R$)"
              required
            />
            <input
              type="date"
              name="deadline"
              value={newProject.deadline}
              onChange={handleNewProjectChange}
              required
            />
            <Button label="Criar Projeto" type="submit" />
          </form>
        )}
        <div className="projects-list">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <h3>{project.title}</h3>
              <p><strong>Descrição:</strong> {project.description}</p>
              <p><strong>Habilidades:</strong> {project.skills_required}</p>
              <p><strong>Orçamento:</strong> R${project.budget}</p>
              <p><strong>Prazo:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {project.status}</p>
              <Button
                label="Ver Propostas"
                onClick={() => setSelectedProjectId(project.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Propostas */}
      {selectedProjectId && (
        <section className="proposals-section">
          <h2>Propostas para o Projeto #{selectedProjectId}</h2>
          <Button label="Fechar" onClick={() => setSelectedProjectId(null)} primary={false} />
          <div className="proposals-list">
            {proposals.length === 0 ? (
              <p>Nenhuma proposta recebida.</p>
            ) : (
              proposals.map((proposal) => (
                <div key={proposal.id} className="proposal-card">
                  <p><strong>Freelancer ID:</strong> {proposal.freelancer_id}</p>
                  <p><strong>Valor:</strong> R${proposal.bid_amount}</p>
                  <p><strong>Prazo Estimado:</strong> {proposal.estimated_days} dias</p>
                  <p><strong>Mensagem:</strong> {proposal.message}</p>
                  <p><strong>Status:</strong> {proposal.status}</p>
                  {proposal.status === "pending" && (
                    <div className="proposal-actions">
                      <Button
                        label="Aceitar"
                        onClick={() => handleProposalAction(proposal.id, "accepted")}
                      />
                      <Button
                        label="Rejeitar"
                        onClick={() => handleProposalAction(proposal.id, "rejected")}
                        primary={false}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}