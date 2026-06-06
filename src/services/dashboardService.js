import api from "../config/api";

export const dashboardService = {
  /**
   * Ambil statistik dashboard dalam satu request.
   * Backend menggunakan COUNT query — sangat ringan.
   */
  getStats: async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },
};
