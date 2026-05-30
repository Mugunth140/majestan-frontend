import { ContactHero } from "@/components/site/contact/ContactHero";
import { ContactInfo } from "@/components/site/contact/ContactInfo";
import { ContactForm } from "@/components/site/contact/ContactForm";

export default function ContactUsPage() {
  return (
    <main className="min-h-screen! bg-[#f8f9fa]!">
      <ContactHero />
      
      <section className="py-20!">
        <div className="container! mx-auto! px-4!">
          <div className="flex! flex-col! lg:flex-row! gap-12! items-start!">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
