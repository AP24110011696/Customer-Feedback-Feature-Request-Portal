/**
 * Format a Date or ISO string into a short relative time ("2h ago").
 */
export const timeAgo = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export const statusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'badge-yellow';
    case 'reviewed':
      return 'badge-blue';
    case 'implemented':
      return 'badge-green';
    case 'rejected':
      return 'badge-red';
    default:
      return 'badge-gray';
  }
};

export const sentimentColor = (label) => {
  switch (label) {
    case 'positive':
      return 'badge-green';
    case 'negative':
      return 'badge-red';
    default:
      return 'badge-gray';
  }
};

export const categoryColor = (cat) => {
  const map = {
    Bug: 'badge-red',
    'UI/UX': 'badge-purple',
    Performance: 'badge-yellow',
    General: 'badge-gray',
    Feature: 'badge-blue',
    Integration: 'badge-green',
    Other: 'badge-gray',
  };
  return map[cat] || 'badge-gray';
};
