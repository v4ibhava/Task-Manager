import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
import toast from "react-hot-toast";

function App() {
  // State for task management
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");

  // Pagination, Filter, Sort, Stats state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [stats, setStats] = useState({ pending: 0, ongoing: 0, completed: 0 });

  // State for users and teams
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamLeader, setTeamLeader] = useState("");

  // State for task details modal
  const [selectedTask, setSelectedTask] = useState(null);

  // Get current user details from local storage
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

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
      const params = {
        page: currentPage,
        limit: 10,
        search,
        status: statusFilter,
        sortBy,
        order
      };
      const res = await axiosInstance.get(API, { params });
      setTasks(res.data.tasks);
      setTotalPages(res.data.totalPages || 1);
      setStats(res.data.stats || { pending: 0, ongoing: 0, completed: 0 });
    } catch (error) {
      toast.error("Failed to load tasks");
    }
  };

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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add task");
    }
  };

  // Delete a specific task
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

  // Update task status (pending, ongoing, completed)
  const changeStatus = async (id, newStatus) => {
    try {
      const axiosInstance = getAxiosInstance();
      await axiosInstance.put(`${API}/${id}`, { status: newStatus });
      getTasks();
      toast.success("Status Updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
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

  // Check if current user can change status for a given task
  const canChangeStatus = (task) => {
    // Managers, admins, TLs can change any task status
    if (role === "manager" || role === "admin" || role === "tl") return true;
    // Employees can only change status of tasks assigned to them
    if (role === "employee" && task.assignedTo?._id === userId) return true;
    return false;
  };

  // Status display helpers
  const statusStyles = {
    pending: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    ongoing: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  };

  const statusLabel = {
    pending: "Pending",
    ongoing: "In Progress",
    completed: "Completed",
  };

  // Initial load and dependency updates
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      getTasks();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, currentPage, statusFilter, sortBy, order]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getUsers();
      getTeams();
    }
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
            
            {/* Search Bar */}
            <div className="w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search tasks by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-black text-white border border-zinc-800 focus:outline-none focus:border-teal-500 transition-all placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-amber-500/30 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-amber-400 text-3xl font-bold">{stats.pending || 0}</span>
              <span className="text-zinc-400 text-sm uppercase tracking-wider mt-1">Pending</span>
            </div>
            <div className="bg-zinc-900 border border-blue-500/30 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-blue-400 text-3xl font-bold">{stats.ongoing || 0}</span>
              <span className="text-zinc-400 text-sm uppercase tracking-wider mt-1">In Progress</span>
            </div>
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-emerald-400 text-3xl font-bold">{stats.completed || 0}</span>
              <span className="text-zinc-400 text-sm uppercase tracking-wider mt-1">Completed</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className={`grid grid-cols-1 ${role !== "employee" ? "lg:grid-cols-3" : ""} gap-6`}>
            
            {/* Left Column: Tasks Table */}
            <div className={`space-y-4 ${role !== "employee" ? "lg:col-span-2" : ""}`}>
              <h2 className="text-xl font-bold text-white mb-2 border-b border-teal-900/50 pb-2">
                Tasks List
                <span className="text-sm font-normal text-zinc-500 ml-3">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                </span>
              </h2>

              {/* Filters & Sorting */}
              <div className="flex flex-wrap gap-4 items-center mb-4 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1.5 rounded bg-black text-white text-sm border border-zinc-700 focus:outline-none focus:border-teal-500"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="ongoing">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">Sort By:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1.5 rounded bg-black text-white text-sm border border-zinc-700 focus:outline-none focus:border-teal-500"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="title">Title</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">Order:</label>
                  <select
                    value={order}
                    onChange={(e) => { setOrder(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1.5 rounded bg-black text-white text-sm border border-zinc-700 focus:outline-none focus:border-teal-500"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
              
              {/* Table Container */}
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    {/* Table Header */}
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/80">
                        <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                          Title
                        </th>
                        {role !== "employee" && (
                          <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">
                            Assigned To
                          </th>
                        )}
                        <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">
                          Assigned By
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">
                          Date
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-zinc-800/50">
                      {tasks.map((task) => (
                        <tr
                          key={task._id}
                          className={`hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                            task.status === "completed" ? "opacity-60" : ""
                          }`}
                          onClick={() => setSelectedTask(task)}
                        >
                          {/* Title + Description preview */}
                          <td className="px-4 py-3.5">
                            <p
                              className={`font-semibold text-sm ${
                                task.status === "completed"
                                  ? "line-through text-zinc-500"
                                  : "text-white"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">
                                {task.description}
                              </p>
                            )}
                          </td>

                          {/* Assigned To (non-employees only) */}
                          {role !== "employee" && (
                            <td className="px-4 py-3.5 hidden md:table-cell">
                              <span className="text-sm text-amber-400 font-medium">
                                {task.assignedTo?.username || "—"}
                              </span>
                            </td>
                          )}

                          {/* Assigned By */}
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <span className="text-sm text-teal-400">
                              {task.assignedBy?.username || "—"}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                statusStyles[task.status] || "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {statusLabel[task.status] || task.status}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <span className="text-xs text-zinc-500">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div
                              className="flex items-center justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Status Dropdown — only if user has permission */}
                              {canChangeStatus(task) && (
                                <select
                                  value={task.status}
                                  onChange={(e) =>
                                    changeStatus(task._id, e.target.value)
                                  }
                                  className="px-2 py-1.5 rounded bg-black text-white text-xs border border-zinc-700 focus:outline-none focus:border-teal-500 transition-all"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="ongoing">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              )}

                              {/* View button */}
                              <button
                                onClick={() => setSelectedTask(task)}
                                className="text-teal-400 hover:text-teal-300 transition-colors text-xs border border-teal-700/50 px-2.5 py-1.5 rounded hover:bg-teal-900/30"
                              >
                                View
                              </button>

                              {/* Delete button (non-employees only) */}
                              {role !== "employee" && (
                                <button
                                  onClick={() => deleteTask(task._id)}
                                  className="text-rose-500 hover:text-white hover:bg-rose-600 transition-colors text-xs border border-rose-600/50 px-2.5 py-1.5 rounded"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Empty State */}
                  {tasks.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-zinc-500 text-lg">No Tasks Found</p>
                      <p className="text-zinc-600 text-sm mt-1">
                        {search || statusFilter !== "all"
                          ? "Try different search/filters"
                          : role === "employee"
                          ? "No tasks have been assigned to you yet"
                          : "Create a new task to get started"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-zinc-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
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

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Search & Select Assignee
                      </label>
                      <input
                        type="text"
                        placeholder="Search by name or role..."
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        className="w-full px-4 py-2 rounded bg-black text-white border border-zinc-800 focus:outline-none focus:border-teal-500 transition-all placeholder-zinc-600 text-sm"
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
                            const myName = localStorage.getItem("username");

                            if (user.username === myName) return false;

                            // Filter by search text
                            const matchesSearch = 
                              user.username.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
                              user.role.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
                              (user.team && user.team.toLowerCase().includes(assigneeSearch.toLowerCase()));
                            
                            if (!matchesSearch) return false;

                            // Role based logic
                            if (myRole === "tl") {
                              return user.role === "employee";
                            }

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
                    </div>

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
                        return (
                          <div
                            key={team._id}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black rounded p-3 border border-zinc-800 gap-3"
                          >
                            <div>
                              <span className="text-white font-semibold block">{team.name}</span>
                              <span className="text-xs text-teal-400">
                                <span className="text-zinc-500">TL:</span> {team.leader?.username || "None"}
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

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          role={role}
        />
      )}
    </>
  );
}

export default App;