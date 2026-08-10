// src/layouts/admin/AdminInventory.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Package as PackageIcon,
  Filter as FilterIcon,
  AlertTriangle as AlertTriangleIcon,
  X as XIcon,
  Search as SearchIcon,
  Loader2 as Loader2Icon,
  RefreshCw as RefreshCwIcon,
  Sparkles as SparklesIcon,
  Wand2 as Wand2Icon,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const ADMIN_API = `${API_BASE}/api/admin`;

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function readJsonOrText(res: Response): Promise<any> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

function toNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toStr(v: any, fallback = "") {
  if (v == null) return fallback;
  const s = String(v);
  return s.trim().length ? s : fallback;
}

// ---------- Date helpers (robust for YYYY-MM-DD without timezone bugs) ----------
function isYMD(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function normalizeToYMD(v: any): string | null {
  const s = toStr(v, "");
  if (!s) return null;

  // already YYYY-MM-DD
  if (isYMD(s.slice(0, 10))) return s.slice(0, 10);

  // try Date parsing for datetime strings
  const d = new Date(s);
  if (!Number.isFinite(d.getTime())) {
    const head = s.slice(0, 10);
    return isYMD(head) ? head : null;
  }

  // use local date parts to avoid shifting by TZ
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ymdToDateOnly(ymd: string): Date | null {
  if (!isYMD(ymd)) return null;
  const y = Number(ymd.slice(0, 4));
  const m = Number(ymd.slice(5, 7)) - 1;
  const d = Number(ymd.slice(8, 10));
  const dt = new Date(y, m, d, 0, 0, 0, 0);
  return Number.isFinite(dt.getTime()) ? dt : null;
}

function daysBetweenDateOnly(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// ---------- Types ----------
type InventoryStatus =
  | "Healthy"
  | "Reorder soon"
  | "Low"
  | "Expired"
  | "Expiring soon"
  | string;

type InventoryItem = {
  id: string;
  itemCode?: string;
  name: string;
  category: string;
  stock: number;
  reorderThreshold?: number;
  expiryDate?: string | null; // YYYY-MM-DD
  status: InventoryStatus;
  vendorId?: number | null;
};

type Vendor = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
};

// ---------- Status logic (worst-case: expiry + stock combined) ----------
const STATUS_SEVERITY: Record<string, number> = {
  "HEALTHY": 0,
  "REORDER SOON": 1,
  "EXPIRING SOON": 2,
  "LOW": 3,
  "EXPIRED": 4,
};

function maxStatus(a: InventoryStatus, b: InventoryStatus): InventoryStatus {
  const aa = String(a || "Healthy").toUpperCase();
  const bb = String(b || "Healthy").toUpperCase();
  const sa = STATUS_SEVERITY[aa] ?? 0;
  const sb = STATUS_SEVERITY[bb] ?? 0;
  return sb > sa ? b : a;
}

function computeExpiryStatus(expiryDate?: string | null): InventoryStatus {
  const expYmd = expiryDate ? normalizeToYMD(expiryDate) : null;
  const exp = expYmd ? ymdToDateOnly(expYmd) : null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (exp && Number.isFinite(exp.getTime())) {
    if (exp.getTime() < today.getTime()) return "Expired";
    const d = daysBetweenDateOnly(today, exp);
    if (d >= 0 && d <= 30) return "Expiring soon";
  }
  return "Healthy";
}

function computeStockStatus(stock: number, reorderThreshold?: number): InventoryStatus {
  const rt = typeof reorderThreshold === "number" ? reorderThreshold : null;
  if (rt == null) return "Healthy";
  if (stock <= rt) return "Low";
  if (stock <= Math.ceil(rt * 1.5)) return "Reorder soon";
  return "Healthy";
}

function computeStatus(stock: number, reorderThreshold?: number, expiryDate?: string | null): InventoryStatus {
  const s1 = computeExpiryStatus(expiryDate);
  const s2 = computeStockStatus(stock, reorderThreshold);
  return maxStatus(s1, s2);
}

function badgeFor(status: InventoryStatus) {
  if (status === "Healthy") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-500/30";
  }
  if (status === "Reorder soon" || status === "Expiring soon") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-200 border border-amber-500/30";
  }
  if (status === "Low" || status === "Expired") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-200 border border-rose-500/30";
  }
  return "bg-slate-500/10 text-slate-700 dark:text-slate-200 border border-slate-500/30";
}

