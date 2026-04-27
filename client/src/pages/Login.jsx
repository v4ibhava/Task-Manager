import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const loginUser = async () => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/auth/login",
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      if (res.data.email) {
        localStorage.setItem("email", res.data.email);
      }

      toast.success("login successful");

      nav("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

return (
    <div className="min-h-screen flex justify-center items-center bg-slate-900 px-4">
      <div className="bg-slate-800 p-8 rounded-none w-full max-w-md shadow-2xl border border-slate-700">
        <h1 className="text-4xl font-bold text-center mb-6 text-cyan-400">
          Sign In
        </h1>

        <input
          placeholder="Username or Email"
          className="w-full p-4 mb-4 rounded-none bg-slate-700 text-white border border-slate-600 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({ ...form, login: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 mb-6 rounded-none bg-slate-700 text-white border border-slate-600 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={loginUser}
          className="w-full bg-cyan-600 text-white p-4 rounded-none font-semibold hover:bg-cyan-700 transition-all"
        >
          Login
        </button>

        <p className="text-slate-400 text-sm mt-6 text-center">
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}