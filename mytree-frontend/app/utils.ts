import { Tree } from "./types";

export function getSecureImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") && typeof window !== "undefined" && window.location.protocol === "https:") {
    return url.replace("http://", "https://");
  }
  return url;
}

export function calcAge(tree: Tree, unit: "day" | "month" | "year") {
  if (!tree.plant_date) return "-";
  const plant = new Date(tree.plant_date);
  if (isNaN(plant.getTime())) return "-";
  let endDate = new Date();
  if (tree.status === "ตายแล้ว" && tree.updated_at) {
    endDate = new Date(tree.updated_at);
  }
  if (plant > endDate) return "-";
  const diffTime = endDate.getTime() - plant.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (unit === "day") return diffDays.toString();
  if (unit === "month") return Math.floor(diffDays / 30).toString();
  if (unit === "year") return Math.floor(diffDays / 365).toString();
  return diffDays.toString();
}

export function getSortValue(
  tree: Tree,
  key: "strain" | "nickname" | "plant_date" | "variety" | "sex" | "status"
) {
  if (key === "strain") return tree.strain?.name?.toLowerCase() || "";
  if (key === "nickname") return tree.nickname?.toLowerCase() || "";
  if (key === "plant_date") return tree.plant_date || "";
  if (key === "variety") return tree.variety?.toLowerCase() || "";
  if (key === "sex") return tree.sex?.toLowerCase() || "";
  if (key === "status") return tree.status?.toLowerCase() || "";
  return "";
}

export function getFileName(url: string) {
  try {
    return decodeURIComponent(url.split("/").pop() || "");
  } catch {
    return url;
  }
}

export function getFileType(url: string) {
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (["jpg", "jpeg", "png"].includes(ext || "")) return "Image";
  return "File";
}

export function getSexBadgeColor(sex: string): string {
  switch (sex) {
    case 'male': return 'info'; // ฟ้า
    case 'female': return 'pink'; // ชมพู
    case 'bisexual': return 'success'; // เขียว
    case 'mixed': return 'warning'; // เหลือง
    case 'monoecious': return 'blue'; // น้ำเงิน
    case 'unknown': return 'gray'; // เทา
    default: return 'gray';
  }
}

export function sexLabel(sex: string): string {
  switch (sex) {
    case 'bisexual': return 'สมบูรณ์เพศ';
    case 'male': return 'ตัวผู้';
    case 'female': return 'ตัวเมีย';
    case 'monoecious': return 'แยกเพศในต้นเดียวกัน';
    case 'mixed': return 'ผสมหลายเพศ';
    case 'unknown': return 'ไม่ระบุ/ไม่แน่ใจ';
    default: return '-';
  }
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric'
  });
}

export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit', minute: '2-digit'
  });
}

/**
 * Get CSS classes for sex badge styling
 * Returns background, text, and border classes for light/dark modes
 */
export function getSexColorClass(sex: string): string {
  switch (sex) {
    case 'male':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'female':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 border-pink-200 dark:border-pink-800';
    case 'bisexual':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'mixed':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    case 'monoecious':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  }
}

export type SexType = 'male' | 'female' | 'bisexual' | 'mixed' | 'monoecious' | 'unknown';

