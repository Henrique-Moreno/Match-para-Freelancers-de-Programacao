import { useState } from "react";
import { api } from "../../api/axios";
import Button from "../../components/Button";
import { Link } from "react-router-dom";
import HeaderLinkButton from "../../components/HeaderLinkButton";
import "./sign.css";

export default function Sign() {
  const [formType, setFormType] = useState<"client" | "freelancer">("client");
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
    const endpoint =
      formType === "client" ? "/client/login" : "/freelancer/login";
    try {
      const response = await api.post(endpoint, formData);
      const { access_token } = response.data;
      localStorage.setItem("access_token", access_token);
      setSuccess("Login bem-sucedido! Redirecionando...");
      setFormData({ email: "", password: "" });
      setTimeout(() => {
        window.location.href =
          formType === "client" ? "/client/dashboard" : "/freelancer/dashboard";
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao fazer login.");
    }
  };

  return (
    <div>
      <div className="header-container">
        <HeaderLinkButton label="Login como Administrador" to="/admin/sign" />
      </div>
      <div className="sign-container">
        <h1 className="sign-title">Login - Match para Freelancers</h1>
        <div className="form-toggle">
          <Button
            label="Login como Cliente"
            onClick={() => setFormType("client")}
            primary={formType === "client"}
          />
          <Button
            label="Login como Freelancer"
            onClick={() => setFormType("freelancer")}
            primary={formType === "freelancer"}
          />
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <h2>
            {formType === "client" ? "Login de Cliente" : "Login de Freelancer"}
          </h2>
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
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <Button label="Entrar" type="submit" />
          <p className="form-footer">
            Não tem cadastro? <Link to="/">Faça seu cadastro</Link>
          </p>
        </form>
      </div>
    </div>
  );
}