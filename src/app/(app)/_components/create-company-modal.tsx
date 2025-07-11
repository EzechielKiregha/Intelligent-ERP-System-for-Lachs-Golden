"use client";

import ResponsiveModal from "@/components/responsive-modal";
import CreateCompanyForm from "./CreateCompanyForm";
import { useOpenCreateCompanyModal } from "@/hooks/use-open-create-company-modal";

export default function CreateCompanyModal() {
  const { setIsOpen, isOpen, close } = useOpenCreateCompanyModal();

  return (
    <ResponsiveModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <CreateCompanyForm onCancel={close} />
    </ResponsiveModal>
  );
}