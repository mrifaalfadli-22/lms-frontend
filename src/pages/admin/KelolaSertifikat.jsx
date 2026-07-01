import { useState, useEffect } from "react";
import { Search, Download, Settings2, Eye, Trash2, Loader2 } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import AturTemplateModal from "../../components/admin/AturTemplateModal";
import DetailSertifikatMahasiswaModal from "../../components/admin/DetailSertifikatMahasiswaModal";
import { formatFakultas } from "../../utils/formatters";
import api from "../../config/api";

export default function KelolaSertifikat() {
  const [sertifikatList, setSertifikatList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and search
  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [fakultasFilter, setFakultasFilter] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeTemplates, setActiveTemplates] = useState([]);

  useEffect(() => {
    fetchSertifikat();
    fetchActiveTemplate();
  }, []);

  const fetchSertifikat = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sertifikat/grouped?per_page=500');
      if (res.data.status === 'success') {
        const formatted = res.data.data.data.map(item => {
          const mk = item.jadwal?.mata_kuliah?.nama_mk || 'Mata Kuliah';
          const kls = item.jadwal?.kelas?.nama_kelas || 'Kelas';
          
          return {
            idPeserta: item.id_peserta,
            mahasiswa: item.mahasiswa?.nama_lengkap || 'Tanpa Nama',
            npm: item.mahasiswa?.nomor_induk || '-',
            mataKuliah: `${mk} - ${kls}`,
            semester: `Semester ${item.jadwal?.mata_kuliah?.semester || '-'}`,
            tahun: item.jadwal?.mata_kuliah?.semester || '-', // Ini bisa disesuaikan
            dosen: item.jadwal?.dosen?.nama_lengkap || '-',
            nidn: item.jadwal?.dosen?.nomor_induk || '-',
            fakultas: item.jadwal?.fakultas || '-',
            prodi: item.jadwal?.prodi || '-',
            jumlahSertifikat: item.sertifikat?.length || 0,
            sertifikats: item.sertifikat || [],
            statusKelulusan: item.status_kelayakan === 'Disetujui' ? 'LULUS' : '-',
            nilaiAkhir: item.nilai_akhir || 0,
          };
        });
        setSertifikatList(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTemplate = async () => {
    try {
      const res = await api.get('/template-sertifikat/aktif');
      if (res.data.status === 'success') {
        setActiveTemplates(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTemplate = async (file, layoutData, tipeSertifikat, id_template) => {
    try {
      if (id_template) {
        // UPDATE — kirim layout via JSON body
        await api.put(`/template-sertifikat/${id_template}`, {
          layout_data: layoutData,
          nama_template: `Template ${tipeSertifikat}`,
          tipe_sertifikat: tipeSertifikat,
          is_aktif: true,
        });

        // Upload background baru HANYA jika user memilih file baru
        if (file instanceof File) {
          const bgForm = new FormData();
          bgForm.append("file_background", file);
          await api.post(`/template-sertifikat/${id_template}/background`, bgForm, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        // CREATE — kirim semua via FormData (wajib ada file)
        if (!file) throw new Error("File background wajib dipilih untuk template baru");
        const formData = new FormData();
        formData.append("nama_template", `Template ${tipeSertifikat}`);
        formData.append("tipe_sertifikat", tipeSertifikat);
        formData.append("file_background", file);
        formData.append("is_aktif", "1");
        formData.append("layout_data", JSON.stringify(layoutData));
        await api.post("/template-sertifikat", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await fetchActiveTemplate();
      await fetchSertifikat();
      setIsTemplateModalOpen(false);
    } catch (err) {
      console.error("Gagal simpan template", err);
      throw err; // biarkan modal yang handle error-nya
    }
  };

  const tahunOptions = [...new Set(sertifikatList.map((s) => s.tahun))].filter(Boolean).sort((a, b) => b - a);
  const fakultasOptions = [...new Set(sertifikatList.map((s) => s.fakultas))].filter(f => f && f !== '-').sort();
  const prodiOptions = [...new Set(sertifikatList.map((s) => s.prodi))].filter(p => p && p !== '-').sort();

  const filtered = sertifikatList.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      [s.mahasiswa, s.npm, s.mataKuliah, s.dosen, s.nidn].some(
        (v) => v?.toLowerCase().includes(q),
      );
    const matchTahun = !tahunFilter || String(s.tahun) === String(tahunFilter);
    const matchSemester = !semesterFilter || String(s.semester) === String(semesterFilter);
    const matchFakultas = !fakultasFilter || s.fakultas === fakultasFilter;
    const matchProdi = !prodiFilter || s.prodi === prodiFilter;
    
    return matchSearch && matchTahun && matchSemester && matchFakultas && matchProdi;
  });

  const total = filtered.length;
  const lastPage = Math.ceil(total / perPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleDeleteConfirm = async () => {
    // Implement delete by id_peserta or specific certificates if needed
    setDeleteTarget(null);
  };

  return (
    <>
      <DetailSertifikatMahasiswaModal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        data={viewTarget}
        activeTemplates={activeTemplates}
      />
      <AturTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        activeTemplates={activeTemplates}
        onSave={handleSaveTemplate}
      />
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Sertifikat"
        fields={[
          { label: "No. Sertifikat", key: "noSertifikat" },
          { label: "Mahasiswa", key: "mahasiswa" },
          { label: "Mata Kuliah", key: "mataKuliah" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={false}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Sertifikat
          </h3>
          <div className="flex gap-2.5">
            <button className="flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#167A61] hover:text-white transition-all">
              <Download size={14} />
              Eksport Data
            </button>
            <button 
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all">
              <Settings2 size={14} />
              Atur Template
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 px-7 pb-5 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              size={15}
              strokeWidth={2.5}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Cari mahasiswa, NPM, mata kuliah, atau dosen..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>
          <select
            value={fakultasFilter}
            onChange={(e) => { setFakultasFilter(e.target.value); setCurrentPage(1); }}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white cursor-pointer"
          >
            <option value="">Semua Fakultas</option>
            {fakultasOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            value={prodiFilter}
            onChange={(e) => { setProdiFilter(e.target.value); setCurrentPage(1); }}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white cursor-pointer"
          >
            <option value="">Semua Prodi</option>
            {prodiOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={tahunFilter}
            onChange={(e) => { setTahunFilter(e.target.value); setCurrentPage(1); }}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white cursor-pointer"
          >
            <option value="">Semua Tahun</option>
            {tahunOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={semesterFilter}
            onChange={(e) => { setSemesterFilter(e.target.value); setCurrentPage(1); }}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white cursor-pointer"
          >
            <option value="">Semua Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={`Semester ${s}`}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="px-7 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {[
                  "No",
                  "Mahasiswa",
                  "NPM",
                  "Mata Kuliah",
                  "Semester",
                  "Dosen",
                  "NIDN",
                  "Jumlah Sertifikat",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center">
                    <Loader2 size={24} className="animate-spin text-[#167A61] mx-auto" />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-10 text-center text-[#94A3B8] text-[13px]"
                  >
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, i) => (
                  <tr
                    key={i}
                    className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.mahasiswa}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {s.npm}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.mataKuliah}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.semester}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.dosen}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {s.nidn}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#167A61] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.jumlahSertifikat} Sertifikat
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewTarget(s)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Eye size={14} />
                          <span>Detail</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={total}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </>
  );
}