function normalizeRow(r: any): InventoryItem {
  const id = toStr(
    r?.id ??
      r?.item_id ??
      r?.inventory_item_id ??
      r?.inventoryId ??
      r?.inventory_id ??
      r?.itemCode ??
      r?.item_code ??
      r?.code ??
      "—",
    "—"
  );

  const itemCode = toStr(
    r?.itemCode ?? r?.item_code ?? r?.code ?? r?.sku ?? r?.item_code_str ?? r?.itemCodeStr,
    ""
  );

  const name = toStr(r?.name ?? r?.item_name ?? r?.title, "—");
  const category = toStr(r?.category ?? r?.item_category ?? r?.type, "Uncategorized");

  const stock = Math.floor(
    toNum(
      r?.stock ??
        r?.quantity ??
        r?.qty ??
        r?.quantity_on_hand ??
        r?.on_hand ??
        r?.current_stock ??
        0,
      0
    )
  );

  const reorderThresholdRaw =
    r?.reorderThreshold ??
    r?.reorder_threshold ??
    r?.reorderLevel ??
    r?.reorder_level ??
    r?.min_stock ??
    r?.minimum_stock ??
    null;

  const reorderThreshold =
    reorderThresholdRaw == null ? undefined : Math.floor(toNum(reorderThresholdRaw, 0));

  const expiryDate = normalizeToYMD(r?.expiryDate ?? r?.expiry_date ?? r?.expiry ?? r?.expires_on ?? null);

  // ✅ IMPORTANT: We do NOT trust backend "status" for health.
  const status = computeStatus(stock, reorderThreshold, expiryDate);

  return {
    id,
    itemCode: itemCode || undefined,
    name,
    category,
    stock,
    reorderThreshold,
    expiryDate,
    status,
    vendorId: r?.vendorId ?? r?.vendor_id ?? null,
  };
}

// ---------- Inventory fetch (supports GET or POST backends) ----------
async function fetchInventoryFromKnownEndpoints(): Promise<any> {
  const url = `${ADMIN_API}/inventory`;

  // Try GET
  try {
    const res = await fetch(url, { headers: getAuthHeaders() });
    const body = await readJsonOrText(res);
    if (res.ok) return body;
  } catch {
    // ignore
  }

  // Fallback POST (some APIs incorrectly use POST for list)
  const res2 = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  });
  const body2 = await readJsonOrText(res2);

  if (!res2.ok) {
    const msg =
      (body2 && typeof body2 === "object" && (body2.error || body2.message)) ||
      (typeof body2 === "string" && body2.trim()) ||
      `HTTP ${res2.status}`;
    throw new Error(msg);
  }
  return body2;
}

// ---------- Quick add templates ----------
type QuickTemplate = {
  label: string;
  name: string;
  category: string;
  reorderThreshold: number;
  stock?: number;
};

