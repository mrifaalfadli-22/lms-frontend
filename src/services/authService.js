import api from "../config/api";

export const authService = {
  registerDosen: async (data) => {
    try {
      const response = await api.post("/register/dosen", data);
      return response.data;
    } catch (error) {
      if (error.response) {
        const resData = error.response.data;

        if (error.response.status === 422) {
          if (resData.errors) {
            const allErrors = Object.values(resData.errors).flat().join(" ");
            throw new Error(allErrors);
          }
          throw new Error(resData.message || "Data tidak valid");
        }

        throw new Error(resData.message || "Terjadi kesalahan pada server");
      }
      if (error.code === "ERR_NETWORK") {
        throw new Error(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        );
      }
      throw error;
    }
  },

  login: async (credentials, role) => {
    try {
      const inputIdentifier =
        credentials.identifier ||
        credentials.email ||
        credentials.username ||
        credentials.nomor_induk;

      const response = await api.post("/login", {
        identifier: inputIdentifier,
        password: credentials.password,
        role: role,
      });

      const resData = response.data;

      if (resData.status === "success") {
        const { token, user } = resData.data;
        const normalizedRole = (user.role || role).toLowerCase();

        localStorage.setItem("user_token", token);
        localStorage.setItem("user_role", normalizedRole);

        return { ...user, role: normalizedRole };
      } else {
        throw new Error(resData.message || "Login gagal");
      }
    } catch (error) {
      if (error.response) {
        // ✅ Bawa status code ke dalam error object
        const message =
          error.response.data?.message || "Terjadi kesalahan pada server";
        const err = new Error(message);
        err.status = error.response.status; // <-- INI YANG KURANG
        throw err;
      }
      if (error.code === "ERR_NETWORK") {
        const err = new Error(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        );
        err.status = 0; // <-- Supaya useAuth bisa deteksi koneksi error
        throw err;
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_role");
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem("user_token");
      if (!token) return null;

      const response = await api.get("/user");
      const userData = response.data.data || response.data;

      if (userData && userData.role) {
        userData.role = userData.role.toLowerCase();
      }

      return userData;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_role");
      }
      return null;
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post("/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post("/reset-password", data);
    return response.data;
  }
};
