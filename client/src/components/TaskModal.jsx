import React from "react";

/**
 * TaskModal — Displays complete task information in a modal overlay.
 * Props:
 *   task     — The task object to display
 *   onClose  — Callback to close the modal
 *   role     — Current user's role (for conditional display)
 */
export default function TaskModal({ task, onClose, role }) {
  if (!task) return null;

  // Map status to badge styles
  const statusStyles = {
    pending:
      "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    ongoing:
      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    completed:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  };

  const statusLabel = {
    pending: "Pending",
    ongoing: "In Progress",
    completed: "Completed",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-teal-900/50 rounded-2xl w-full max-w-lg shadow-[0_0_60px_rgba(20,184,166,0.12)] overflow-hidden animate-[modalIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white truncate pr-4">
            Task Details
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Title
            </span>
            <p className="text-white text-lg font-semibold mt-1">
              {task.title}
            </p>
          </div>

          {/* Description */}
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Description
            </span>
            <p className="text-zinc-300 mt-1 leading-relaxed">
              {task.description || (
                <span className="italic text-zinc-600">No description provided</span>
              )}
            </p>
          </div>

          {/* Status Badge */}
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Status
            </span>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  statusStyles[task.status] || "bg-zinc-800 text-zinc-400"
                }`}
              >
                {statusLabel[task.status] || task.status}
              </span>
            </div>
          </div>

          {/* Assignment Info — two columns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Assigned By
              </span>
              <p className="text-teal-400 font-medium mt-1">
                {task.assignedBy?.username || "—"}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                {task.assignedBy?.role?.toUpperCase() || ""}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Assigned To
              </span>
              <p className="text-amber-400 font-medium mt-1">
                {task.assignedTo?.username || "—"}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                {task.assignedTo?.role?.toUpperCase() || ""}
              </p>
            </div>
          </div>

          {/* Team */}
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Team
            </span>
            <p className="text-zinc-300 mt-1 capitalize">
              {task.team || "General"}
            </p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Created
              </span>
              <p className="text-zinc-400 text-sm mt-1">
                {task.createdAt
                  ? new Date(task.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Last Updated
              </span>
              <p className="text-zinc-400 text-sm mt-1">
                {task.updatedAt
                  ? new Date(task.updatedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-500 transition-all hover:shadow-[0_0_15px_rgba(20,184,166,0.3)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
