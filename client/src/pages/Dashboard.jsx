import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

function App() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");

  const API = import.meta.env.VITE_API_URL + "/api/tasks";

  // Create axios instance with token
  const getAxiosInstance = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  const getTasks = async () => {
    try {
      const axiosInstance = getAxiosInstance();
      const res = await axiosInstance.get(API);
      setTasks(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load tasks");
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const addTask = async () => {
    try {
      if (!title.trim()) return;
      
      const axiosInstance = getAxiosInstance();
      const res = await axiosInstance.post(API, { title });
      
      setTitle("");
      getTasks();
      toast.success("Task Added");
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to add task");
    }
  };

  const deleteTask = async (id) => {
    try {
      const axiosInstance = getAxiosInstance();
      await axiosInstance.delete(`${API}/${id}`);
      getTasks();
      toast.success("Task Deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const changeStatus = async (id, newStatus) => {
    try {
      const axiosInstance = getAxiosInstance();
      await axiosInstance.put(`${API}/${id}`, {
        status: newStatus,
      });
      getTasks();
      toast.success("Status Updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4">
        <div className="bg-slate-800 shadow-2xl rounded-none w-full max-w-md p-8 border border-slate-700">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">YOUR TASKS</h1>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-600 w-full px-4 py-3 rounded-none outline-none bg-slate-700 text-white placeholder-slate-400 focus:border-cyan-500 transition-all"
            />
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Write your here..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-slate-600 w-full px-4 py-3 rounded-none outline-none bg-slate-700 text-white placeholder-slate-400 focus:border-cyan-500 transition-all"
            />

            <button
              onClick={addTask}
              className="bg-cyan-600 text-white px-6 py-3 rounded-none font-semibold hover:bg-cyan-700 transition-all"
            >
              Add
            </button>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="flex justify-between items-center bg-slate-700 p-4 rounded-none border border-slate-600 hover:border-slate-500 transition-all"
              >
                <span
                  className={
                    task.status === "completed"
                      ? "line-through text-slate-500"
                      : "text-slate-100"
                  }
                >
                  {task.title}
                </span>

                <div className="flex gap-2">
                  <select
                    value={task.status || "pending"}
                    onChange={(e) => changeStatus(task._id, e.target.value)}
                    className={`px-3 py-2 rounded-none text-white border-0 cursor-pointer font-medium ${task.status === "completed"
                        ? "bg-emerald-600"
                        : task.status === "ongoing"
                          ? "bg-blue-600"
                          : "bg-amber-500"
                      }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => deleteTask(task._id)}
                    className="bg-rose-600 text-white px-3 py-2 rounded-none hover:bg-rose-700 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
