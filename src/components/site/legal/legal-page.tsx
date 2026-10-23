import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ChevronDown, FileText, Mail, ShieldCheck } from "lucide-react";
import { SeoH1 } from "@/components/seo/core-heading";
import styles from "./legal-page.module.css";

export type LegalSection = {
  id: string;
  title: string;
  blocks: ({ type: "paragraph"; text: string } | { type: "list"; items: string[] })[];
};

function PolicyText({ text }: { text: string }) {
  const email = "info@majestanrealty.com";
  const parts = text.split(email);
  return <>{parts.map((part, index) => <span key={index}>{index > 0 && <a href={`mailto:${email}`}>{email}</a>}{part}</span>)}</>;
}

export function LegalPage({ kind, introduction, sections }: {
  kind: "privacy" | "terms";
  introduction: string;
  sections: LegalSection[];
}) {
  const privacy = kind === "privacy";
  const title = privacy ? "Privacy policy" : "Terms and conditions";
  const Icon = privacy ? ShieldCheck : FileText;
  const sectionLinks = <ol>{sections.map((section, index) => <li key={section.id}>
    <a href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>
  </li>)}</ol>;
  return (
    <main className={`font-manrope-page ${styles.page}`} id="legal-top">
      <div className={styles.container}>
        <Link href="/" className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> Back to home</Link>
        <header className={styles.hero}>
          <span className={styles.eyebrow}><Icon size={18} aria-hidden="true" /> Majestan Realty · Legal</span>
          <SeoH1>{title}</SeoH1>
          <p>{privacy ? "Your information, handled with care." : "A clear understanding, from the start."}</p>
          <nav aria-label="Legal documents" className={styles.documents}>
            <Link href="/privacy-policy" aria-current={privacy ? "page" : undefined}>Privacy policy</Link>
            <Link href="/terms-and-conditions" aria-current={!privacy ? "page" : undefined}>Terms and conditions</Link>
          </nav>
        </header>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <nav aria-label="On this page" className={`${styles.contents} ${styles.desktopContents}`}>
              <h2>On this page</h2>{sectionLinks}
            </nav>
            <details className={`${styles.contents} ${styles.mobileContents}`}>
              <summary>On this page <ChevronDown size={18} aria-hidden="true" /></summary>
              <nav aria-label="On this page">{sectionLinks}</nav>
            </details>
            <div className={styles.help}>
              <Mail size={20} aria-hidden="true" />
              <h2>Have a question?</h2>
              <p>Our team is here to help with questions about this {privacy ? "policy" : "page"}.</p>
              <a href="mailto:info@majestanrealty.com">Email our team <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </aside>
          <article className={styles.article} aria-label={title}>
            <div className={styles.introduction}><span>Before you begin</span><p>{introduction}</p></div>
            {sections.map((section, index) => <section id={section.id} key={section.id} className={styles.section} aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</h2>
              {section.blocks.map((block, blockIndex) => block.type === "paragraph"
                ? <p key={blockIndex}><PolicyText text={block.text} /></p>
                : <ul key={blockIndex}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>)}
            </section>)}
            <footer className={styles.articleFooter}><span>Majestan Realty Services Pvt Ltd</span><a href="#legal-top">Back to top ↑</a></footer>
          </article>
        </div>
        <div className={styles.bottomNote}><ShieldCheck size={20} aria-hidden="true" /><p>Questions deserve a conversation. <Link href="/contact-us">Get in touch with our team <ArrowUpRight size={16} aria-hidden="true" /></Link></p></div>
      </div>
    </main>
  );
}
