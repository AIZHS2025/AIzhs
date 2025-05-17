export function happenTimeFun(num) {
  const date = new Date(num * 1000);
  const y = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${MM}-${d}`;
}

export function formatFullTime(num) {
  const date = new Date(num * 1000);
  const y = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${MM}-${d} ${h}:${m}:${s}`;
}

export function formatPrice(cents) {
  return (cents / 100).toFixed(2);
}
