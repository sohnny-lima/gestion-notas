// src/components/ui/Button.jsx
export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
  type = "button",
}) => {
  const base =
    "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} className="mr-2" />}
      {children}
    </button>
  );
};
