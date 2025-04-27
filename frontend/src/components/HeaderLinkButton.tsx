import { useNavigate } from "react-router-dom";
import "./HeaderLinkButton.css";

interface HeaderLinkButtonProps {
  label: string;
  to: string;
}

export default function HeaderLinkButton({ label, to }: HeaderLinkButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button className="header-link-button" onClick={handleClick}>
      {label}
    </button>
  );
}