export default function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-[#1A7A5F] text-white hover:bg-[#145D49] shadow-md",
    outline:
      "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm",
  };

  return (
    <button
      {...props}
      className={`w-full py-3.5 rounded-lg font-bold transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-3 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
