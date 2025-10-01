import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";

// CLEAN VERSION BELOW (duplicate/corrupted content removed)
const SettingsSkeleton = () => (
  <div className="flex h-screen bg-gray-100 dark:bg-gray-900 animate-pulse">
    <div className="flex-1 p-8 overflow-y-auto space-y-4">
      <div className="h-10 w-1/4 bg-gray-300 dark:bg-gray-700 rounded" />
      <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
      <div className="bg-white dark:bg-gray-800 rounded shadow p-6 space-y-6">
        <div className="flex items-center space-x-4 pb-4 border-b dark:border-gray-700">
          <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-56 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          ))}
          <div className="col-span-2 space-y-2">
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    </div>
  </div>
);

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  dob: "",
  github: "",
  linkedin: "",
};

const Settings = () => {
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const normalizeUrl = (value) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (trimmed === "") return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/api/settings/me", { headers: { Authorization: `Bearer ${token}` } });
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          dob: res.data.dob ? res.data.dob.substring(0, 10) : "",
          github: res.data.github || "",
          linkedin: res.data.linkedin || "",
        });
      } catch (e) {
        toast.error("Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const payload = { ...form, github: normalizeUrl(form.github), linkedin: normalizeUrl(form.linkedin) };
      await api.put("/api/settings/me", payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Profile updated successfully!");
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (field) => setShowPassword((p) => ({ ...p, [field]: !p[field] }));

  const submitPasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error("New passwords do not match");
    if (passwordForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await api.put("/auth/change-password", passwordForm, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">Profile & Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your account settings and preferences</p>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="flex items-center p-6 border-b dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-3xl text-blue-500 font-bold">
              {form.name?.charAt(0) || "?"}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">{form.name || "Unnamed"}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">{form.email}</p>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Student</span>
            </div>
          </div>
          <div className="flex border-b dark:border-gray-700">
            <button className={`flex-1 py-3 text-center font-semibold transition ${tab === "profile" ? "bg-gray-100 dark:bg-gray-700 border-b-2 border-blue-600" : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"} text-black dark:text-white`} onClick={() => setTab("profile")}>Profile</button>
            <button className={`flex-1 py-3 text-center font-semibold transition ${tab === "password" ? "bg-gray-100 dark:bg-gray-700 border-b-2 border-blue-600" : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"} text-black dark:text-white`} onClick={() => setTab("password")}>Password</button>
          </div>
          {tab === "profile" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black dark:text-white">Full Name</label>
                  <input disabled name="name" value={form.name} onChange={handleChange} className="w-full mt-1 border dark:border-gray-600 rounded px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-black dark:text-white">Email Address</label>
                  <input disabled name="email" value={form.email} className="w-full mt-1 border dark:border-gray-600 rounded px-3 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-black dark:text-white">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full mt-1 border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-black dark:text-white">Date of Birth</label>
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full mt-1 border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-black dark:text-white">Address</label>
                  <input name="address" value={form.address} onChange={handleChange} className="w-full mt-1 border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-black dark:text-white">GitHub Profile</label>
                  <input name="github" value={form.github} onChange={handleChange} placeholder="https://github.com/username" className="w-full mt-1 border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-black dark:text-white">LinkedIn Profile</label>
                  <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" className="w-full mt-1 border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <button disabled={saving} onClick={handleSave} className="mt-4 bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded hover:bg-blue-700 transition">{saving ? "Saving..." : "Save Profile"}</button>
            </div>
          )}
          {tab === "password" && (
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-black dark:text-white">Change Password</h2>
              <p className="text-gray-500 dark:text-gray-300">Update your password to keep your account secure</p>
              {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-black dark:text-white">{field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}</label>
                  <div className="relative mt-1">
                    <input type={showPassword[field] ? "text" : "password"} name={field} value={passwordForm[field]} onChange={handlePasswordChange} className="w-full border dark:border-gray-600 px-3 py-2 rounded dark:bg-gray-700 dark:text-white" />
                    <button type="button" onClick={() => toggleVisibility(field)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" aria-label={showPassword[field] ? "Hide password" : "Show password"}>
                      {showPassword[field] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={submitPasswordChange} className="mt-2 bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition">Change Password</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
