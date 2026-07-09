const statusColors = {
  Open: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  Resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const priorityColors = {
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  Medium: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  High: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColors[status] || ""}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${priorityColors[priority] || ""}`}>
      {priority}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-600 text-white">
      Overdue
    </span>
  );
}