import Link from "next/link";
import { ArrowRight, CalendarCheck, FileText, Landmark } from "lucide-react";
import { FOCUS_RING, INK, IconMark, MUTED, Panel } from "@/components/site/project/overview/overview-ui";

const TOPICS = [
  { Icon: CalendarCheck, label: "Site visits" },
  { Icon: Landmark, label: "Home loans" },
  { Icon: FileText, label: "Documents and paperwork" },
];

/**
 * The last section on every project page: a way to a person when the page
 * didn't answer the question. Leads to the contact page.
 */
export function ProjectHelpSection({ projectName }: { projectName: string }) {
  return (
    <Panel title="Need some help?" id="help" tint>
      <div className="mt-3! flex! flex-col! gap-6! md:flex-row! md:items-end! md:justify-between!">
        <div className="min-w-0! max-w-[46ch]!">
          <p className={`m-0! text-[15px]! leading-relaxed! text-pretty! ${MUTED}`}>
            Talk to our team about {projectName}, from pricing and availability to the paperwork
            after you book.
          </p>
          <ul className="m-0! mt-5! p-0! list-none! flex! flex-wrap! gap-x-6! gap-y-3!">
            {TOPICS.map(({ Icon, label }) => (
              <li key={label} className="flex! items-center! gap-2.5!">
                <IconMark Icon={Icon} size="sm" />
                <span className={`text-sm! font-medium! ${INK}`}>{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/contact-us"
          className={`group/help inline-flex! shrink-0! items-center! justify-center! gap-2! rounded-xl! bg-[#0a0f1c]! px-5! py-3! text-[15px]! font-semibold! text-white! no-underline! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#1645bf]! active:scale-[0.98]! ${FOCUS_RING}`}
        >
          Contact us
          <ArrowRight aria-hidden="true" className="w-4! h-4! transition-transform! duration-150! group-hover/help:translate-x-0.5!" />
        </Link>
      </div>
    </Panel>
  );
}
