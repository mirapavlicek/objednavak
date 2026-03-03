export const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const fromMin = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const getToday = () => new Date().toISOString().split("T")[0];
export const getTomorrow = () => new Date(Date.now() + 86400000).toISOString().split("T")[0];
export const addDays = (input, n) => {
  const d = input instanceof Date ? new Date(input) : new Date(input + "T00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};
export const getMonday = (input) => {
  const d = input instanceof Date ? new Date(input) : new Date(input + "T00:00");
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
};
export const formatDateCz = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
};
