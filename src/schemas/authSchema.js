import * as Yup from "yup";

// Validasi untuk Portal Dosen
export const dosenLoginSchema = Yup.object().shape({
  email: Yup.string().required("NIDN or Email is required"),
  password: Yup.string().required("Password is required"),
});

// Validasi untuk Portal Admin
export const adminLoginSchema = Yup.object().shape({
  email: Yup.string().required("Username or Email is required"),
  password: Yup.string().required("Password is required"),
});

// --- Register Schema ---
export const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, "Name is too short")
    .required("Full name is required"),

  nidn: Yup.string()
    .matches(/^[0-9]+$/, "NIDN must be a number")
    .min(10, "NIDN must be at least 10 digits")
    .max(12, "NIDN must not exceed 12 digits")
    .required("NIDN is required"),

  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});
