// Footer with the terms modal it opens.
import { useState } from "react";
import { Footer } from "../components/Footer";
import { LegalModals } from "../components/LegalModals";
export default function FooterIsland() {
  const [modal, setModal] = useState<"terms" | null>(null);
  return (
    <>
      <Footer onOpenTerms={() => setModal("terms")} />
      <LegalModals type={modal} onClose={() => setModal(null)} />
    </>
  );
}
