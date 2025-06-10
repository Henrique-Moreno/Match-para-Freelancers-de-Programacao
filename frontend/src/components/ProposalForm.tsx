import { useState } from "react";
import Button from "../components/Button";
import styles from "./ProposalForm.module.css";

interface ProposalFormProps {
  projectId: number;
  onSubmit: (proposal: {
    project_id: number;
    bid_amount: number;
    estimated_days: number;
    message?: string;
  }) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export default function ProposalForm({ projectId, onSubmit, setError, setSuccess }: ProposalFormProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const bid = parseFloat(bidAmount);
    const days = parseInt(estimatedDays);

    if (!bid || bid <= 0) {
      setError("O valor da proposta deve ser maior que zero.");
      return;
    }
    if (!days || days <= 0) {
      setError("O prazo estimado deve ser maior que zero.");
      return;
    }

    onSubmit({
      project_id: projectId,
      bid_amount: bid,
      estimated_days: days,
      message: message.trim() || undefined,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>Enviar Proposta para Projeto #{projectId}</h3>
      <div className={styles.field}>
        <label htmlFor="bidAmount">Valor da Proposta (R$)</label>
        <input
          id="bidAmount"
          type="number"
          step="0.01"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="estimatedDays">Prazo Estimado (dias)</label>
        <input
          id="estimatedDays"
          type="number"
          value={estimatedDays}
          onChange={(e) => setEstimatedDays(e.target.value)}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="message">Mensagem (opcional)</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
      </div>
      <div className={styles.actions}>
        <Button label="Enviar Proposta" type="submit" primary />
      </div>
    </form>
  );
}