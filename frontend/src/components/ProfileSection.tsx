import { useEffect, useState } from "react";
import { api } from "../api/axios";
import Button from "./Button";
import styles from "./ProfileSection.module.css";

interface Profile {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

interface ProfileSectionProps {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  onDeleteAccount?: () => void;
  role: "client" | "freelancer";
}

export default function ProfileSection({
  profile,
  setProfile,
  setError,
  setSuccess,
  onDeleteAccount,
  role,
}: ProfileSectionProps) {
  const [editProfile, setEditProfile] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditProfile({
        name: profile.name || "",
        email: profile.email || "",
        company: profile.company || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleEditProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await api.put("/client/profile", editProfile);
      setProfile(response.data);
      setShowEditForm(false);
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao atualizar perfil.");
    }
  };

  if (!profile) {
    return <p className={styles.loading}>Carregando perfil...</p>;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Meu Perfil</h2>
      {!showEditForm ? (
        <div className={styles.card}>
          <p><strong>Nome:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          {profile.phone && (
            <p><strong>Telefone:</strong> {profile.phone}</p>
          )}
          {profile.company && role === "client" && (
            <p><strong>Empresa:</strong> {profile.company}</p>
          )}
          <div className={styles.actions}>
            <Button label="Editar Perfil" onClick={() => setShowEditForm(true)} />
            {onDeleteAccount && (
              <Button
                label="Excluir Conta"
                onClick={onDeleteAccount}
                primary={false}
              />
            )}
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleUpdateProfile}>
          <input
            type="text"
            name="name"
            value={editProfile.name}
            onChange={handleEditProfileChange}
            placeholder="Nome"
            className={styles.input}
            required
          />
          <input
            type="email"
            name="email"
            value={editProfile.email}
            onChange={handleEditProfileChange}
            placeholder="Email"
            className={styles.input}
            required
          />
          <input
            type="text"
            name="phone"
            value={editProfile.phone}
            onChange={handleEditProfileChange}
            placeholder="Telefone (opcional)"
            className={styles.input}
          />
          {role === "client" && (
            <input
              type="text"
              name="company"
              value={editProfile.company}
              onChange={handleEditProfileChange}
              placeholder="Empresa (opcional)"
              className={styles.input}
            />
          )}
          <div className={styles.actions}>
            <Button label="Salvar" type="submit" />
            <Button
              label="Cancelar"
              onClick={() => setShowEditForm(false)}
              primary={false}
            />
          </div>
        </form>
      )}
    </section>
  );
}