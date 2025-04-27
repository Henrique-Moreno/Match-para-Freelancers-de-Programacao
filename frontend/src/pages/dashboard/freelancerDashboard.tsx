import { useState, useEffect } from "react";
import { api } from "../../api/axios";
import Button from "../../components/Button";
import "./freelancerDashboard.css";

export default function FreelancerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [newProposal, setNewProposal] = useState({
    project_id: "",
    bid_amount: "",
    estimated_days: "",
    message: "",
  });
  const [editProfile, setEditProfile] = useState({
    name: "",
    email: "",
    skills: "",
    portfolio_url: "",
    phone: "",
  });
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Carregar perfil, projetos e propostas ao montar o componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/freelancer/me");
        setProfile(response.data);
        setEditProfile({
          name: response.data.name,
          email: response.data.email,
          skills: response.data.skills || "",
          portfolio_url: response.data.portfolio_url || "",
          phone: response.data.phone || "",
        });
      } catch (err: any) {
        setError(err.response?.data?.error || "Erro ao carregar perfil.");
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await api.get("/project/all");
        setProjects(response.data.filter((p: any) => p.status === "open"));
      } catch (err: any) {
        setError(err.response?.data?.error || "Erro ao carregar projetos.");
      }
    };

    const fetchProposals = async () => {
      try {
        const response = await api.get("/proposal/freelancer/proposals");
        setProposals(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Erro ao carregar propostas.");
      }
    };

    fetchProfile();
    fetchProjects();
    fetchProposals();
  }, []);

  const handleNewProposalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewProposal({ ...newProposal, [e.target.name]: e.target.value });
  };

  const handleEditProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await api.post("/proposal/create", {
        project_id: parseInt(newProposal.project_id),
        bid_amount: parseFloat(newProposal.bid_amount),
        estimated_days: parseInt(newProposal.estimated_days) || undefined,
        message: newProposal.message || undefined,
      });
      setProposals([...proposals, response.data.proposal]);
      setNewProposal({
        project_id: "",
        bid_amount: "",
        estimated_days: "",
        message: "",
      });
      setShowProposalForm(false);
      setSuccess("Proposta enviada com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao enviar proposta.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await api.put("/freelancer/update", editProfile);
      setProfile(response.data.freelancer);
      setShowEditProfile(false);
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao atualizar perfil.");
    }
  };

  const handleDeleteProposal = async (proposalId: number) => {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/proposal/${proposalId}`);
      setProposals(proposals.filter((p) => p.id !== proposalId));
      setSuccess("Proposta deletada com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao deletar proposta.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/sign";
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard do Freelancer</h1>
        <Button label="Sair" onClick={handleLogout} primary={false} />
      </header>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Perfil */}
      <section className="profile-section">
        <h2>Meu Perfil</h2>
        {profile && !showEditProfile ? (
          <div className="profile-card">
            <p>
              <strong>Nome:</strong> {profile.name}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            {profile.skills && (
              <p>
                <strong>Habilidades:</strong> {profile.skills}
              </p>
            )}
            {profile.portfolio_url && (
              <p>
                <strong>Portfólio:</strong>{" "}
                <a href={profile.portfolio_url} target="_blank">
                  {profile.portfolio_url}
                </a>
              </p>
            )}
            {profile.phone && (
              <p>
                <strong>Telefone:</strong> {profile.phone}
              </p>
            )}
            <Button
              label="Editar Perfil"
              onClick={() => setShowEditProfile(true)}
            />
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
              name="skills"
              value={editProfile.skills}
              onChange={handleEditProfileChange}
              placeholder="Habilidades (ex.: Python, React)"
            />
            <input
              type="url"
              name="portfolio_url"
              value={editProfile.portfolio_url}
              onChange={handleEditProfileChange}
              placeholder="URL do Portfólio (opcional)"
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
              <Button
                label="Cancelar"
                onClick={() => setShowEditProfile(false)}
                primary={false}
              />
            </div>
          </form>
        )}
      </section>

      {/* Projetos Disponíveis */}
      <section className="projects-section">
        <h2>Projetos Disponíveis</h2>
        <div className="projects-list">
          {projects.length === 0 ? (
            <p>Nenhum projeto disponível no momento.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p>
                  <strong>Descrição:</strong> {project.description}
                </p>
                <p>
                  <strong>Habilidades:</strong> {project.skills_required}
                </p>
                <p>
                  <strong>Orçamento:</strong> R${project.budget}
                </p>
                <p>
                  <strong>Prazo:</strong>{" "}
                  {new Date(project.deadline).toLocaleDateString()}
                </p>
                <Button
                  label="Enviar Proposta"
                  onClick={() => {
                    setNewProposal({
                      ...newProposal,
                      project_id: project.id.toString(),
                    });
                    setShowProposalForm(true);
                  }}
                />
              </div>
            ))
          )}
        </div>
        {showProposalForm && (
          <form className="form" onSubmit={handleCreateProposal}>
            <input
              type="number"
              name="project_id"
              value={newProposal.project_id}
              readOnly
              hidden
            />
            <input
              type="number"
              name="bid_amount"
              value={newProposal.bid_amount}
              onChange={handleNewProposalChange}
              placeholder="Valor da Proposta (R$)"
              required
            />
            <input
              type="number"
              name="estimated_days"
              value={newProposal.estimated_days}
              onChange={handleNewProposalChange}
              placeholder="Prazo Estimado (dias)"
            />
            <textarea
              name="message"
              value={newProposal.message}
              onChange={handleNewProposalChange}
              placeholder="Mensagem (opcional)"
            />
            <div className="form-actions">
              <Button label="Enviar Proposta" type="submit" />
              <Button
                label="Cancelar"
                onClick={() => setShowProposalForm(false)}
                primary={false}
              />
            </div>
          </form>
        )}
      </section>

      {/* Minhas Propostas */}
      <section className="proposals-section">
        <h2>Minhas Propostas</h2>
        <div className="proposals-list">
          {proposals.length === 0 ? (
            <p>Nenhuma proposta enviada.</p>
          ) : (
            proposals.map((proposal) => (
              <div key={proposal.id} className="proposal-card">
                <p>
                  <strong>Projeto ID:</strong> {proposal.project_id}
                </p>
                <p>
                  <strong>Valor:</strong> R${proposal.bid_amount}
                </p>
                <p>
                  <strong>Prazo Estimado:</strong>{" "}
                  {proposal.estimated_days || "N/A"} dias
                </p>
                <p>
                  <strong>Mensagem:</strong> {proposal.message || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {proposal.status}
                </p>
                <div className="proposal-actions">
                  <Button
                    label="Deletar"
                    onClick={() => handleDeleteProposal(proposal.id)}
                    primary={false}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
