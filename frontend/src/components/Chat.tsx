import { useState, useEffect, useContext } from "react";
import { api } from "../api/axios";
import Button from "./Button";
import { AuthContext } from "../contexts/AuthContext";
import styles from "./Chat.module.css";

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

interface Message {
  id: number;
  project_id: number;
  sender_id: number;
  receiver_id: number;
  sender_role: "client" | "freelancer";
  receiver_role: "client" | "freelancer";
  content: string;
  created_at: string;
}

interface ChatProps {
  projectId: number;
  projects: Project[];
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export default function Chat({
  projectId,
  projects,
  setError,
  setSuccess,
}: ChatProps) {
  const { user } = useContext(AuthContext);
  const project = projects.find((p) => p.id === projectId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!projectId || !project) return;
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/message/project/${projectId}`);
        console.log("Mensagens carregadas:", response.data);
        setMessages(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.error("Erro ao carregar mensagens:", err);
        setError(err.response?.data?.error || "Erro ao carregar mensagens.");
      } finally {
        setLoading(false);
      }
    };

    if (project && ["open", "in_progress"].includes(project.status)) {
      fetchMessages();
    }
  }, [projectId, project, setError]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Usuário não autenticado.");
      return;
    }
    if (!newMessage.trim()) {
      setError("A mensagem não pode estar vazia.");
      return;
    }
    if (!project) {
      setError("Projeto não encontrado.");
      return;
    }

    const isFreelancer = user.role === "freelancer";
    const receiverId = isFreelancer ? project.client_id : project.freelancer_id;
    const receiverRole = isFreelancer ? "client" : "freelancer";

    if (!receiverId) {
      setError(`Nenhum ${receiverRole} associado ao projeto.`);
      return;
    }

    setError("");
    setSuccess("");
    try {
      const response = await api.post("/message/", {
        project_id: projectId,
        receiver_id: receiverId,
        receiver_role: receiverRole,
        content: newMessage,
      });
      console.log("Mensagem enviada:", response.data);
      setMessages([...messages, response.data.message_data]);
      setNewMessage("");
      setSuccess("Mensagem enviada com sucesso!");
    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      setError(err.response?.data?.error || "Erro ao enviar mensagem.");
    }
  };

  if (!project || !["open", "in_progress"].includes(project.status)) {
    return null;
  }

  if (loading) {
    return <p className={styles.loading}>Carregando mensagens...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Chat do Projeto #{projectId}</h2>
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <p className={styles.noMessages}>Nenhuma mensagem no chat.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageCard} ${
                message.sender_id === user.id ? styles.sent : styles.received
              }`}
            >
              <p>
                <strong>
                  {message.sender_id === user.id
                    ? "Você"
                    : message.sender_role === "client"
                    ? "Cliente"
                    : "Freelancer"}
                  :
                </strong>{" "}
                {message.content}
              </p>
              <p className={styles.timestamp}>
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
      <form className={styles.form} onSubmit={handleSendMessage}>
        <textarea
          name="content"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className={styles.textarea}
          required
        />
        <Button label="Enviar Mensagem" type="submit" />
      </form>
    </section>
  );
}
