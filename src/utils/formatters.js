import { fakultasData } from "../data/fakultasData";

/**
 * Format string fakultas dari value database ke bentuk label yang baku.
 * Contoh: "Teknik dan Sains" -> "Fakultas Teknik dan Sains"
 * @param {string} fakultasValue - Nilai fakultas dari backend.
 * @returns {string} - String fakultas yang sudah diformat.
 */
export const formatFakultas = (fakultasValue) => {
  if (!fakultasValue || fakultasValue === "-") return "-";

  // Coba temukan label dari fakultasData
  const found = fakultasData.find((f) => f.value === fakultasValue);
  if (found) return found.label;

  // Jika tidak ditemukan di fakultasData, pastikan berawalan "Fakultas"
  const trimmed = fakultasValue.trim();
  if (trimmed.toLowerCase().startsWith("fakultas")) return trimmed;
  
  return `Fakultas ${trimmed}`;
};
