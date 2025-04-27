import { useState } from "react";
import { api } from "../../api/axios";
import Button from "../../components/Button";
import "./adminSign.css";

export default function AdminSign() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/admin/login", formData);
      const { access_token } = response.data;
      localStorage.setItem("access_token", access_token);
      setSuccess("Login bem-sucedido! Redirecionando...");
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao fazer login.");
    }
  };

  return (
    <div className="adminsign-container">
      <h1 className="adminsign-title">Login do Administrador</h1>
      <form className="adminsign-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Senha"
          required
        />
        <Button label="Entrar" type="submit" />
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}
