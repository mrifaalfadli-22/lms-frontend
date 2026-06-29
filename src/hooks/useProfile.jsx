import { createContext, useContext, useState, useEffect } from "react";
import { profileService } from "../services/profileService";

const ProfileContext = createContext(null);

/**
 * Provider yang membungkus seluruh app agar semua komponen
 * dapat share state profil yang sama.
 */
export function ProfileProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem("user_role");
    return savedRole ? { role: savedRole } : null;
  });

  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await profileService.getProfile();
      if (data && data.success) {
        setUser(data.data);
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data profil:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateUser = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  const refreshUser = () => {
    setLoading(true);
    fetchUser();
  };

  return (
    <ProfileContext.Provider value={{ user, loading, updateUser, refreshUser }}>
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Hook untuk mengakses profil dari dalam komponen manapun.
 */
export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile harus digunakan di dalam ProfileProvider");
  }
  return ctx;
};
