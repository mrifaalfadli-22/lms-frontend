import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { EPORTAL_URL } from "../../config/eportal";

export default function RedirectToEportal() {
  useEffect(() => {
    window.location.href = EPORTAL_URL;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#167A61] to-[#0E5C46] flex flex-col items-center justify-center text-white">
      <Loader2 size={48} className="animate-spin mb-4" />
      <h2 className="text-xl font-bold">Mengarahkan ke E-Portal...</h2>
    </div>
  );
}
