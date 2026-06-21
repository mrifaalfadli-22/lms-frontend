import api from "../config/api";

const BASE = "/presensi";

const presensiService = {
  getBySesi: async (id_sesi) => {
    const res = await api.get(`${BASE}/sesi/${id_sesi}`);
    return res.data;
  },
  bulkSave: async (payload) => {
    const res = await api.post(`${BASE}/bulk-save`, payload);
    return res.data;
  }
};

export default presensiService;
