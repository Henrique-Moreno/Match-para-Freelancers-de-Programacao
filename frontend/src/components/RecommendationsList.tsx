import { useState, useEffect } from "react";
import { api } from "../api/axios";
import Button from "../components/Button";
import styles from "./RecommendationsList.module.css";

interface Freelancer {
  id: number;
  name: string;
  email: string;
  skill_set: string[];
}

interface Recommendation {
  freelancer: Freelancer;
  score: number;
  matching_skills: number;
  average_rating: number | null;
  review_count: number;
}

interface RecommendationsListProps {
  projectId: number;
  setError: (err: string) => void;
  setSuccess: (err: string) => void;
}

export default function RecommendationsList({
  projectId,
  setError,
  setSuccess,
}: RecommendationsListProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!projectId) {
        setRecommendations([]);
        setMessage(null);
        setLoading(false);
        return;
      }
      setError("");
      setSuccess("");
      setMessage(null);
      setLoading(true);
      try {
        const response = await api.get(`/recommendation/project/${projectId}`);
        console.log("Resposta de /recommendation/project:", response.data); // Log mantido para depuração
        let data: Recommendation[] = [];

        // Verificar formato da resposta
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.recommendations)) {
          data = response.data.recommendations;
        } else if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data.results)) {
          data = response.data.results;
        } else if (
          response.data.message &&
          typeof response.data.message === "string"
        ) {
          setMessage(response.data.message);
          setRecommendations([]);
          return;
        } else {
          setError("Formato de resposta inválido para recomendações.");
          setRecommendations([]);
          return;
        }

        // Validar estrutura dos itens
        const isValid = data.every(
          (item) =>
            item.freelancer &&
            typeof item.freelancer.id === "number" &&
            typeof item.score === "number" &&
            typeof item.matching_skills === "number"
        );

        if (isValid) {
          setRecommendations(data);
        } else {
          setError("Dados de recomendações inválidos. Estrutura incorreta.");
          setRecommendations([]);
        }
      } catch (err: any) {
        console.error("Erro ao buscar recomendações:", err);
        setError(
          err.response?.data?.error || "Erro ao carregar recomendações."
        );
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [projectId, setError]);

  const handleViewProfile = async (freelancerId: number) => {
    setError("");
    setSuccess("");
    try {
      const response = await api.get(`/freelancer/${freelancerId}`);
      setSuccess(`Perfil do ${response.data.name} carregado com sucesso.`);
      console.log("Perfil do freelancer:", response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Erro ao carregar o perfil do freelancer."
      );
    }
  };

  if (loading) {
    return <p className={styles.loading}>Carregando recomendações...</p>;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.header}>
        Recomendações para o Projeto #{projectId}
      </h2>
      {message && <p className={styles.noRecommendations}>{message}</p>}
      {recommendations.length === 0 && !message ? (
        <p className={styles.noRecommendations}>
          Nenhuma recomendação disponível.
        </p>
      ) : (
        <div className={styles.list}>
          {recommendations.map((rec) => (
            <div key={rec.freelancer.id} className={styles.card}>
              <p>
                <strong>Nome:</strong> {rec.freelancer.name}
              </p>
              <p>
                <strong>Email:</strong> {rec.freelancer.email}
              </p>
              <p>
                <strong>Habilidades:</strong>{" "}
                {rec.freelancer.skill_set.length > 0
                  ? rec.freelancer.skill_set.join(", ")
                  : "Nenhuma habilidade listada"}
              </p>
              <p>
                <strong>Pontuação:</strong> {(rec.score * 100).toFixed(0)}%
              </p>
              <p>
                <strong>Habilidades Compatíveis:</strong> {rec.matching_skills}
              </p>
              <p>
                <strong>Avaliação Média:</strong>{" "}
                {rec.average_rating
                  ? `${rec.average_rating.toFixed(1)}/5 (${
                      rec.review_count
                    } avaliações)`
                  : "Sem avaliações"}
              </p>
              <Button
                label="Ver Perfil"
                onClick={() => handleViewProfile(rec.freelancer.id)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
