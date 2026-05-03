import api from "../config/api";

export const authService = {
  login: async (credentials, role) => {
    try {
      /**
       * BAGIAN 1: ENDPOINT API
       * -----------------------------------------------------------
       * SEKARANG: Masih get semua user untuk simulasi.
       * NANTI: Ganti menjadi api.post("/auth/login", { ...credentials, role })
       */
      const { data: users } = await api.get("/users");

      /**
       * BAGIAN 2: LOGIKA VERIFIKASI
       * -----------------------------------------------------------
       * SEKARANG: Verifikasi manual di frontend (Cari di array).
       * NANTI: Hapus baris find() ini. Backend yang akan melakukan verifikasi
       * dan mengirimkan data user beserta Token jika berhasil.
       */
      const user = users.find(
        (u) =>
          (u.email === credentials.email ||
            u.nidn === credentials.email ||
            u.username === credentials.email) &&
          u.password === credentials.password &&
          u.role === role,
      );

      if (user) {
        /**
         * BAGIAN 3: PENYIMPANAN TOKEN (JWT)
         * -----------------------------------------------------------
         * SEKARANG: Pakai fake-token string biasa.
         * NANTI: Ambil token asli dari response backend,
         * misal: localStorage.setItem("user_token", response.data.token);
         */
        localStorage.setItem("user_token", `fake-token-${user.id}`);
        localStorage.setItem("user_role", user.role);

        return user;
      } else {
        throw new Error("Akun Pengguna atau Password anda tidak sesuai.");
      }
    } catch (error) {
      /**
       * BAGIAN 4: ERROR HANDLING
       * -----------------------------------------------------------
       * SEKARANG: Masih handle error network json-server.
       * NANTI: Sesuaikan catch untuk menangkap status code 401 (Unauthorized)
       * atau 500 (Internal Server Error) dari backend asli.
       */
      if (error.code === "ERR_NETWORK") {
        throw new Error(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        );
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.clear();
    // Jika perlu, tambahkan navigasi balik ke login di sini
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem("user_token");
    if (!token) return null;

    // Ambil ID dari token (format: fake-token-ID)
    const userId = token.split("-").pop();
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};
