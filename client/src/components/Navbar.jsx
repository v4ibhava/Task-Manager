import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("theme");
    navigate("/");
  };

  const user = localStorage.getItem("username") || localStorage.getItem("email") || "User";

  return (
    <nav className="bg-slate-800 p-4 flex justify-between items-center shadow-lg border-b border-slate-700 sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-white">TASKY</h1>
      <div className="flex items-center gap-4">
        <span className="text-slate-300 font-medium">{user}</span>
        <button
          onClick={handleLogout}
          className="bg-rose-600 text-white px-4 py-2 rounded-none font-medium hover:bg-rose-700 transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}