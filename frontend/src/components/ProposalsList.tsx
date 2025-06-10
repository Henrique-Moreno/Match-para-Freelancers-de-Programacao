import { useEffect } from "react";
import { api } from "../api/axios";
import Button from "../components/Button";
import styles from "./ProposalsList.module.css";

interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  bid_amount: number;
  estimated_days: number;
  message?: string;
  status: string;
  freelancer?: {
    name: string;
    email: string;
  };
}

interface ProposalsListProps {
  projectId: number | null;
  proposals: Proposal[];
  onProposalAction: (
    proposalId: number,
    action: "accept" | "reject" | "complete"
  ) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  onClose: () => void;
}

export default function ProposalsList({
  projectId,
  proposals,
  onProposalAction,
  setError,
  onClose,
}: ProposalsListProps) {
  useEffect(() => {
    const fetchFreelancerDetails = async () => {
      for (const proposal of proposals) {
        if (!proposal.freelancer && proposal.freelancer_id) {
          try {
            const response = await api.get(
              `/freelancer/${proposal.freelancer_id}`
            );
            proposal.freelancer = {
              name: response.data.name,
              email: response.data.email,
            };
          } catch (err: any) {
            setError(
              err.response?.data?.message ||
                "Erro ao carregar dados do freelancer."
            );
          }
        }
      }
    };

    fetchFreelancerDetails();
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
          {projectId
            ? `Propostas para Projeto #${projectId}`
            : "Minhas Propostas"}
        </h2>
        {projectId && (
          <Button label="Fechar" onClick={onClose} primary={false} />
        )}
      </div>
      {proposals.length === 0 ? (
        <p className={styles.noProposals}>Nenhuma proposta encontrada.</p>
      ) : (
        <div className={styles.list}>
          {proposals.map((proposal) => (
            <div key={proposal.id} className={styles.proposal}>
              <p>
                <strong>Freelancer:</strong>{" "}
                {proposal.freelancer?.name || "Carregando..."}
              </p>
              <p>
                <strong>Valor:</strong> R${proposal.bid_amount.toFixed(2)}
              </p>
              <p>
                <strong>Prazo:</strong> {proposal.estimated_days} dias
              </p>
              {proposal.message && (
                <p>
                  <strong>Mensagem:</strong> {proposal.message}
                </p>
              )}
              <p>
                <strong>Status:</strong> {getStatusLabel(proposal.status)}
              </p>
              <div className={styles.actions}>
                {proposal.status === "pending" && (
                  <>
                    <Button
                      label="Aceitar"
                      onClick={() => onProposalAction(proposal.id, "accept")}
                      primary
                    />
                    <Button
                      label="Rejeitar"
                      onClick={() => onProposalAction(proposal.id, "reject")}
                      primary={false}
                    />
                  </>
                )}
                {proposal.status === "completed_by_freelancer" && (
                  <Button
                    label="Confirmar Conclusão"
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
