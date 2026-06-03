import { useState, useEffect } from "react";
import { authService } from "../services/authService";

export const useProfile = () => {
  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem("user_role");
    return savedRole ? { role: savedRole } : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getCurrentUser();

        // Debugging: Buka Console (F12) untuk melihat apakah 'nama_lengkap' ada di sini
        console.log("Data user dari BE:", data);

        if (data) {
          setUser(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};
