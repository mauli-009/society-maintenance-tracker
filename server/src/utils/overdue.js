// Number of days after which an open complaint is considered overdue.
// Configurable via the OVERDUE_DAYS env var (defaults to 3).
const getOverdueDays = () => {
  const days = parseInt(process.env.OVERDUE_DAYS, 10);
  return Number.isNaN(days) ? 3 : days;
};

// Given a complaint, decide whether it is currently overdue.
// A complaint is overdue if it is NOT closed and its age (since creation)
// exceeds the configured threshold.
export const isComplaintOverdue = (complaint) => {
  if (complaint.isClosed || complaint.status === "Resolved") return false;

  const thresholdMs = getOverdueDays() * 24 * 60 * 60 * 1000;
  const ageMs = Date.now() - new Date(complaint.createdAt).getTime();

  return ageMs > thresholdMs;
};

// Numeric weight for priority so we can sort High > Medium > Low correctly
// (MongoDB would otherwise sort these strings alphabetically, which is wrong).
export const priorityWeight = {
  High: 3,
  Medium: 2,
  Low: 1,
};