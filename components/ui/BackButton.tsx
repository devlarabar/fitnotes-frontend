import { useRouter } from "next/navigation";

export default function BackButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={
        "inline-flex items-center px-4 py-2 border bg-deep-sky-blue text-white "
        + "text-sm font-semibold "
        + "hover:bg-baby-blue-ice hover:cursor-pointer"
      }
    >
      {children}
    </button>
  )
}