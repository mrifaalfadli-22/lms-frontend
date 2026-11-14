import api from "../config/api";

export const authService = {
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
        const message =
          error.response.data?.message || "Terjadi kesalahan pada server";
        const err = new Error(message);
        err.status = error.response.status;
        throw err;
      }
      if (error.code === "ERR_NETWORK") {
        const err = new Error(
          "Tidak dapat terhubung ke server. Periksa koneksi backend Anda.",
        );
        err.status = 0;
        throw err;
      }
      throw error;
    }
  },

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

  logout: () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_role");
  },

  ssoLogin: async ({ token, roleId, appModuleId }) => {
    try {
      const response = await api.get("/sso/callback", {
        params: { token, role_id: roleId, appModule_id: appModuleId },
      });

      const resData = response.data;

      if (resData.status === "success") {
        const { token: localToken, user } = resData.data;
        const normalizedRole = user.role.toLowerCase();

        localStorage.setItem("user_token", localToken);
        localStorage.setItem("user_role", normalizedRole);

        return { ...user, role: normalizedRole };
      } else {
        throw new Error(resData.message || "Login SSO gagal");
      }
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message || "Terjadi kesalahan pada server";
        const err = new Error(message);
        err.status = error.response.status;
        throw err;
      }
      if (error.code === "ERR_NETWORK") {
        const err = new Error(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        );
        err.status = 0;
        throw err;
      }
      throw error;
    }
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

