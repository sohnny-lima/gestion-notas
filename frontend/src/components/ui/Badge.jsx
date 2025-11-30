// src/components/ui/Badge.jsx
export const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    gray: "bg-slate-100 text-slate-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        colors[color] || colors.blue
      }`}
    >
      {children}
    </span>
  );
};
