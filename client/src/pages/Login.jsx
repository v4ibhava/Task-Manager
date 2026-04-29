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
      localStorage.setItem("email", res.data.email || "");
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("team", res.data.team || "");

      toast.success("login successful");

      nav("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

return (
    <div className="min-h-screen flex justify-center items-center bg-black px-4 ">
      <div className="bg-transparent p-8 rounded-3xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-white">
          Sign In
        </h1>

        <input
          placeholder="Username or Email"
          className="w-full p-4 mb-4 rounded-3xl bg-slate-700 text-white border border-slate-600 placeholder-white focus:border-cyan-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({ ...form, login: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 mb-6 rounded-3xl bg-slate-700 text-white border border-slate-600 placeholder-white focus:border-cyan-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={loginUser}
          className="w-full bg-cyan-600 text-white p-4 rounded-3xl font-semibold hover:bg-cyan-700 hover:text-white transition-all"
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