import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/auth";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(token, password);
      alert("Password reset successful. Please login.");
      navigate("/login");
    } catch (err) {
      setError("Reset link is invalid or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* LEFT */}
      <div className="bg-green-300 flex flex-col justify-center px-10">
        <h1 className="text-4xl font-bold text-green-900 mb-4">
          Reset Your Password
        </h1>
        <p className="text-green-800 text-lg max-w-md">
          Create a new password to regain access to your account.
        </p>
      </div>

      {/* RIGHT */}
      <div className="bg-white flex items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800">
            Set New Password
          </h2>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* PASSWORD */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
              placeholder="••••••••"
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
              placeholder="••••••••"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          {/* BACK TO LOGIN */}
          <p className="text-sm text-center text-gray-600">
            Remembered your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-green-600 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </form>
      </div>

    </div>
  );
};

export default ResetPassword;
