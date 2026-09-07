"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/components/ui/toast-store";
import { ModernLoader } from "@/components/admin/ui/ModernLoader";
import { GoogleSearchPreview } from "@/components/admin/seo/GoogleSearchPreview";

interface OverviewFields {
  title?: string;
  description?: string;
  h1?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  robots?: string;
}

interface Faq {
  question: string;
  answer: string;
}

const EMPTY_OVERVIEW: OverviewFields = {
  title: "",
  description: "",
  h1: "",
  og_title: "",
  og_description: "",
  og_image: "",
  robots: "index,follow",
};

const ROBOTS_OPTIONS = [
  { value: "index,follow", label: "Index & Follow" },
  { value: "noindex,follow", label: "No Index, Follow" },
  { value: "noindex,nofollow", label: "No Index, No Follow" },
];

const inputClass =
  "!w-full !bg-white dark:!bg-[#0f1117] !border !border-gray-200 dark:!border-[#262730] !rounded-xl !px-4 !py-2.5 !text-[14px] !text-gray-900 dark:!text-white focus:!outline-none focus:!ring-2 focus:!ring-[#27427f]/40 focus:!border-[#27427f] !transition-all !placeholder-gray-400";
const labelClass =
  "!block !text-[12px] !font-bold !text-gray-500 dark:!text-gray-400 !uppercase !tracking-wider !mb-1.5";

export default function ProjectSeoEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [projectName, setProjectName] = useState("");
  const [overview, setOverview] = useState<OverviewFields>(EMPTY_OVERVIEW);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [verificationStatus, setVerificationStatus] = useState("Pending");
  const [approvalStatus, setApprovalStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const [projectRes, seoRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/projects/${id}`, { headers }),
        fetch(`${API_BASE_URL}/admin/projects/${id}/seo`, { headers }),
      ]);
      if (!projectRes.ok) throw new Error("Project not found");
      const project = await projectRes.json();
      const p = project.data ?? project;
      setProjectName(p.name ?? `#${id}`);
      if (seoRes.ok) {
        const seo = await seoRes.json();
        const s = seo.data ?? seo;
        setOverview({ ...EMPTY_OVERVIEW, ...(s.seoData?.overview ?? {}) });
        setFaqs(s.seoData?.faqs ?? []);
        setVerificationStatus(s.verificationStatus ?? "Pending");
        setApprovalStatus(s.approvalStatus ?? "Pending");
      }
    } catch {
      toast.error("Failed to load project SEO");
      router.push("/admin/projects/seo");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const set = (key: keyof OverviewFields, value: string) =>
    setOverview((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = window.localStorage.getItem("majestan_access_token");
      const res = await fetch(`${API_BASE_URL}/admin/projects/${id}/seo`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          seoData: {
            overview,
            faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
          },
          verificationStatus,
          approvalStatus,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Project SEO saved");
      fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: "projects" }),
      }).catch(() => {});
    } catch {
      toast.error("Failed to save project SEO");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !py-24">
        <ModernLoader />
      </div>
    );
  }

  return (
    <div className="!w-full !space-y-6 !max-w-4xl">
      <div className="!flex !items-center !justify-between">
        <div className="!flex !items-center !gap-3">
          <button
            onClick={() => router.push("/admin/projects/seo")}
            className="!p-2.5 !rounded-xl !border !border-gray-200 !text-gray-500 hover:!bg-gray-50 !transition-colors"
            aria-label="Back to projects"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="!text-2xl !font-medium !text-gray-900 dark:!text-white !tracking-tight">
              SEO — {projectName}
            </h2>
            <p className="!text-[13px] !text-gray-500">
              Status: {verificationStatus} / {approvalStatus}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="!inline-flex !items-center !gap-2 !px-5 !py-2.5 !rounded-xl !bg-[#27427f] !text-white !text-[14px] !font-medium hover:!bg-[#1d3261] !transition-colors disabled:!opacity-60"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <GoogleSearchPreview
        title={overview.title || projectName}
        description={overview.description || ""}
        slug={`projects/.../${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
      />

      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6 !space-y-5">
        <h3 className="!text-base !font-bold !text-gray-900 dark:!text-white">Overview</h3>
        {(
          [
            ["title", "Meta Title"],
            ["description", "Meta Description"],
            ["h1", "H1"],
            ["og_title", "OG Title"],
            ["og_description", "OG Description"],
            ["og_image", "OG Image URL"],
          ] as [keyof OverviewFields, string][]
        ).map(([key, label]) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            {key === "description" || key === "og_description" ? (
              <textarea value={overview[key] || ""} onChange={(e) => set(key, e.target.value)} rows={3} className={inputClass} />
            ) : (
              <input value={overview[key] || ""} onChange={(e) => set(key, e.target.value)} className={inputClass} />
            )}
          </div>
        ))}
        <div>
          <label className={labelClass}>Robots</label>
          <select value={overview.robots || "index,follow"} onChange={(e) => set("robots", e.target.value)} className={inputClass}>
            {ROBOTS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6 !space-y-4">
        <div className="!flex !items-center !justify-between">
          <h3 className="!text-base !font-bold !text-gray-900 dark:!text-white">FAQs</h3>
          <button
            onClick={() => setFaqs((prev) => [...prev, { question: "", answer: "" }])}
            className="!px-4 !py-2 !text-[13px] !font-medium !text-[#27427f] !bg-[#27427f]/5 hover:!bg-[#27427f]/10 !rounded-lg !transition-colors"
          >
            + Add FAQ
          </button>
        </div>
        {faqs.length === 0 && <p className="!text-[14px] !text-gray-400">No FAQs yet.</p>}
        {faqs.map((faq, idx) => (
          <div key={idx} className="!border !border-gray-100 dark:!border-[#262730] !rounded-xl !p-4 !space-y-3">
            <input
              value={faq.question}
              onChange={(e) => setFaqs((prev) => prev.map((f, i) => (i === idx ? { ...f, question: e.target.value } : f)))}
              placeholder="Question"
              className={inputClass}
            />
            <textarea
              value={faq.answer}
              onChange={(e) => setFaqs((prev) => prev.map((f, i) => (i === idx ? { ...f, answer: e.target.value } : f)))}
              placeholder="Answer"
              rows={2}
              className={inputClass}
            />
            <button
              onClick={() => setFaqs((prev) => prev.filter((_, i) => i !== idx))}
              className="!text-[13px] !font-medium !text-red-500 hover:!text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="!bg-white dark:!bg-[#1a1f2e] !rounded-2xl !border !border-gray-200 dark:!border-[#262730] !p-6">
        <h3 className="!text-base !font-bold !text-gray-900 dark:!text-white !mb-4">Publish</h3>
        <div className="!grid !grid-cols-2 !gap-4">
          <div>
            <label className={labelClass}>Verification</label>
            <select value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)} className={inputClass}>
              {["Pending", "In Review", "Approved"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Approval</label>
            <select value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)} className={inputClass}>
              {["Pending", "Published", "Unpublished"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
