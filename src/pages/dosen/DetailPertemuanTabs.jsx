import { useState, useRef, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight, Download, Edit2, Trash2, Plus, MoreVertical, Reply, Eye, Save, Send, X, Edit3, Loader2 } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import ConfirmSaveModal from "../../components/admin/ConfirmSaveModal";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import UploadMateriModal from "../../components/dosen/UploadMateriModal";
import TugasModal from "../../components/dosen/TugasModal";
import UbahSesiModal from "../../components/dosen/UbahSesiModal";
import presensiService from "../../services/presensiService";
import materiService from "../../services/materiService";
import tugasService from "../../services/tugasService";
import forumDiskusiService from "../../services/forumDiskusiService";
import sesiPertemuanService from "../../services/sesiPertemuanService";
import { useProfile } from "../../hooks/useProfile";

export default function DetailPertemuanTabs() {
  const { id, kelasId, pertemuanId } = useParams();
  const location = useLocation();
  const { user: currentUser } = useProfile();
  const [jadwal, setJadwal] = useState(location.state?.groupData || { nama_mk: "Memuat..." });
  const [classData, setClassData] = useState(location.state?.classData || { nama_kelas: "Memuat..." });
  const [pertemuanName, setPertemuanName] = useState(location.state?.pertemuanName || "");
  const [localPertemuanData, setLocalPertemuanData] = useState(location.state?.pertemuanData || { metode: "Synchronous" });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);
  const [pesertaCount, setPesertaCount] = useState(0);

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "presensi");

  const [presensi, setPresensi] = useState([]);
  const [materiList, setMateriList] = useState([]);
  const [tugasList, setTugasList] = useState([]);

  const [loadingPresensi, setLoadingPresensi] = useState(true);
  const [loadingMateri, setLoadingMateri] = useState(true);
  const [loadingTugas, setLoadingTugas] = useState(true);
  const [loadingForum, setLoadingForum] = useState(true);

  const [presensiPage, setPresensiPage] = useState(1);
  const [presensiPerPage, setPresensiPerPage] = useState(10);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isUploadMateriOpen, setIsUploadMateriOpen] = useState(false);
  const [editMateriTarget, setEditMateriTarget] = useState(null);
  const [deleteMateriTarget, setDeleteMateriTarget] = useState(null);
  const [isTugasModalOpen, setIsTugasModalOpen] = useState(false);
  const [editTugasTarget, setEditTugasTarget] = useState(null);
  const [deleteTugasTarget, setDeleteTugasTarget] = useState(null);
  const [chatMessage, setChatMessage] = useState("");

  const [chats, setChats] = useState([]);

  const [replyingTo, setReplyingTo] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [deleteChatTarget, setDeleteChatTarget] = useState(null);

  const chatInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchPresensi = async () => {
    try {
      setLoadingPresensi(true);
      const res = await presensiService.getBySesi(pertemuanId);
      if (res && res.data) {
        const mapped = res.data.map((p) => ({
          ...p,
          id: p.id_peserta,
          status: p.status_kehadiran
            ? p.status_kehadiran.charAt(0).toUpperCase() + p.status_kehadiran.slice(1)
            : null
        }));
        setPresensi(mapped);
      }
    } catch (err) {
      console.error("Gagal memuat presensi:", err);
    } finally {
      setLoadingPresensi(false);
    }
  };

  const fetchTugas = async () => {
    try {
      setLoadingTugas(true);
      const res = await tugasService.getBySesi(pertemuanId);
      setTugasList(res);
    } catch (err) {
      console.error("Gagal memuat tugas:", err);
    } finally {
      setLoadingTugas(false);
    }
  };

  const fetchForum = async () => {
    try {
      setLoadingForum(true);
      const res = await forumDiskusiService.getBySesi(pertemuanId, { per_page: 100 });
      const mapped = res.data.map(item => ({
        id: item.id_pesan,
        name: item.nama_pengirim,
        senderId: item.id_pengirim,
        message: item.isi_pesan,
        time: item.created_at ? new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "",
        isMe: currentUser?.id_user === item.id_pengirim,
        replyTo: item.id_parent_pesan ? {
          id: item.id_parent_pesan,
          name: item.replies?.length > 0 ? item.replies[0]?.nama_pengirim : (res.data.find(p => p.id_pesan === item.id_parent_pesan)?.nama_pengirim || ""),
          message: res.data.find(p => p.id_pesan === item.id_parent_pesan)?.isi_pesan || "",
        } : null,
      }));
      setChats(mapped);
      
      // Tandai pesan sudah dibaca di background
      if (activeTab === "forum") {
        forumDiskusiService.markAsRead(pertemuanId).catch(err => console.error("Gagal markAsRead:", err));
      }
    } catch (err) {
      console.error("Gagal memuat forum:", err);
    } finally {
      setLoadingForum(false);
    }
  };

  useEffect(() => {
    fetchPresensi();
    fetchMateri();
    fetchTugas();

    // Fetch session details if not completely passed from location state
    const fetchSession = async () => {
      try {
        const sesi = await sesiPertemuanService.getById(pertemuanId);
        if (sesi) {
          setPertemuanName(sesi.judul_sesi || `Pertemuan ke-${sesi.pertemuan_ke}`);
          setLocalPertemuanData((prev) => ({ ...prev, ...sesi }));
          if (sesi.jadwal_perkuliahan) {
             if (sesi.jadwal_perkuliahan.mata_kuliah) {
               setJadwal({ nama_mk: sesi.jadwal_perkuliahan.mata_kuliah.nama_mk });
             }
             if (sesi.jadwal_perkuliahan.kelas) {
               setClassData({ nama_kelas: sesi.jadwal_perkuliahan.kelas.nama_kelas });
             }
          }
        }
      } catch (err) {
        console.error("Gagal memuat detail sesi:", err);
        if (!pertemuanName) setPertemuanName(`Pertemuan ke-${pertemuanId}`);
      }
    };
    fetchSession();
  }, [pertemuanId]);

  useEffect(() => {
    if (currentUser) {
      fetchForum();
    }
  }, [pertemuanId, currentUser]);

  useEffect(() => {
    if (presensi.length > 0) {
      setPesertaCount(presensi.length);
    }
  }, [presensi]);

  const fetchMateri = async () => {
    try {
      setLoadingMateri(true);
      const res = await materiService.getBySesi(pertemuanId);
      setMateriList(res);
    } catch (err) {
      console.error("Gagal memuat materi:", err);
    } finally {
      setLoadingMateri(false);
    }
  };

  useEffect(() => {
    if (activeTab === "forum") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      
      // Tandai pesan sudah dibaca jika membuka tab forum
      forumDiskusiService.markAsRead(pertemuanId).catch(err => console.error("Gagal markAsRead:", err));
    }
  }, [chats, activeTab, pertemuanId]);

  useEffect(() => {
    if (chatInputRef.current) {
      const el = chatInputRef.current;
      el.style.height = "0px";
      const scrollHeight = el.scrollHeight;
      el.style.height = `${scrollHeight}px`;

      if (scrollHeight > 120) {
        el.scrollTop = scrollHeight;
      }
    }
  }, [chatMessage]);

  const handleSendChat = async () => {
    if (!chatMessage.trim() || sendingChat) return;
    setSendingChat(true);

    try {
      if (editingChatId) {
        await forumDiskusiService.update(editingChatId, chatMessage);
        setEditingChatId(null);
      } else {
        const payload = {
          id_sesi: pertemuanId,
          isi_pesan: chatMessage,
        };
        if (replyingTo) {
          payload.id_parent_pesan = replyingTo.id;
        }
        await forumDiskusiService.create(payload);
      }
      setChatMessage("");
      setReplyingTo(null);
      await fetchForum();
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
      alert(err.response?.data?.message || "Gagal mengirim pesan");
    } finally {
      setSendingChat(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setPresensi((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const startIndex = (presensiPage - 1) * presensiPerPage;
  const currentPresensi = presensi.slice(startIndex, startIndex + presensiPerPage);
  const presensiLastPage = Math.ceil(presensi.length / presensiPerPage) || 1;

  const renderPresensi = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[16px] font-bold text-[#1E293B]">Input Presensi Mahasiswa</h4>
        {presensi.length > 0 && (
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all"
          >
            <Save size={14} />
            Simpan Presensi
          </button>
        )}
      </div>

      {loadingPresensi ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#F8FAFC]/50 rounded-2xl border border-dashed border-[#E2E8F0]">
          <Loader2 size={32} className="animate-spin text-[#167A61] mb-4" />
          <p className="text-[15px] font-bold text-[#64748B]">Memuat Data...</p>
        </div>
      ) : presensi.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#F8FAFC]/50 rounded-2xl border border-dashed border-[#E2E8F0]">
          <p className="text-[15px] font-bold text-[#64748B]">Tidak ada Data</p>
          <p className="text-[13px] text-[#94A3B8] mt-1">Data presensi mahasiswa belum tersedia.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">No</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">NPM</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Nama Mahasiswa</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {currentPresensi.map((p, i) => (
                  <tr key={p.id} className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                    <td className="py-4 px-4 font- text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">{startIndex + i + 1}</td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">{p.nim}</td>
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">{p.nama}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(p.id, "Hadir")}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-black border transition-all ${p.status === "Hadir"
                            ? "bg-[#DCFCE7] text-[#008B5E] border-[#008B5E]/40"
                            : "bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#64748B] hover:border-[#CBD5E1]"
                            }`}
                        >
                          Hadir
                        </button>
                        <button
                          onClick={() => handleStatusChange(p.id, "Izin")}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-black border transition-all ${p.status === "Izin"
                            ? "bg-[#FFF9E6] text-[#D97706] border-[#D97706]/40"
                            : "bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#64748B] hover:border-[#CBD5E1]"
                            }`}
                        >
                          Izin
                        </button>
                        <button
                          onClick={() => handleStatusChange(p.id, "Alpha")}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-black border transition-all ${p.status === "Alpha"
                            ? "bg-[#FEE2E2] text-[#EF4444] border-[#EF4444]/40"
                            : "bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#64748B] hover:border-[#CBD5E1]"
                            }`}
                        >
                          Alpha
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  const renderMateri = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[16px] font-bold text-[#1E293B]">Materi Pertemuan</h4>
        <button
          onClick={() => setIsUploadMateriOpen(true)}
          className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all"
        >
          <Plus size={14} />
          Upload Materi
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {loadingMateri ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#F8FAFC]/50 rounded-2xl border border-dashed border-[#E2E8F0]">
            <Loader2 size={32} className="animate-spin text-[#167A61] mb-4" />
            <p className="text-[15px] font-bold text-[#64748B]">Memuat Data...</p>
          </div>
        ) : materiList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#F8FAFC]/50 rounded-2xl border border-dashed border-[#E2E8F0]">
            <p className="text-[15px] font-bold text-[#64748B]">Tidak ada Data</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">Belum ada materi yang diunggah untuk pertemuan ini.</p>
          </div>
        ) : (
          materiList.map((materi) => (
            <div key={materi.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="text-[15px] font-bold text-[#1E293B] mb-1">{materi.judul_materi}</h5>
                  {materi.deskripsi && (
                    <p className="text-[13px] text-gray-500">{materi.deskripsi}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditMateriTarget({
                        id: materi.id,
                        title: materi.judul_materi,
                        deskripsi: materi.deskripsi,
                        link: materi.link_video_pembelajaran,
                        file_materi: materi.file_materi || []
                      });
                      setIsUploadMateriOpen(true);
                    }}
                    className="px-4 py-1.5 border border-[#167A61] text-[#167A61] rounded-md text-[12px] font-bold hover:bg-[#167A61] hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteMateriTarget(materi)}
                    className="px-4 py-1.5 bg-red-50 text-red-500 rounded-md text-[12px] font-bold hover:bg-red-100 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              {materi.link_video_pembelajaran && (
                <div className="mb-4">
                  <p className="text-[13px] font-semibold text-[#64748B] mb-2 uppercase tracking-wide">Video Pembelajaran</p>
                  <div className="aspect-w-16 aspect-h-9 max-w-2xl rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      src={(() => {
                        const url = materi.link_video_pembelajaran;
                        if (!url) return "";
                        try {
                          let videoId = "";
                          if (url.includes("youtube.com/watch")) {
                            videoId = new URL(url).searchParams.get("v");
                          } else if (url.includes("youtu.be/")) {
                            videoId = url.split("youtu.be/")[1]?.split("?")[0];
                          } else if (url.includes("youtube.com/embed/")) {
                            return url;
                          }
                          if (videoId) return `https://www.youtube.com/embed/${videoId}`;
                        } catch (e) {
                          // Ignore parse error
                        }
                        // Fallback replacement if parsing fails
                        return url.replace("watch?v=", "embed/");
                      })()}
                      title="Video Pembelajaran"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[300px]"
                    ></iframe>
                  </div>
                </div>
              )}

              {materi.file_materi && materi.file_materi.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-[#64748B] mb-2 uppercase tracking-wide">File Materi</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {materi.file_materi.map((file, idx) => {
                      const fileName = file.split('_').pop();
                      return (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.preventDefault();
                            materiService.forceDownload(file, fileName);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#167A61] hover:bg-[#F0FAF6]/30 transition-all group text-left w-full"
                        >
                          <div className="w-10 h-10 min-w-[40px] rounded-lg bg-[#F0FAF6] flex items-center justify-center text-[#167A61]">
                            <Download size={18} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[13px] font-bold text-[#1E293B] truncate group-hover:text-[#167A61]">{fileName}</p>
                            <p className="text-[11px] text-gray-500">Unduh File</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const formatTugasDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const renderTugas = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[16px] font-bold text-[#1E293B]">Tugas Pertemuan</h4>
        <button
          onClick={() => setIsTugasModalOpen(true)}
          className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all"
        >
          <Plus size={14} />
          Tambah Tugas
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {loadingTugas ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#F8FAFC]/50 rounded-2xl border border-dashed border-[#E2E8F0]">
            <Loader2 size={32} className="animate-spin text-[#167A61] mb-4" />
            <p className="text-[15px] font-bold text-[#64748B]">Memuat Data...</p>
          </div>
        ) : tugasList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#F8FAFC]/50 rounded-2xl border border-dashed border-[#E2E8F0]">
            <p className="text-[15px] font-bold text-[#64748B]">Tidak ada Data</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">Belum ada tugas yang diberikan untuk pertemuan ini.</p>
          </div>
        ) : (
          tugasList.map((tugas) => {
            const isAktif = !tugas.batas_waktu || new Date(tugas.batas_waktu) > new Date();
            return (
              <div key={tugas.id} className="bg-[#F8FAFC]/60 border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all flex flex-col relative">
                <div className="flex justify-between items-start w-full">
                  <div className="flex-1 pr-6">
                    <h5 className="text-[15px] font-bold text-[#1E293B]">{tugas.judul_tugas}</h5>
                    <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                      {tugas.deskripsi_tugas || "Belum ada deskripsi untuk tugas ini."}
                    </p>

                    <div className="flex items-center gap-8 mt-5">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batas Waktu</p>
                        <p className="text-[13px] font-bold text-[#1E293B]">{formatTugasDate(tugas.batas_waktu)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                        <p className={`text-[13px] font-bold ${isAktif ? 'text-[#167A61]' : 'text-red-500'}`}>
                          {isAktif ? 'Aktif' : 'Selesai'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditTugasTarget({
                          id: tugas.id,
                          judul: tugas.judul_tugas,
                          deskripsi: tugas.deskripsi_tugas,
                          tautan: tugas.link_cbt,
                          token: tugas.token_cbt,
                          batasWaktu: tugas.batas_waktu ? tugas.batas_waktu.slice(0, 16) : "",
                        });
                        setIsTugasModalOpen(true);
                      }}
                      className="px-4 py-1.5 border border-[#167A61] text-[#167A61] rounded-md text-[12px] font-bold hover:bg-[#167A61] hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTugasTarget(tugas)}
                      className="px-4 py-1.5 bg-red-50 text-red-500 rounded-md text-[12px] font-bold hover:bg-red-100 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {tugas.link_cbt && (
                  <div className="mt-5 flex items-stretch bg-[#EAF5F0] rounded-lg overflow-hidden border border-[#D5EBE1]">
                    <div className="flex-1 px-4 py-3 text-[13px] text-gray-600 flex items-center">
                      <span className="mr-2">Tautan CBT :</span>
                      <a href={tugas.link_cbt} target="_blank" rel="noopener noreferrer" className="text-[#167A61] font-bold hover:underline truncate max-w-[400px]">
                        {tugas.link_cbt}
                      </a>
                    </div>
                    {tugas.token_cbt && (
                      <div className="bg-[#48C496] px-6 py-2 flex flex-col items-center justify-center min-w-[100px]">
                        <span className="text-[10px] text-white/90 font-medium tracking-widest mb-0.5">TOKEN</span>
                        <span className="text-[14px] text-white font-bold tracking-wider">{tugas.token_cbt}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderForum = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden flex flex-col h-[800px]">
        {/* Header Forum */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
          <h4 className="text-[16px] font-bold text-[#1E293B]">Forum Diskusi: {pertemuanName || `Pertemuan ke-${pertemuanId}`}</h4>
          <p className="text-[14px] font-medium text-[#64748B]">{pesertaCount} Peserta</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-[#F5F9F8]">
          {loadingForum ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-[#167A61] mb-4" />
              <p className="text-[15px] font-bold text-[#64748B]">Memuat Data...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <p className="text-[15px] font-bold text-[#64748B]">Tidak ada Data</p>
              <p className="text-[13px] text-[#94A3B8] mt-1">Belum ada diskusi di forum ini. Jadilah yang pertama mengirim pesan!</p>
            </div>
          ) : (
            chats.map(chat => (
              <div key={chat.id} className={`flex ${chat.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`${chat.isMe ? 'bg-[#167A61] text-white rounded-tr-none' : 'bg-white border border-[#E2E8F0]/60 text-[#1E293B] rounded-tl-none'} py-2.5 px-3.5 rounded-2xl max-w-[75%] shadow-sm relative group flex flex-col`}>

                  {/* Name for other's message */}
                  {!chat.isMe && (
                    <p className="text-[13px] font-bold text-[#167A61] mb-0.5 pr-6">{chat.name}</p>
                  )}

                  {/* Quoted Message */}
                  {chat.replyTo && (
                    <div className={`border-l-4 p-2 mb-1.5 rounded-lg text-[13px] pr-8 relative ${chat.isMe ? 'bg-black/10 border-[#A7D7C5]' : 'bg-[#F1F5F9] border-[#167A61]'}`}>
                      <p className={`font-bold mb-0.5 ${chat.isMe ? 'text-[#A7D7C5]' : 'text-[#167A61]'}`}>{chat.replyTo.name}</p>
                      <p className={`line-clamp-2 ${chat.isMe ? 'text-white/90' : 'text-gray-600'}`}>{chat.replyTo.message}</p>
                    </div>
                  )}

                  <p className="text-[14.5px] leading-relaxed pr-6">{chat.message}</p>
                  <p className={`text-[11px] self-end mt-1.5 mb-0 ${chat.isMe ? 'text-white/80' : 'text-[#94A3B8]'}`}>{chat.time}</p>

                  {/* Actions */}
                  {chat.isMe ? (
                    <>
                      <button
                        onClick={() => setActiveDropdownId(activeDropdownId === chat.id ? null : chat.id)}
                        className="absolute right-2 top-2.5 text-white/70 hover:text-white transition-opacity"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdownId === chat.id && (
                        <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 w-32 overflow-hidden">
                          <button
                            onClick={() => {
                              setEditingChatId(chat.id);
                              setChatMessage(chat.message);
                              setActiveDropdownId(null);
                              setReplyingTo(null);
                              if (chatInputRef.current) chatInputRef.current.focus();
                            }}
                            className="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteChatTarget(chat);
                              setActiveDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingTo({ id: chat.id, name: chat.name, message: chat.message });
                        setEditingChatId(null);
                        if (chatInputRef.current) chatInputRef.current.focus();
                      }}
                      className="absolute right-2 top-2.5 text-gray-400 hover:text-[#167A61] transition-opacity"
                    >
                      <Reply size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply/Edit Preview Box */}
        {(replyingTo || editingChatId) && (
          <div className="px-6 pt-4 bg-white border-t border-[#E2E8F0]">
            <div className="bg-[#F1F5F9] border-l-4 border-[#167A61] rounded-lg p-3 flex justify-between items-start">
              <div>
                <p className="text-[13px] font-bold text-[#167A61] mb-0.5">
                  {editingChatId ? "Edit Pesan" : `Membalas ${replyingTo.name}`}
                </p>
                <p className="text-[13px] text-gray-600 line-clamp-1">
                  {editingChatId ? "Edit pesan Anda di bawah" : replyingTo.message}
                </p>
              </div>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  if (editingChatId) {
                    setEditingChatId(null);
                    setChatMessage("");
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`px-6 pb-4 ${replyingTo || editingChatId ? 'pt-2 border-none' : 'py-4 border-t border-[#E2E8F0]'} bg-white flex items-end gap-3`}>
          <textarea
            ref={chatInputRef}
            rows={1}
            value={chatMessage}
            placeholder="Tulis pesan Anda..."
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendChat();
              }
            }}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400/80 outline-none transition duration-200 focus:bg-white focus:ring-2 focus:ring-[#0E5C46] resize-none overflow-y-auto min-h-[46px] max-h-[120px]"
          />
          <button
            onClick={handleSendChat}
            disabled={!chatMessage.trim()}
            className={`flex items-center gap-2 text-sm font-bold text-white px-5 py-3 rounded-lg transition-all h-[46px] shadow-sm ${!chatMessage.trim()
              ? 'bg-gray-300 border-gray-300 cursor-not-allowed shadow-none'
              : 'bg-[#167A61] border border-[#167A61] hover:bg-[#0E5C46]'
              }`}
          >
            Kirim
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const handleConfirmSave = () => {
    setIsConfirmModalOpen(false);
    // Optional: you can show a success toast here
  };

  return (
    <>
      <ConfirmSaveModal
        isOpen={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Simpan Presensi?"
        description="Apakah Anda yakin ingin menyimpan data presensi untuk pertemuan ini?"
      />

      <UploadMateriModal
        isOpen={isUploadMateriOpen}
        onClose={() => {
          setIsUploadMateriOpen(false);
          setEditMateriTarget(null);
        }}
        editData={editMateriTarget}
      />

      <DeleteConfirmModal
        data={deleteMateriTarget}
        isOpen={!!deleteMateriTarget}
        title="Hapus Materi"
        fields={[{ label: "Judul Materi", key: "title" }]}
        onCancel={() => setDeleteMateriTarget(null)}
        onConfirm={() => {
          // implement mock delete
          setDeleteMateriTarget(null);
        }}
      />

      <TugasModal
        isOpen={isTugasModalOpen}
        onClose={() => {
          setIsTugasModalOpen(false);
          setEditTugasTarget(null);
        }}
        editData={editTugasTarget}
      />

      <DeleteConfirmModal
        data={deleteTugasTarget}
        isOpen={!!deleteTugasTarget}
        title="Hapus Tugas"
        fields={[{ label: "Judul Tugas", key: "title" }]}
        onCancel={() => setDeleteTugasTarget(null)}
        onConfirm={() => {
          // implement mock delete
          setDeleteTugasTarget(null);
        }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#64748B] mb-5">
        <Link
          to={`/dosen/kelola-sesi-pertemuan/${id}/kelas/${kelasId}`}
          state={{ groupData: jadwal, classData: classData }}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#167A61] text-[#167A61] rounded-xl bg-transparent hover:bg-[#F0FAF6] transition-all font-bold text-[13px] mr-2"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          <span>Kembali ke Daftar Sesi Pertemuan</span>
        </Link>
        <Link
          to={`/dosen/kelola-sesi-pertemuan/${id}`}
          state={{ groupData: jadwal }}
          className="hover:text-[#167A61] transition-colors"
        >
          {jadwal?.nama_mk || "Memuat..."}
        </Link>
        <ChevronRight size={14} />
        <Link
          to={`/dosen/kelola-sesi-pertemuan/${id}/kelas/${kelasId}`}
          state={{ groupData: jadwal, classData: classData }}
          className="hover:text-[#167A61] transition-colors"
        >
          {classData?.nama_kelas || "Memuat..."}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#1E293B] font-semibold">{pertemuanName || `Pertemuan ke-${pertemuanId}`}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#167A61]"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[20px] font-extrabold text-[#1E293B] mb-1">
              {pertemuanName || `Pertemuan ke-${pertemuanId}`}
            </h3>
            <p className="text-[14px] text-[#64748B] font-medium">
              {jadwal?.nama_mk} - {classData?.nama_kelas}
            </p>
          </div>
            <div className="flex items-center gap-3">
              <span className={`px-6 py-2 rounded-full text-[13px] font-black tracking-wide uppercase ${localPertemuanData.status === "SELESAI"
                ? "bg-[#DCFCE7] text-[#008B5E]"
                : localPertemuanData.status === "BERJALAN"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
                }`}>
                {localPertemuanData.status || "TERJADWAL"}
              </span>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase mb-1.5">Jadwal</p>
              <p className="text-[15px] font-bold text-[#1E293B]">
                {formatTanggal(localPertemuanData.tanggal_pelaksanaan)}
                {localPertemuanData.jam_mulai ? `, ${localPertemuanData.jam_mulai.substring(0, 5)}` : ""}
                {localPertemuanData.jam_berakhir ? ` - ${localPertemuanData.jam_berakhir.substring(0, 5)}` : ""}
              </p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase  mb-1.5">Metode</p>
              <p className="text-[15px] font-bold text-[#1E293B]">
                {localPertemuanData.metode_pertemuan === "synchronous" || localPertemuanData.metode_pertemuan === "Synchronous" ? "Synchronous" :
                  localPertemuanData.metode_pertemuan === "asynchronous" || localPertemuanData.metode_pertemuan === "Asynchronous" ? "Asynchronous" :
                    (localPertemuanData.metode_pertemuan || "-")}
              </p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase mb-1.5">Materi</p>
              <p className="text-[15px] font-bold text-[#1E293B]">{localPertemuanData.materi || "-"}</p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase mb-1.5">Jumlah Mahasiswa</p>
              <p className="text-[15px] font-bold text-[#1E293B]">{presensi.length > 0 ? presensi.length : "-"}</p>
            </div>
          </div>

          {localPertemuanData.metode_pertemuan?.toLowerCase() !== "asynchronous" && localPertemuanData.link_kelas_daring && (
            <div className="bg-[#167A61]/10 rounded-xl px-5 py-3 mb-8">
              <p className="text-[14px] text-[#64748B]">
                Tautan Zoom/GMeet : <a href={localPertemuanData.link_kelas_daring} target="_blank" rel="noreferrer" className="font-bold text-[#167A61] hover:underline ml-1">{localPertemuanData.link_kelas_daring}</a>
              </p>
            </div>
          )}

          {/* Tabs Nav */}
          <div className="flex border-y border-[#E2E8F0] bg-gray-50/50">
            {[
              { id: "presensi", label: "Presensi" },
              { id: "materi", label: "Materi" },
              { id: "tugas", label: "Tugas" },
              { id: "forum", label: "Forum Diskusi" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-3.5 text-[15px] font-bold transition-all relative ${activeTab === tab.id
                  ? "text-[#167A61]"
                  : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#167A61] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

        {/* Tab Content */}
        <div className="p-8 min-h-[400px]">
          {activeTab === "presensi" && renderPresensi()}
          {activeTab === "materi" && renderMateri()}
          {activeTab === "tugas" && renderTugas()}
          {activeTab === "forum" && renderForum()}
        </div>
      </div>

      <DeleteConfirmModal
        data={deleteChatTarget}
        isOpen={!!deleteChatTarget}
        title="Hapus Pesan"
        fields={[{ label: "Isi Pesan", key: "message" }]}
        onConfirm={async () => {
          try {
            await forumDiskusiService.delete(deleteChatTarget.id);
            await fetchForum();
            setDeleteChatTarget(null);
          } catch (err) {
            console.error('Gagal menghapus pesan', err);
          }
        }}
        onCancel={() => setDeleteChatTarget(null)}
      />

      <UbahSesiModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        jadwalId={jadwal?.id_jadwal}
        data={localPertemuanData}
        onSaveSuccess={(updatedData) => {
          if (updatedData) {
            setLocalPertemuanData(prev => ({
              ...prev,
              ...updatedData,
              // Ensure time format matches display if backend returns standard format
              jam_mulai: updatedData.jam_mulai || prev.jam_mulai,
              jam_berakhir: updatedData.jam_berakhir || prev.jam_berakhir,
              link_kelas_daring: updatedData.link_kelas_daring !== undefined ? updatedData.link_kelas_daring : prev.link_kelas_daring,
              url_cbt: updatedData.url_cbt !== undefined ? updatedData.url_cbt : prev.url_cbt,
            }));
          }
          setIsEditModalOpen(false);
        }}
      />

      <ConfirmSaveModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={async () => {
          setIsConfirmModalOpen(false);
          try {
            const payload = {
              id_sesi: pertemuanId,
              presensi: presensi.map(p => ({
                id_peserta: p.id,
                status_kehadiran: (p.status || "alpha").toLowerCase()
              }))
            };
            await presensiService.bulkSave(payload);
            // Optionally refetch
            fetchPresensi();
          } catch (err) {
            console.error("Gagal menyimpan presensi:", err);
          }
        }}
        title="Simpan Presensi"
        message="Apakah Anda yakin ingin menyimpan data presensi ini? Data kehadiran mahasiswa akan diperbarui di sistem."
      />

      {isUploadMateriOpen && (
        <UploadMateriModal
          isOpen={isUploadMateriOpen}
          onClose={() => { setIsUploadMateriOpen(false); setEditMateriTarget(null); }}
          pertemuanId={pertemuanId}
          editData={editMateriTarget}
          onSaveSuccess={() => {
            fetchMateri();
            setIsUploadMateriOpen(false);
            setEditMateriTarget(null);
          }}
        />
      )}

      <DeleteConfirmModal
        data={deleteMateriTarget}
        fields={[{ label: "Judul Materi", key: "judul_materi" }]}
        onCancel={() => setDeleteMateriTarget(null)}
        onConfirm={async () => {
          try {
            await materiService.delete(deleteMateriTarget.id);
            fetchMateri();
            setDeleteMateriTarget(null);
          } catch (err) {
            console.error('Gagal menghapus materi', err);
          }
        }}
        title="Hapus Materi"
      />

      {isTugasModalOpen && (
        <TugasModal
          isOpen={isTugasModalOpen}
          onClose={() => { setIsTugasModalOpen(false); setEditTugasTarget(null); }}
          pertemuanId={pertemuanId}
          editData={editTugasTarget}
          onSaveSuccess={() => {
            fetchTugas();
            setIsTugasModalOpen(false);
            setEditTugasTarget(null);
          }}
        />
      )}

      <DeleteConfirmModal
        data={deleteTugasTarget}
        fields={[{ label: "Judul Tugas", key: "judul_tugas" }]}
        onCancel={() => setDeleteTugasTarget(null)}
        onConfirm={async () => {
          try {
            await tugasService.delete(deleteTugasTarget.id);
            fetchTugas();
            setDeleteTugasTarget(null);
          } catch (err) {
            console.error('Gagal menghapus tugas', err);
          }
        }}
        title="Hapus Tugas"
      />
    </>
  );
}
