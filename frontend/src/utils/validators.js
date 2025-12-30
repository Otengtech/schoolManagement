// utils/validators.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validatePasswordStrength = (password) => {
  if (!password) return { score: 0, message: "Enter a password" };
  
  let score = 0;
  const messages = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else messages.push("At least 8 characters");
  
  // Lowercase check
  if (/[a-z]/.test(password)) score += 1;
  else messages.push("Lowercase letter");
  
  // Uppercase check
  if (/[A-Z]/.test(password)) score += 1;
  else messages.push("Uppercase letter");
  
  // Number check
  if (/\d/.test(password)) score += 1;
  else messages.push("Number");
  
  // Special character check
  if (/[@$!%*?&]/.test(password)) score += 1;
  else messages.push("Special character");
  
  // Strength message
  let strength = "";
  if (score >= 4) strength = "Strong";
  else if (score >= 3) strength = "Medium";
  else strength = "Weak";
  
  return {
    score,
    strength,
    messages,
    color: score >= 4 ? "green" : score >= 3 ? "yellow" : "red"
  };
};

export const validateLoginForm = ({ email, password, role }) => {
  const errors = {};
  
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePasswordStrength(password);
  if (passwordError) errors.password = passwordError;
  
  if (!role) errors.role = "Please select a role";
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// utils/validators.js (add these functions)

export const validateSignupForm = (formData) => {
  const errors = {};
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  } else if (formData.password.length > 20) {
    errors.password = "Password cannot exceed 20 characters";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
    errors.password = "Password must contain both uppercase and lowercase letters";
  } else if (!/(?=.*\d)/.test(formData.password)) {
    errors.password = "Password must contain at least one number";
  } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
    errors.password = "Password must contain at least one special character";
  }
  
  // Role validation
  if (!formData.role) {
    errors.role = "Please select a role";
  }
  
  // Name validation (if you add name field)
  if (formData.name && formData.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

