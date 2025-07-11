import { parseAsBoolean, useQueryState } from "nuqs";

export const useOpenCreateCompanyModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-company-form",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    open,
    close,
    isOpen,
    setIsOpen,
  };
};