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
