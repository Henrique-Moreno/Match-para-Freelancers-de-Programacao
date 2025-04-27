import { useState, useEffect } from "react";
import { api } from "../../api/axios";
import Button from "../../components/Button";
import "./adminDashboard.css";

export default function AdminDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Carregar dados ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, freelancersRes, projectsRes, proposalsRes] = await Promise.all([
          api.get("/admin/clients"),
          api.get("/admin/freelancers"),
          api.get("/admin/projects"),
          api.get("/admin/proposals"),
        ]);
        setClients(clientsRes.data);
        setFreelancers(freelancersRes.data);
        setProjects(projectsRes.data);
        setProposals(proposalsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Erro ao carregar dados.");
      }
    };
    fetchData();
  }, []);

  const handleDeleteClient = async (clientId: number) => {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/client/${clientId}`);
      setClients(clients.filter((c) => c.id !== clientId));
      setSuccess("Cliente deletado com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao deletar cliente.");
    }
  };

  const handleDeleteFreelancer = async (freelancerId: number) => {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/freelancer/${freelancerId}`);
      setFreelancers(freelancers.filter((f) => f.id !== freelancerId));
      setSuccess("Freelancer deletado com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao deletar freelancer.");
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/project/${projectId}`);
      setProjects(projects.filter((p) => p.id !== projectId));
      setSuccess("Projeto deletado com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao deletar projeto.");
    }
  };

  const handleDeleteProposal = async (proposalId: number) => {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/proposal/${proposalId}`);
      setProposals(proposals.filter((p) => p.id !== proposalId));
      setSuccess("Proposta deletada com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao deletar proposta.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/admin/sign";
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard do Administrador</h1>
        <Button label="Sair" onClick={handleLogout} primary={false} />
      </header>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Clientes */}
      <section className="section">
        <h2>Clientes</h2>
        <div className="list">
          {clients.length === 0 ? (
            <p>Nenhum cliente encontrado.</p>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="card">
                <p><strong>Nome:</strong> {client.name}</p>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Empresa:</strong> {client.company || "N/A"}</p>
                <p><strong>Telefone:</strong> {client.phone || "N/A"}</p>
                <Button
                  label="Deletar"
                  onClick={() => handleDeleteClient(client.id)}
                  primary={false}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Freelancers */}
      <section className="section">
        <h2>Freelancers</h2>
        <div className="list">
          {freelancers.length === 0 ? (
            <p>Nenhum freelancer encontrado.</p>
          ) : (
            freelancers.map((freelancer) => (
              <div key={freelancer.id} className="card">
                <p><strong>Nome:</strong> {freelancer.name}</p>
                <p><strong>Email:</strong> {freelancer.email}</p>
                <p><strong>Habilidades:</strong> {freelancer.skills || "N/A"}</p>
                <p><strong>Portfólio:</strong> {freelancer.portfolio_url ? <a href={freelancer.portfolio_url} target="_blank">{freelancer.portfolio_url}</a> : "N/A"}</p>
                <p><strong>Telefone:</strong> {freelancer.phone || "N/A"}</p>
                <Button
                  label="Deletar"
                  onClick={() => handleDeleteFreelancer(freelancer.id)}
                  primary={false}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Projetos */}
      <section className="section">
        <h2>Projetos</h2>
        <div className="list">
          {projects.length === 0 ? (
            <p>Nenhum projeto encontrado.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="card">
                <p><strong>Título:</strong> {project.title}</p>
                <p><strong>Descrição:</strong> {project.description}</p>
                <p><strong>Habilidades:</strong> {project.skills_required}</p>
                <p><strong>Orçamento:</strong> R${project.budget}</p>
                <p><strong>Prazo:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {project.status}</p>
                <p><strong>Cliente ID:</strong> {project.client_id}</p>
                <Button
                  label="Deletar"
                  onClick={() => handleDeleteProject(project.id)}
                  primary={false}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Propostas */}
      <section className="section">
        <h2>Propostas</h2>
        <div className="list">
          {proposals.length === 0 ? (
            <p>Nenhuma proposta encontrada.</p>
          ) : (
            proposals.map((proposal) => (
              <div key={proposal.id} className="card">
                <p><strong>Projeto ID:</strong> {proposal.project_id}</p>
                <p><strong>Freelancer ID:</strong> {proposal.freelancer_id}</p>
                <p><strong>Valor:</strong> R${proposal.bid_amount}</p>
                <p><strong>Prazo Estimado:</strong> {proposal.estimated_days || "N/A"} dias</p>
                <p><strong>Mensagem:</strong> {proposal.message || "N/A"}</p>
                <p><strong>Status:</strong> {proposal.status}</p>
                <Button
                  label="Deletar"
                  onClick={() => handleDeleteProposal(proposal.id)}
                  primary={false}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}