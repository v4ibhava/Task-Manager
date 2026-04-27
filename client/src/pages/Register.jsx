import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const registerUser = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      toast.success("Register successfully");
      setTimeout(()=> nav("/"), 1000);

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Register failed"
      );
    }
  };

return (
    <div className="min-h-screen flex justify-center items-center bg-slate-900 px-4">
      <div className="bg-slate-800 p-8 rounded-none w-full max-w-md shadow-2xl border border-slate-700">
        <h1 className="text-4xl font-bold text-center mb-6 text-cyan-400">
          Create Account
        </h1>

        <input
          placeholder="Username"
          className="w-full p-4 mb-4 rounded-none bg-slate-700 text-white border border-slate-600 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="w-full p-4 mb-4 rounded-none bg-slate-700 text-white border border-slate-600 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
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
          onClick={registerUser}
          className="w-full bg-cyan-600 text-white p-4 rounded-none font-semibold hover:bg-cyan-700 transition-all"
        >
          Register
        </button>

        <p className="text-slate-400 text-sm mt-6 text-center">
          <Link to="/" className="text-cyan-400 hover:text-cyan-300 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}