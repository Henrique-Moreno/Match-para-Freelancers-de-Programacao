import { useEffect } from "react";
import { api } from "../api/axios";
import Button from "./Button";
import styles from "./ProposalsListFreelancer.module.css";

interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  bid_amount: number;
  estimated_days: number;
  message?: string;
  status: string;
  project?: {
    title: string;
  };
}

interface ProposalsListFreelancerProps {
  projectId: number | null;
  proposals: Proposal[];
  onProposalAction: (proposalId: number, action: "delete" | "complete") => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  onClose: () => void;
}

export default function ProposalsListFreelancer({
  projectId,
  proposals,
  onProposalAction,
  setError,
  onClose,
}: ProposalsListFreelancerProps) {
  useEffect(() => {
    const fetchProjectDetails = async () => {
      for (const proposal of proposals) {
        if (!proposal.project && proposal.project_id) {
          try {
            const response = await api.get(`/project/${proposal.project_id}`);
            proposal.project = { title: response.data.title };
          } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar dados do projeto.");
          }
        }
      }
    };

    fetchProjectDetails();
  }, [proposals, setError]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Aceita";
      case "rejected":
        return "Rejeitada";
      case "completed_by_freelancer":
        return "Concluída pelo Freelancer";
      default:
        return "Pendente";
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {projectId ? `Propostas para Projeto #${projectId}` : "Minhas Propostas"}
        </h2>
        {projectId && <Button label="Fechar" onClick={onClose} primary={false} />}
      </div>
      {proposals.length === 0 ? (
        <p className={styles.noProposals}>Nenhuma proposta encontrada.</p>
      ) : (
        <div className={styles.list}>
          {proposals.map((proposal) => (
            <div key={proposal.id} className={styles.proposal}>
              <p><strong>Projeto:</strong> {proposal.project?.title || `Projeto #${proposal.project_id}`}</p>
              <p><strong>Valor:</strong> R${proposal.bid_amount.toFixed(2)}</p>
              <p><strong>Prazo:</strong> {proposal.estimated_days} dias</p>
              {proposal.message && <p><strong>Mensagem:</strong> {proposal.message}</p>}
              <p><strong>Status:</strong> {getStatusLabel(proposal.status)}</p>
              <div className={styles.actions}>
                {proposal.status === "pending" && (
                  <Button
                    label="Excluir"
                    onClick={() => onProposalAction(proposal.id, "delete")}
                    primary={false}
                  />
                )}
                {proposal.status === "accepted" && (
                  <Button
                    label="Marcar como Concluído"
                    onClick={() => onProposalAction(proposal.id, "complete")}
                    primary
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}