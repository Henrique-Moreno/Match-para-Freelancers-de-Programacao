import { useState } from "react";
import { api } from "../../api/axios";
import Button from "../../components/Button";
import { Link } from "react-router-dom";
import "./home.css";

export default function Home() {
  const [formType, setFormType] = useState<"client" | "freelancer">("client");
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    phone: "",
  });
  const [freelancerForm, setFreelancerForm] = useState({
    name: "",
    email: "",
    password: "",
    skills: "",
    portfolio_url: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  const handleFreelancerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFreelancerForm({ ...freelancerForm, [e.target.name]: e.target.value });
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await api.post("/client/register", clientForm);
      setSuccess(response.data.message);
      setClientForm({
        name: "",
        email: "",
        password: "",
        company: "",
        phone: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao cadastrar cliente.");
    }
  };

  const handleFreelancerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await api.post("/freelancer/register", freelancerForm);
      setSuccess(response.data.message);
      setFreelancerForm({
        name: "",
        email: "",
        password: "",
        skills: "",
        portfolio_url: "",
        phone: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao cadastrar freelancer.");
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Match para Freelancers de Programação</h1>
      <div className="form-toggle">
        <Button
          label="Cadastrar como Cliente"
          onClick={() => setFormType("client")}
          primary={formType === "client"}
        />
        <Button
          label="Cadastrar como Freelancer"
          onClick={() => setFormType("freelancer")}
          primary={formType === "freelancer"}
        />
      </div>

      {formType === "client" ? (
        <form className="form" onSubmit={handleClientSubmit}>
          <h2>Cadastro de Cliente</h2>
          <input
            type="text"
            name="name"
            value={clientForm.name}
            onChange={handleClientChange}
            placeholder="Nome"
            required
          />
          <input
            type="email"
            name="email"
            value={clientForm.email}
            onChange={handleClientChange}
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={clientForm.password}
            onChange={handleClientChange}
            placeholder="Senha"
            required
          />
          <input
            type="text"
            name="company"
            value={clientForm.company}
            onChange={handleClientChange}
            placeholder="Empresa (opcional)"
          />
          <input
            type="text"
            name="phone"
            value={clientForm.phone}
            onChange={handleClientChange}
            placeholder="Telefone (opcional)"
          />
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <Button label="Cadastrar" type="submit" />
          <p className="form-footer">
            Já tem cadastro? <Link to="/sign">Faça seu login</Link>
          </p>
        </form>
      ) : (
        <form className="form" onSubmit={handleFreelancerSubmit}>
          <h2>Cadastro de Freelancer</h2>
          <input
            type="text"
            name="name"
            value={freelancerForm.name}
            onChange={handleFreelancerChange}
            placeholder="Nome"
            required
          />
          <input
            type="email"
            name="email"
            value={freelancerForm.email}
            onChange={handleFreelancerChange}
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={freelancerForm.password}
            onChange={handleFreelancerChange}
            placeholder="Senha"
            required
          />
          <input
            type="text"
            name="skills"
            value={freelancerForm.skills}
            onChange={handleFreelancerChange}
            placeholder="Habilidades (ex.: Python, React)"
          />
          <input
            type="url"
            name="portfolio_url"
            value={freelancerForm.portfolio_url}
            onChange={handleFreelancerChange}
            placeholder="URL do Portfólio (opcional)"
          />
          <input
            type="text"
            name="phone"
            value={freelancerForm.phone}
            onChange={handleFreelancerChange}
            placeholder="Telefone (opcional)"
          />
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <Button label="Cadastrar" type="submit" />
          <p className="form-footer">
            Já tem cadastro? <Link to="/sign">Faça seu login</Link>
          </p>
        </form>
      )}
    </div>
  );
}
