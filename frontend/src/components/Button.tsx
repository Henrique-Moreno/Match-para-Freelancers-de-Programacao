import "./Button.css";

export default function Button({
  label,
  onClick,
  type = "button",
  primary = true,
}: {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  primary?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-3 rounded-md text-base font-semibold cursor-pointer transition-colors duration-200 ${
        primary
          ? "bg-blue-900 text-white hover:bg-blue-700"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );
}
