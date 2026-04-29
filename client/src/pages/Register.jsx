import {
  useState,
} from "react";
import axios from "axios";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] =
    useState({
      username: "",
      email: "",
      password: "",
      role: "employee",
    });

  const registerUser =
    async () => {
      try {
        if (
          !form.username.trim()
        ) {
          toast.error(
            "Enter username"
          );
          return;
        }

        if (
          !form.email.trim()
        ) {
          toast.error(
            "Enter email"
          );
          return;
        }

        if (
          !form.password.trim()
        ) {
          toast.error(
            "Enter password"
          );
          return;
        }

        const payload = form;

        await axios.post(
          import.meta.env
            .VITE_API_URL +
            "/api/auth/register",
          payload
        );

        toast.success(
          "Registered Successfully"
        );

        setTimeout(
          () => nav("/"),
          1000
        );
      } catch (err) {
        toast.error(
          err.response?.data
            ?.message ||
            "Register failed"
        );
      }
    };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black px-4">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-teal-900/50 rounded-3xl shadow-[0_0_40px_rgba(20,184,166,0.1)]">

        <h1 className="text-4xl font-bold text-center mb-6 text-white">
          Create Account
        </h1>

        <input
          placeholder="Username"
          className="w-full p-4 mb-4 rounded-3xl bg-black text-white border border-zinc-800 placeholder-zinc-500 focus:border-teal-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({
              ...form,
              username:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Email"
          className="w-full p-4 mb-4 rounded-3xl bg-black text-white border border-zinc-800 placeholder-zinc-500 focus:border-teal-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({
              ...form,
              email:
                e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 mb-4 rounded-3xl bg-black text-white border border-zinc-800 placeholder-zinc-500 focus:border-teal-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({
              ...form,
              password:
                e.target.value,
            })
          }
        />

        <select
          className="w-full p-4 mb-6 rounded-3xl bg-black text-white border border-zinc-800 focus:border-teal-500 focus:outline-none transition-all"
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value,
            })
          }
          value={form.role}
        >
          <option value="employee">
            Employee
          </option>
          <option value="tl">
            Team Lead
          </option>
          <option value="manager">
            Manager
          </option>
          <option value="admin">
            Admin
          </option>
        </select>

        <button
          onClick={
            registerUser
          }
          className="w-full bg-teal-600 text-white p-4 rounded-3xl font-bold hover:bg-teal-500 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all"
        >
          Register
        </button>

        <p className="text-center mt-6 text-sm text-zinc-400">
          <Link to="/" className="text-teal-400 font-medium hover:text-teal-300 hover:underline transition-colors">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}