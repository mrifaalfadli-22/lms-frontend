import { useState, useRef, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight, Download, Edit2, Trash2, Plus, MoreVertical, Reply, Eye, Save, Send, X } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import ConfirmSaveModal from "../../components/admin/ConfirmSaveModal";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import UploadMateriModal from "../../components/dosen/UploadMateriModal";
import TugasModal from "../../components/dosen/TugasModal";

export default function DetailPertemuanTabs() {
  const { id, kelasId, pertemuanId } = useParams();
  const location = useLocation();
  const jadwal = location.state?.groupData || { nama_mk: "Pemrograman Web" };
  const classData = location.state?.classData || { nama_kelas: "Kelas A" };
  const pertemuanName = location.state?.pertemuanName || `Pertemuan ke-${pertemuanId}`;
  const pertemuanData = location.state?.pertemuanData || { metode: "Synchronous" };

  const [activeTab, setActiveTab] = useState("presensi");

  const [presensi, setPresensi] = useState([
    { id: 1, nim: "2023001", nama: "Adam Ramadhan", status: "Hadir" },
    { id: 2, nim: "2023002", nama: "Nurhayati Mulyani", status: "Hadir" },
    { id: 3, nim: "2023003", nama: "Dinda Permatasari", status: "Izin" },
    { id: 4, nim: "2023004", nama: "Farhan Santoso", status: "Hadir" },
    { id: 5, nim: "2023005", nama: "Siti Aisyah", status: "Alpha" },
  ]);

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

  const [chats, setChats] = useState([
    {
      id: 1,
      sender: "Dosen",
      name: "Dosen",
      time: "10:00",
      message: "Halo mahasiswa Kelas A, silakan tanyakan di thread ini jika ada materi kontrak kuliah atau pengenalan yang masih belum jelas.",
      isMe: true,
      replyTo: null
    },
    {
      id: 2,
      sender: "Mahasiswa",
      name: "Adam Ramadhan - 065120114",
      time: "10:15",
      message: "Pak, apakah ada toleransi keterlambatan untuk pengumpulan tugas mingguan?",
      isMe: false,
      replyTo: null
    },
    {
      id: 3,
      sender: "Dosen",
      name: "Dosen",
      time: "10:20",
      message: "Sesuai kontrak kuliah, keterlambatan 1 hari akan dikurangi 10 poin ya Adam. Lebih dari itu tidak diterima.",
      isMe: true,
      replyTo: {
        id: 2,
        name: "Adam Ramadhan - 065120114",
        message: "Pak, apakah ada toleransi keterlambatan untuk pengumpulan tugas mingguan?"
      }
    }
  ]);

  const [replyingTo, setReplyingTo] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [deleteChatTarget, setDeleteChatTarget] = useState(null);

  const chatInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === "forum") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, activeTab]);

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

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;

    if (editingChatId) {
      setChats(prev => prev.map(c => c.id === editingChatId ? { ...c, message: chatMessage } : c));
      setEditingChatId(null);
    } else {
      const newChat = {
        id: Date.now(),
        sender: "Dosen",
        name: "Dosen",
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        message: chatMessage,
        isMe: true,
        replyTo: replyingTo
      };
      setChats(prev => [...prev, newChat]);
    }

    // Reset message and reply state
    setChatMessage("");
    setReplyingTo(null);
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
        <button
          onClick={() => setIsConfirmModalOpen(true)}
          className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all"
        >
          <Save size={14} />
          Simpan Presensi
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">No</th>
              <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">NPM</th>
              <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Nama Mahasiswa</th>
              <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Status Kehadiran</th>
            </tr>
          </thead>normal
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

      <div className="mt-4 border-t border-[#E2E8F0]">
        <Pagination
          currentPage={presensiPage}
          lastPage={presensiLastPage}
          total={presensi.length}
          perPage={presensiPerPage}
          onPageChange={setPresensiPage}
          onPerPageChange={setPresensiPerPage}
        />
      </div>
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
        {[
          {
            title: "Slide: Kontrak Kuliah & Pengenalan Mata Kuliah",
            size: "2.4 MB",
            date: "01 Maret 2026",
          },
          {
            title: "RPS Pemrograman Web Semester Genap 2026",
            size: "1.1 MB",
            date: "01 Maret 2026",
          },
        ].map((m, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-4 border border-[#E2E8F0] p-5 rounded-2xl bg-[#F8FAFC]/40 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-red-50 text-red-500 font-black text-[13px] px-4 py-1 rounded-full border border-red-100">
                PDF
              </div>
              <div>
                <h5 className="text-[15px] font-bold text-[#1E293B] mb-1">{m.title}</h5>
                <p className="text-[13px] text-[#64748B]">{m.size} - Diunggah {m.date}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold">
                <Download size={14} />
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  setEditMateriTarget(m);
                  setIsUploadMateriOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
              >
                <Edit2 size={14} />
                <span>Ubah</span>
              </button>
              <button
                onClick={() => setDeleteMateriTarget(m)}
                className="flex items-center gap-2 px-3 py-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all text-[13px] font-bold"
              >
                <Trash2 size={14} />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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

      <div className="border border-[#E2E8F0] p-7 rounded-2xl bg-[#F8FAFC]/40 hover:bg-white hover:shadow-md transition-all duration-300">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div className="max-w-[70%]">
            <h5 className="text-[16px] font-bold text-[#1E293B] mb-1.5">Tugas 1: Analisis Kebutuhan Sistem</h5>
            <p className="text-[14px] text-[#64748B] leading-relaxed">Mahasiswa diminta membuat dokumen analisis kebutuhan berdasarkan studi kasus.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold">
              <Eye size={14} />
              <span>Lihat Pengumpulan</span>
            </button>
            <button
              onClick={() => {
                setEditTugasTarget({
                  judul: "Tugas 1: Analisis Kebutuhan Sistem",
                  tautan: "https://u-talent.uika-bogor.ac.id/cbt/",
                  token: "123456",
                  batasWaktu: "2026-03-05T23:59"
                });
                setIsTugasModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
            >
              <Edit2 size={14} />
              <span>Ubah</span>
            </button>
            <button
              onClick={() => setDeleteTugasTarget({ title: "Tugas 1: Analisis Kebutuhan Sistem" })}
              className="flex items-center gap-2 px-3 py-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all text-[13px] font-bold"
            >
              <Trash2 size={14} />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-wrap gap-24 border border-[#E2E8F0] px-6 py-4 rounded-xl bg-white">
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase mb-1.5">Batas Waktu</p>
              <p className="text-[14px] font-normal text-[#1E293B]">05 Maret 2026, 23:59</p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase mb-1.5">Status</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#167A61]"></div>
                <p className="text-[14px] font-normal text-[#167A61]">Aktif</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between bg-[#F4FBF8] border border-[#E2E8F0] px-6 py-4 rounded-xl gap-4">
            <p className="text-[14px] text-[#94A3B8] font-medium">
              Tautan CBT : <a href="#" className="font-bold text-[#167A61] hover:underline hover:text-[#0E5C46] transition-colors ml-1">https://u-talent.uika-bogor.ac.id/cbt/</a>
            </p>
            <div className="bg-[#167A61] text-white px-6 py-2 rounded-xl flex flex-col items-center justify-center shadow-sm min-w-[120px]">
              <span className="text-[12px] text-[#A7D7C5] uppercase font-semibold mb-0.5">Token</span>
              <span className="text-[15px] font-bold tracking-widest">123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForum = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden flex flex-col h-[600px]">
        {/* Header Forum */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
          <h4 className="text-[16px] font-bold text-[#1E293B]">Forum Diskusi: {pertemuanName}</h4>
          <p className="text-[14px] font-medium text-[#64748B]">46 Peserta</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-[#F5F9F8]">
          {chats.map(chat => (
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
          ))}
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
          {jadwal.nama_mk}
        </Link>
        <ChevronRight size={14} />
        <Link
          to={`/dosen/kelola-sesi-pertemuan/${id}/kelas/${kelasId}`}
          state={{ groupData: jadwal, classData: classData }}
          className="hover:text-[#167A61] transition-colors"
        >
          {classData.nama_kelas}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#1E293B] font-semibold">{pertemuanName}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Info */}
        <div className="p-8 pb-0">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-[24px] font-extrabold text-[#1E293B] mb-1.5">{pertemuanName}</h2>
              <p className="text-[15px] font-semibold text-[#64748B]">{jadwal.nama_mk} - {classData.nama_kelas}</p>
            </div>
            <span className="bg-[#DCFCE7] text-[#008B5E] px-6 py-2 rounded-full text-[13px] font-black tracking-wide uppercase">
              Selesai
            </span>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase mb-1.5">Jadwal</p>
              <p className="text-[15px] font-bold text-[#1E293B]">01 Maret 2026, 08:00 - 09:30</p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase  mb-1.5">Metode</p>
              <p className="text-[15px] font-bold text-[#1E293B]">{pertemuanData.metode}</p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase mb-1.5">Materi</p>
              <p className="text-[15px] font-bold text-[#1E293B]">Kontrak Kuliah & Pengenalan</p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#64748B] uppercase mb-1.5">Jumlah Mahasiswa</p>
              <p className="text-[15px] font-bold text-[#1E293B]">45 Mahasiswa</p>
            </div>
          </div>

          {pertemuanData.metode !== "Asynchronous" && (
            <div className="bg-[#167A61]/10 rounded-xl px-5 py-3 mb-8">
              <p className="text-[14px] text-[#64748B]">
                Tautan Zoom/GMeet : <a href="#" className="font-bold text-[#167A61] hover:underline ml-1">https://zoom.us/j/123456789</a>
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
        title="Hapus Pesan"
        onConfirm={() => {
          setChats(prev => prev.filter(c => c.id !== deleteChatTarget.id));
          setDeleteChatTarget(null);
        }}
        onCancel={() => setDeleteChatTarget(null)}
        loading={false}
      />
    </>
  );
}