const QUICK_TEMPLATES: QuickTemplate[] = [
  { label: "Gauze Pads", name: "Gauze", category: "Consumables", reorderThreshold: 10, stock: 50 },
  { label: "Cotton Rolls", name: "Cotton", category: "Consumables", reorderThreshold: 10, stock: 50 },
  { label: "Gloves (S)", name: "Gloves - Small", category: "Consumables", reorderThreshold: 20, stock: 100 },
  { label: "Gloves (M)", name: "Gloves - Medium", category: "Consumables", reorderThreshold: 20, stock: 100 },
  { label: "Gloves (L)", name: "Gloves - Large", category: "Consumables", reorderThreshold: 20, stock: 100 },
  { label: "Masks", name: "Masks", category: "Consumables", reorderThreshold: 20, stock: 100 },
  { label: "Syringes", name: "Syringe", category: "Consumables", reorderThreshold: 10, stock: 50 },
  { label: "Needles", name: "Needle", category: "Consumables", reorderThreshold: 10, stock: 50 },
  { label: "Anesthetic", name: "Anesthetic", category: "Consumables", reorderThreshold: 10, stock: 20 },
  { label: "Disinfectant", name: "Disinfectant", category: "Supplies", reorderThreshold: 5, stock: 10 },
  { label: "Composite Resin", name: "Composite Resin", category: "Materials", reorderThreshold: 5, stock: 10 },
  { label: "Etchant Gel", name: "Etchant Gel", category: "Materials", reorderThreshold: 5, stock: 10 },
  { label: "Bonding Agent", name: "Bonding Agent", category: "Materials", reorderThreshold: 5, stock: 10 },
];

