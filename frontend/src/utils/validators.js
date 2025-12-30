// utils/validators.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return "";
};

export const validateLoginForm = ({ email, password, role }) => {
  const errors = {};
  
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  
  if (!role) errors.role = "Please select a role";
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};