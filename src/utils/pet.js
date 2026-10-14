export function getAgeLabel(birthDate) {
  if (!birthDate) return 'Edad no indicada';
  const birth = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return 'Edad no indicada';
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years < 1) {
    const totalMonths = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth() - (now.getDate() < birth.getDate() ? 1 : 0));
    return totalMonths <= 1 ? 'Menos de 2 meses' : `${totalMonths} meses`;
  }
  return months ? `${years} año${years === 1 ? '' : 's'} y ${months} m` : `${years} año${years === 1 ? '' : 's'}`;
}

export function getInitials(name = '') {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || '🐾';
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(date));
}