function slugPrefix(name: string) {
  const letters = (name || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
  const base = (letters.slice(0, 4) || "ITEM").padEnd(4, "X");
  return base;
}

function generateItemCode(name: string, existingUpper: Set<string>) {
  const p = slugPrefix(name);
  for (let i = 1; i <= 999; i++) {
    const code = `${p}-${String(i).padStart(3, "0")}`;
    if (!existingUpper.has(code.toUpperCase())) return code;
  }
  return `${p}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;
}

export const AdminInventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [vendorSubmitting, setVendorSubmitting] = useState(false);
  const [vendorFormError, setVendorFormError] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignItem, setAssignItem] = useState<InventoryItem | null>(null);
  const [assignVendorId, setAssignVendorId] = useState<string>("");

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  function showToast(msg: string, autoHideMs = 3500) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), autoHideMs);
  }

  const [itemCode, setItemCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Consumables");
  const [stock, setStock] = useState<number>(0);
  const [reorderThreshold, setReorderThreshold] = useState<number>(10);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [vendorId, setVendorId] = useState<string>("");

  const existingCodesUpper = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) {
      const c = (it.itemCode || "").trim();
      if (c) s.add(c.toUpperCase());
    }
    return s;
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) set.add(it.category || "Uncategorized");
    return ["ALL", ...Array.from(set).sort()];
  }, [items]);

  const counts = useMemo(() => {
    const c = { total: items.length, low: 0, reorderSoon: 0, expiring: 0, expired: 0 };
    for (const it of items) {
      const s = it.status;
      if (s === "Low") c.low += 1;
      else if (s === "Reorder soon") c.reorderSoon += 1;
      else if (s === "Expiring soon") c.expiring += 1;
      else if (s === "Expired") c.expired += 1;
    }
    return c;
  }, [items]);

  const vendorMap = useMemo(() => {
    const m = new Map<number, Vendor>();
    for (const v of vendors) m.set(v.id, v);
    return m;
  }, [vendors]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesQuery =
        !q ||
        it.name.toLowerCase().includes(q) ||
        it.id.toLowerCase().includes(q) ||
        (it.itemCode || "").toLowerCase().includes(q) ||
        (it.category || "").toLowerCase().includes(q);

      const matchesCategory = categoryFilter === "ALL" || it.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" ? true : String(it.status) === String(statusFilter);

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [items, query, categoryFilter, statusFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchInventoryFromKnownEndpoints();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const normalized = list.map(normalizeRow);

      // ✅ Recompute status ALWAYS from stock + expiry (not backend)
      const final = normalized.map((it) => ({
        ...it,
        status: computeStatus(it.stock, it.reorderThreshold, it.expiryDate),
      }));

      setItems(final);
    } catch (err: any) {
      console.error("AdminInventory fetch error:", err);
      setError(err?.message || "Failed to load inventory.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const res = await fetch(`${ADMIN_API}/vendors`, { headers: getAuthHeaders() });
      const body = await readJsonOrText(res);
      if (!res.ok) throw new Error((body && body.message) || `HTTP ${res.status}`);
      const list = Array.isArray(body?.items) ? body.items : [];
      setVendors(list);
    } catch (err: any) {
      console.error("AdminInventory vendors error:", err);
      setVendors([]);
    } finally {
      setVendorsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setItemCode("");
    setName("");
    setCategory("Consumables");
    setStock(0);
    setReorderThreshold(10);
    setExpiryDate("");
    setVendorId("");
    setFormError(null);
  };

  const openModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  async function postCreateItem(payload: any) {
    const res = await fetch(`${ADMIN_API}/inventory`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const body = await readJsonOrText(res);

    if (!res.ok) {
      if (res.status === 409) throw new Error("Item code already exists. Click Generate to create a new code.");
      const msg =
        (body && typeof body === "object" && (body.error || body.message)) ||
        (typeof body === "string" && body.trim()) ||
        `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return body;
  }

  async function patchInventoryItem(itemCode: string, payload: any) {
    const res = await fetch(`${ADMIN_API}/inventory/${encodeURIComponent(itemCode)}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const body = await readJsonOrText(res);
    if (!res.ok) {
      const msg =
        (body && typeof body === "object" && (body.error || body.message)) ||
        (typeof body === "string" && body.trim()) ||
        `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return body;
  }

  const submitNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const code = itemCode.trim().toUpperCase();
    const nm = name.trim();
    const cat = (category || "").trim() || "Uncategorized";

    if (!code) return setFormError("Item Code is required. Tip: type Name first then click Generate.");
    if (!nm) return setFormError("Name is required.");
    if (!Number.isFinite(stock) || stock < 0) return setFormError("Stock must be 0 or greater.");
    if (!Number.isFinite(reorderThreshold) || reorderThreshold < 0)
      return setFormError("Reorder threshold must be 0 or greater.");

    const s = Math.floor(stock);
    const rt = Math.floor(reorderThreshold);
    const exp = expiryDate ? expiryDate : null;
    const vIdNum = Number(vendorId);
    const vId = Number.isFinite(vIdNum) && vIdNum > 0 ? vIdNum : null;

    // Your backend earlier complained "itemCode and name are required"
    const attempts: any[] = [
      { itemCode: code, name: nm, category: cat, stock: s, reorderThreshold: rt, expiryDate: exp, vendorId: vId },
      { item_code: code, name: nm, category: cat, stock: s, reorder_threshold: rt, expiry_date: exp, vendor_id: vId },
      { item_code: code, name: nm, category: cat, quantity_on_hand: s, reorder_level: rt, expiry_date: exp, vendor_id: vId },
    ];

    try {
      setSubmitting(true);

      let lastErr: any = null;
      for (const payload of attempts) {
        try {
          await postCreateItem(payload);
          lastErr = null;
          break;
        } catch (err: any) {
          lastErr = err;
          const m = String(err?.message || "").toLowerCase();
          if (m.includes("already exists") || m.includes("conflict")) break;
        }
      }
      if (lastErr) throw lastErr;

      await fetchInventory();
      setModalOpen(false);
      showToast("Inventory item created.");
    } catch (err: any) {
      console.error("Create inventory item error:", err);
      setFormError(err?.message || "Failed to create item.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setVendorFormError(null);

    const nm = vendorName.trim();
    if (!nm) return setVendorFormError("Vendor name is required.");

    try {
      setVendorSubmitting(true);
      const res = await fetch(`${ADMIN_API}/vendors`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: nm,
          phone: vendorPhone.trim() || null,
          email: vendorEmail.trim() || null,
        }),
      });
      const body = await readJsonOrText(res);
      if (!res.ok) {
        const msg =
          (body && typeof body === "object" && (body.error || body.message)) ||
          (typeof body === "string" && body.trim()) ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }
      await fetchVendors();
      setVendorModalOpen(false);
      setVendorName("");
      setVendorPhone("");
      setVendorEmail("");
      showToast("Vendor created.");
    } catch (err: any) {
      console.error("Create vendor error:", err);
      setVendorFormError(err?.message || "Failed to create vendor.");
    } finally {
      setVendorSubmitting(false);
    }
  };

  const openAssignVendor = (item: InventoryItem) => {
    setAssignItem(item);
    setAssignVendorId(item.vendorId ? String(item.vendorId) : "");
    setAssignModalOpen(true);
  };

  const saveAssignVendor = async () => {
    if (!assignItem) return;
    try {
      const vIdNum = Number(assignVendorId);
      await patchInventoryItem(assignItem.itemCode || assignItem.id, {
        vendorId: Number.isFinite(vIdNum) && vIdNum > 0 ? vIdNum : null,
      });
      await fetchInventory();
      setAssignModalOpen(false);
      setAssignItem(null);
      showToast("Vendor updated.");
    } catch (err: any) {
      showToast(err?.message || "Failed to update vendor.");
    }
  };

  function applyTemplate(t: QuickTemplate) {
    const nextName = t.name;
    setName(nextName);
    setCategory(t.category);
    setReorderThreshold(t.reorderThreshold);
    setStock(typeof t.stock === "number" ? t.stock : 0);

    const current = (itemCode || "").trim().toUpperCase();
    if (!current || existingCodesUpper.has(current)) {
      const gen = generateItemCode(nextName, existingCodesUpper);
      setItemCode(gen.toUpperCase());
    }

    setModalOpen(true);
    setFormError(null);
  }

  function generateCodeFromName() {
    const base = (name || category || "Item").trim();
    const gen = generateItemCode(base, existingCodesUpper);
    setItemCode(gen.toUpperCase());
  }

  return (
    <>
      <section className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <PackageIcon size={14} />
              <span>Inventory</span>
            </div>
            <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">Inventory overview</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Track stock levels, identify low/expiring items, and keep your clinic prepared.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => fetchInventory()}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1.5 text-slate-700 dark:text-slate-200"
              disabled={loading}
            >
              <RefreshCwIcon size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => setVendorModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1.5 text-slate-700 dark:text-slate-200"
            >
              Vendors
            </button>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1.5 text-slate-700 dark:text-slate-200"
            >
              <FilterIcon size={14} />
              Filters
            </button>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 px-3 py-1.5 font-semibold"
            >
              + New item
            </button>
          </div>
        </div>

        {/* Quick add */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <SparklesIcon size={14} />
                Quick add
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click a common item to prefill the form (auto-generates Item Code).
              </p>
            </div>

            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <Wand2Icon size={14} />
              Open blank form
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => applyTemplate(t)}
                className="inline-flex items-center rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-900/70"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 px-4 py-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Total items</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{counts.total}</p>
          </div>
          <div className="rounded-2xl border border-rose-200/60 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 px-4 py-3">
            <p className="text-[11px] text-rose-700/80 dark:text-rose-200/80">Low</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{counts.low}</p>
          </div>
          <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3">
            <p className="text-[11px] text-amber-700/80 dark:text-amber-200/80">Reorder soon</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{counts.reorderSoon}</p>
          </div>
          <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3">
            <p className="text-[11px] text-amber-700/80 dark:text-amber-200/80">Expiring soon</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{counts.expiring}</p>
          </div>
          <div className="rounded-2xl border border-rose-200/60 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 px-4 py-3">
            <p className="text-[11px] text-rose-700/80 dark:text-rose-200/80">Expired</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{counts.expired}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, item code, ID, category..."
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-9 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
            />
          </div>

          {filtersOpen && (
            <div className="sm:w-72 flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "All categories" : c}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
              >
                <option value="ALL">All status</option>
                <option value="Healthy">Healthy</option>
                <option value="Reorder soon">Reorder soon</option>
                <option value="Low">Low</option>
                <option value="Expiring soon">Expiring soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          )}
        </div>

        {toast && (
          <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-200">
            {toast}
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>
        )}

        {/* Items */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 shadow-sm divide-y divide-slate-100/80 dark:divide-slate-900/80">
          {loading ? (
            <div className="px-4 py-6 text-xs text-slate-400 text-center inline-flex items-center justify-center gap-2">
              <Loader2Icon size={14} className="animate-spin" />
              Loading inventory...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-4 py-6 text-xs text-slate-400 text-center">No inventory items found.</div>
          ) : (
            filteredItems.map((item) => {
              const status = item.status;
              const badgeClass = badgeFor(status);
              const vendor = item.vendorId ? vendorMap.get(Number(item.vendorId)) : null;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-900/80"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.category || "Uncategorized"}
                      {item.itemCode ? ` • Code: ${item.itemCode}` : ""}
                      {item.id ? ` • ID: ${item.id}` : ""}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      {item.reorderThreshold != null && <span>Reorder threshold: {item.reorderThreshold}</span>}
                      {item.expiryDate && <span>Expiry: {item.expiryDate}</span>}
                      <span>Vendor: {vendor ? vendor.name : "Unassigned"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="text-slate-600 dark:text-slate-300">
                      Stock: <span className="font-semibold text-slate-900 dark:text-slate-50">{item.stock}</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1 ${badgeClass}`}>
                      {(status === "Low" || status === "Reorder soon" || status === "Expired" || status === "Expiring soon") && (
                        <AlertTriangleIcon size={12} />
                      )}
                      {status}
                    </span>

                    <button
                      onClick={() => openAssignVendor(item)}
                      className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Set vendor
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-900">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Add inventory item</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create a new stock item for your clinic.</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                aria-label="Close"
              >
                <XIcon size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            <form onSubmit={submitNewItem} className="px-5 py-4 space-y-3">
              {formError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-300">Item Code *</label>
                  <div className="mt-1 flex flex-col sm:flex-row gap-2">
                    <input
                      value={itemCode}
                      onChange={(e) => setItemCode(e.target.value.toUpperCase())}
                      placeholder="(click Generate)"
                      className="flex-1 min-w-0 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                    />
                    <button
                      type="button"
                      onClick={generateCodeFromName}
                      className="shrink-0 min-w-[110px] inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
                      title="Auto-generate a unique code"
                    >
                      <Wand2Icon size={14} />
                      Generate
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">Tip: type Name first, then click Generate.</p>
                </div>

                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-300">Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Consumables"
                    className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Vendor (optional)</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                >
                  <option value="">Unassigned</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                {vendorsLoading && <p className="mt-1 text-[11px] text-slate-400">Loading vendors…</p>}
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sterile gauze pads"
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-300">Stock *</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    min={0}
                    className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-300">Reorder threshold *</label>
                  <input
                    type="number"
                    value={reorderThreshold}
                    onChange={(e) => setReorderThreshold(Number(e.target.value))}
                    min={0}
                    className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-300">Expiry date (optional)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 px-3 py-2 text-xs font-semibold inline-flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader2Icon size={14} className="animate-spin" />}
                  Create item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setVendorModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-900">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Add vendor</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create a new vendor to link items.</p>
              </div>
              <button
                onClick={() => setVendorModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                aria-label="Close"
              >
                <XIcon size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            <form onSubmit={submitVendor} className="px-5 py-4 space-y-3">
              {vendorFormError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {vendorFormError}
                </div>
              )}

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Vendor name *</label>
                <input
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Phone</label>
                <input
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Email</label>
                <input
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVendorModalOpen(false)}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
                  disabled={vendorSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 px-3 py-2 text-xs font-semibold inline-flex items-center gap-2"
                  disabled={vendorSubmitting}
                >
                  {vendorSubmitting && <Loader2Icon size={14} className="animate-spin" />}
                  Save vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignModalOpen && assignItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAssignModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-900">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Assign vendor</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{assignItem.name}</p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                aria-label="Close"
              >
                <XIcon size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300">Vendor</label>
                <select
                  value={assignVendorId}
                  onChange={(e) => setAssignVendorId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none"
                >
                  <option value="">Unassigned</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAssignVendor}
                  className="rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 px-3 py-2 text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminInventory;
