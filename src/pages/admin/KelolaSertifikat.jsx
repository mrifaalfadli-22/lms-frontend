import { useState, useEffect } from "react";
import { Search, Download, Settings2, Eye, Trash2, Loader2 } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import AturTemplateModal from "../../components/admin/AturTemplateModal";
import LihatSertifikatModal from "../../components/admin/LihatSertifikatModal";
import api from "../../config/api";

export default function KelolaSertifikat() {
  const [sertifikatList, setSertifikatList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and search
  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState(null);

  useEffect(() => {
    fetchSertifikat();
    fetchActiveTemplate();
  }, []);

  const fetchSertifikat = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sertifikat');
      if (res.data.status === 'success') {
        const formatted = res.data.data.data.map(item => {
          const mk = item.peserta?.jadwal?.mata_kuliah?.nama_mk || 'Mata Kuliah';
          const kls = item.peserta?.jadwal?.kelas?.nama_kelas || 'Kelas';
          
          return {
            idSertifikat: item.id_sertifikat,
            noSertifikat: item.nomor_sertifikat,
            id_template: item.id_template,
            mahasiswa: item.peserta?.mahasiswa?.nama_lengkap || 'Tanpa Nama',
            npm: item.peserta?.mahasiswa?.nomor_induk || '-',
            mataKuliah: `${mk} - ${kls}`,
            semester: `Semester ${item.peserta?.jadwal?.mata_kuliah?.semester || '-'}`,
            tahun: item.peserta?.jadwal?.mata_kuliah?.semester || '-', // Ini bisa disesuaikan
            dosen: item.peserta?.jadwal?.dosen?.nama_lengkap || '-',
            nidn: item.peserta?.jadwal?.dosen?.nomor_induk || '-',
            tanggalTerbit: new Date(item.tanggal_terbit).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'long', year: 'numeric'
            }),
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
      if (res.data.status === 'success' && res.data.data.length > 0) {
        const active = res.data.data[0];
        if (active.file_background && active.layout_data) {
          try {
            const imgRes = await api.get(`/template-sertifikat/${active.id_template}/download-background`, {
              responseType: 'blob'
            });
            const imgBlob = imgRes.data;
            const file = new File([imgBlob], "background.jpg", { type: imgBlob.type || "image/jpeg" });
            
            const parsedLayout = typeof active.layout_data === 'string' 
              ? JSON.parse(active.layout_data) 
              : active.layout_data;
              
            setSavedTemplate({ file, layoutData: parsedLayout, id_template: active.id_template });
          } catch (fetchErr) {
            console.error("Gagal mendownload background blob", fetchErr);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTemplate = async (file, layoutData) => {
    try {
      let savedIdTemplate = null;

      if (savedTemplate?.id_template) {
        // UPDATE template yang sudah ada — preserves FK references in sertifikat table
        const formData = new FormData();
        formData.append('nama_template', 'Template Baru');
        formData.append('is_aktif', 1);
        formData.append('layout_data', JSON.stringify(layoutData));
        if (file && file.name !== 'background.jpg') {
          // Only upload new background if the file was actually changed (not the fetched blob)
          formData.append('file_background', file);
        }

        // Update layout_data via PUT (JSON)
        await api.put(`/template-sertifikat/${savedTemplate.id_template}`, {
          layout_data: layoutData,
          nama_template: 'Template Baru',
          is_aktif: true,
        });

        // If background file was changed, upload it separately
        if (file && file.name !== 'background.jpg') {
          const bgForm = new FormData();
          bgForm.append('file_background', file);
          await api.post(`/template-sertifikat/${savedTemplate.id_template}/background`, bgForm, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }

        savedIdTemplate = savedTemplate.id_template;
      } else {
        // CREATE template baru
        const formData = new FormData();
        formData.append('nama_template', 'Template Baru');
        formData.append('file_background', file);
        formData.append('is_aktif', 1);
        formData.append('layout_data', JSON.stringify(layoutData));

        const createRes = await api.post('/template-sertifikat', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        savedIdTemplate = createRes.data.data?.id_template;
      }

      setSavedTemplate({ file, layoutData, id_template: savedIdTemplate });
      setIsTemplateModalOpen(false);
      // Refresh sertifikat list in case template reference changed
      fetchSertifikat();
    } catch (err) {
      console.error("Gagal simpan template", err);
      alert("Gagal menyimpan template");
    }
  };

  const tahunOptions = [...new Set(sertifikatList.map((s) => s.tahun))].filter(Boolean).sort((a, b) => b - a);

  const filtered = sertifikatList.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      [s.noSertifikat, s.mahasiswa, s.npm, s.mataKuliah, s.dosen, s.nidn].some(
        (v) => v?.toLowerCase().includes(q),
      );
    const matchTahun = !tahunFilter || String(s.tahun) === String(tahunFilter);
    const matchSemester = !semesterFilter || String(s.semester) === String(semesterFilter);
    return matchSearch && matchTahun && matchSemester;
  });

  const total = filtered.length;
  const lastPage = Math.ceil(total / perPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      try {
        await api.delete(`/sertifikat/${deleteTarget.idSertifikat}`);
        fetchSertifikat();
        setDeleteTarget(null);
      } catch (err) {
        console.error("Gagal menghapus sertifikat", err);
      }
    }
  };

  return (
    <>
      <LihatSertifikatModal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        data={viewTarget}
      />
      <AturTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        savedTemplate={savedTemplate}
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
              placeholder="Cari berdasarkan no. sertifikat, mahasiswa, atau mata kuliah..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>
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
                  "No. Sertifikat",
                  "Mahasiswa",
                  "NPM",
                  "Mata Kuliah",
                  "Semester",
                  "Dosen",
                  "NIDN",
                  "Tanggal Terbit",
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
                      {s.noSertifikat}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
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
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.tanggalTerbit}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewTarget(s)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Eye size={14} />
                          <span>Lihat</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="flex items-center gap-2 px-3 py-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all text-[13px] font-bold"
                        >
                          <Trash2 size={14} />
                          <span>Hapus</span>
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
