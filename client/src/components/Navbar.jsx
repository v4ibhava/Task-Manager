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
    <nav className="bg-black p-4 flex justify-between items-center shadow-lg border-b border-teal-900 sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-teal-400 tracking-wider">TASKY</h1>
      <div className="flex items-center gap-4">
        <span className="text-white font-medium">Hello! {user}</span>
        <button
          onClick={handleLogout}
          className="bg-transparent border border-teal-500 text-teal-400 px-4 py-2 font-medium hover:bg-teal-900/30 transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}