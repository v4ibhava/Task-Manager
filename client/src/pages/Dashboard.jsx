import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

function App() {
  // State for task management
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  // State for users and teams
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamLeader, setTeamLeader] = useState("");

  // Get current user details from local storage
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const API = import.meta.env.VITE_API_URL + "/api/tasks";

  // Helper function to get authenticated axios instance
  const getAxiosInstance = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Fetch all tasks
  const getTasks = async () => {
    try {
      const axiosInstance = getAxiosInstance();
      const res = await axiosInstance.get(API);
      setTasks(res.data);
    } catch (error) {
      toast.error("Failed to load tasks");
    }
  };

  // Filter tasks based on search input
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  // Add a new task and assign it to an employee
  const addTask = async () => {
    try {
      if (!title.trim()) {
        toast.error("Enter task title");
        return;
      }
      if (!assignedTo) {
        toast.error("Select employee");
        return;
      }

      const axiosInstance = getAxiosInstance();
      await axiosInstance.post(API, { title, description, assignedTo });

      setTitle("");
      setDescription("");
      setAssignedTo("");
      getTasks(); // Refresh list
      toast.success("Task Added");
    } catch {
      toast.error("Failed to add task");
    }
  };

  // Delete a specific task
  const deleteTask = async (id) => {
    try {
      const axiosInstance = getAxiosInstance();
      await axiosInstance.delete(`${API}/${id}`);
      getTasks();
      toast.success("Task Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // Update task status (pending, ongoing, completed)
  const changeStatus = async (id, newStatus) => {
    try {
      const axiosInstance = getAxiosInstance();
      await axiosInstance.put(`${API}/${id}`, { status: newStatus });
      getTasks();
      toast.success("Status Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  // Fetch all users for dropdowns
  const getUsers = async () => {
    try {
      const axiosInstance = getAxiosInstance();
      const res = await axiosInstance.get(import.meta.env.VITE_API_URL + "/api/users");
      setUsers(res.data);
    } catch {}
  };

  // Fetch all teams
  const getTeams = async () => {
    try {
      const axiosInstance = getAxiosInstance();
      const res = await axiosInstance.get(import.meta.env.VITE_API_URL + "/api/teams");
      setTeams(res.data);
    } catch {}
  };

  // Create a new team and instantly assign a team leader
  const createTeam = async () => {
    try {
      if (!newTeamName.trim()) {
        toast.error("Enter team name");
        return;
      }
      if (!teamLeader) {
        toast.error("Select team leader");
        return;
      }
      const axiosInstance = getAxiosInstance();
      // 1. Create team
      const res = await axiosInstance.post(import.meta.env.VITE_API_URL + "/api/teams", {
        name: newTeamName,
      });
      // 2. Assign leader
      await axiosInstance.put(import.meta.env.VITE_API_URL + `/api/teams/${res.data._id}/leader`, {
        leaderId: teamLeader,
        teamName: newTeamName,
      });

      setNewTeamName("");
      setTeamLeader("");
      getTeams();
      getUsers();
      toast.success("Team created and leader assigned");
    } catch {
      toast.error("Failed to create team");
    }
  };

  // Delete a team
  const deleteTeam = async (id) => {
    try {
      const axiosInstance = getAxiosInstance();
      await axiosInstance.delete(import.meta.env.VITE_API_URL + `/api/teams/${id}`);
      getTeams();
      toast.success("Team deleted");
    } catch {
      toast.error("Failed to delete team");
    }
  };

  // Initial load
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
      return;
    }
    getTasks();
    getUsers();
    getTeams();
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Dashboard Header Section */}
          <div className="bg-zinc-900 p-6 rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.05)] border border-teal-900/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center md:text-left">
              {username} <span className="text-teal-500">|</span> {role?.toUpperCase()} DASHBOARD
            </h1>
            
            {/* Search Bar (Only visible for Manager/Admin/TL) */}
            {role !== "employee" && (
              <div className="w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search tasks by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-black text-white border border-zinc-800 focus:outline-none focus:border-teal-500 transition-all placeholder-zinc-500"
                />
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className={`grid grid-cols-1 ${role !== "employee" ? "lg:grid-cols-3" : ""} gap-6`}>
            
            {/* Left Column: Tasks List */}
            <div className={`space-y-4 ${role !== "employee" ? "lg:col-span-2" : ""}`}>
              <h2 className="text-xl font-bold text-white mb-2 border-b border-teal-900/50 pb-2">Tasks List</h2>
              
              <div className="grid grid-cols-1 gap-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-zinc-900 rounded-lg p-5 border border-zinc-800 shadow-md gap-4"
                  >
                    {/* Task Details */}
                    <div className={task.status === "completed" ? "opacity-60" : ""}>
                      <h3 className={`text-lg font-bold ${task.status === "completed" ? "line-through text-zinc-500" : "text-white"}`}>
                        {task.title}
                      </h3>

                      {role !== "employee" && task.description && (
                        <p className="text-sm text-zinc-400 mt-1 mb-2">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <p className="text-xs text-teal-400">
                          <span className="text-zinc-500">By:</span> {task.assignedBy?.username}
                        </p>
                        {role !== "employee" && (
                          <p className="text-xs text-amber-400">
                            <span className="text-zinc-500">To:</span> {task.assignedTo?.username}
                          </p>
                        )}
                        {role !== "employee" && (
                          <p className="text-xs text-zinc-500">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Task Actions */}
                    <div className="flex sm:flex-col md:flex-row gap-2 shrink-0">
                      <select
                        value={task.status}
                        onChange={(e) => changeStatus(task._id, e.target.value)}
                        className="px-3 py-2 rounded bg-black text-white border border-zinc-700 focus:outline-none focus:border-teal-500 transition-all"
                      >
                        <option value="pending">Pending</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>

                      {role !== "employee" && (
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="bg-transparent border border-rose-600/50 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors px-4 py-2 rounded"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="text-center bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                    <p className="text-zinc-500 text-lg">No Tasks Found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Management Forms (Only visible to non-employees) */}
            {role !== "employee" && (
              <div className="space-y-6">
                
                {/* Assign Task Section */}
                <div className="bg-zinc-900 p-6 rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.05)] border border-teal-900/30">
                  <h2 className="text-xl font-bold text-white mb-4 border-b border-teal-900/50 pb-2">Assign New Task</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Task Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded bg-black text-white border border-zinc-800 focus:outline-none focus:border-teal-500 transition-all placeholder-zinc-500"
                    />

                    <textarea
                      placeholder="Task Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded bg-black text-white border border-zinc-800 focus:outline-none focus:border-teal-500 transition-all placeholder-zinc-500 min-h-[100px]"
                    />

                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-4 py-3 rounded bg-black text-white border border-zinc-800 focus:outline-none focus:border-teal-500 transition-all"
                    >
                      <option value="">Select Employee</option>
                      {users
                        .filter((user) => {
                          const myRole = localStorage.getItem("role");
                          const myTeam = localStorage.getItem("team");
                          const myName = localStorage.getItem("username");

                          if (user.username === myName) return false;

                          // TL can assign to any employee (since employees no longer have teams assigned)
                          if (myRole === "tl") {
                            return user.role === "employee";
                          }

                          // Managers/Admins can assign to employees and TLs
                          if (myRole === "manager" || myRole === "admin") {
                            return user.role === "employee" || user.role === "tl";
                          }
                          return false;
                        })
                        .map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.username} {role === "manager" || role === "admin" ? `- ${user.team || "No Team"} ` : ""}({user.role})
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={addTask}
                      className="w-full bg-teal-600 hover:bg-teal-500 transition-all font-bold text-white py-3 rounded shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                    >
                      Assign Task
                    </button>
                  </div>
                </div>

                {/* Team Management Section (Only visible to manager/admin) */}
                {(role === "manager" || role === "admin") && (
                  <div className="bg-zinc-900 p-6 rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.05)] border border-teal-900/30">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-teal-900/50 pb-2">Team Management</h2>

                    {/* Create Team Form */}
                    <div className="space-y-4 mb-6">
                      <input
                        type="text"
                        placeholder="New Team Name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="w-full px-4 py-3 rounded bg-black text-white border border-zinc-800 focus:outline-none focus:border-teal-500 transition-all placeholder-zinc-500"
                      />

                      <select
                        value={teamLeader}
                        onChange={(e) => setTeamLeader(e.target.value)}
                        className="w-full px-4 py-3 rounded bg-black text-white border border-zinc-800 focus:outline-none focus:border-teal-500 transition-all"
                      >
                        <option value="">Select Team Leader</option>
                        {users
                          .filter((u) => u.role === "tl")
                          .map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.username} ({user.role})
                            </option>
                          ))}
                      </select>

                      <button
                        onClick={createTeam}
                        className="w-full bg-teal-600 hover:bg-teal-500 transition-all font-bold text-white py-3 rounded shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                      >
                        Create Team
                      </button>
                    </div>

                    {/* Existing Teams List */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Existing Teams</h3>
                      {teams.map((team) => {
                        const leaderUser = users.find((u) => u._id === team.leader || u._id === team.leader?._id);
                        return (
                          <div
                            key={team._id}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black rounded p-3 border border-zinc-800 gap-3"
                          >
                            <div>
                              <span className="text-white font-semibold block">{team.name}</span>
                              <span className="text-xs text-teal-400">
                                <span className="text-zinc-500">TL:</span> {leaderUser ? leaderUser.username : team.leader?.username || team.leaderName || "None"}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteTeam(team._id)}
                              className="bg-transparent border border-rose-600/50 text-rose-500 hover:bg-rose-600 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                      {teams.length === 0 && (
                         <p className="text-xs text-zinc-500 italic">No teams created yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;