export default function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Garis aksen hijau di atas */}
      <div className="h-1 bg-gradient-to-r from-[#167A61] to-[#0E5C46]" />
      <div className="p-6 flex flex-col gap-2">
        <p className="text-[15px] font-normal text-[#64748B]">{title}</p>
        <h4 className="text-4xl font-black text-[#1E293B] tracking-tight">
          {value}
        </h4>
      </div>
    </div>
  );
}
