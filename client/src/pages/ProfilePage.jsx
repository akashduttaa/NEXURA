import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Mail,
  BookOpen,
  Clock,
  Award,
  Edit2,
  Check,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthStore();

  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [avatarError, setAvatarError] = useState("");
  const [editField, setEditField] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [fieldValues, setFieldValues] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });
  const [tempValue, setTempValue] = useState("");
  const fileInputRef = useRef(null);

  // Fetch fresh profile from DB on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setFieldValues({
            name: data.user.name,
            email: data.user.email,
            bio: data.user.bio || "",
          });
          setAvatar(data.user.avatar || null);
          updateUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
    else setLoading(false);
  }, [token]);

  // Save to MongoDB via PATCH /api/auth/profile
  const saveToServer = async (updates) => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Update failed");
      updateUser(data.user);
      setSaveSuccess("Saved!");
      setTimeout(() => setSaveSuccess(""), 2500);
      return true;
    } catch (err) {
      setSaveError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Avatar upload — reads to base64, saves to DB
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5 MB.");
      return;
    }
    setAvatarError("");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setAvatar(dataUrl);
      await saveToServer({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (field) => {
    setTempValue(fieldValues[field]);
    setEditField(field);
  };
  const saveEdit = async () => {
    const ok = await saveToServer({ [editField]: tempValue });
    if (ok) setFieldValues((prev) => ({ ...prev, [editField]: tempValue }));
    setEditField(null);
  };
  const cancelEdit = () => setEditField(null);

  const stats = [
    {
      label: "Role",
      value: user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "—",
      icon: Award,
    },
    { label: "Reference ID", value: user?.referenceId || "—", icon: BookOpen },
    {
      label: "Member since",
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          })
        : "—",
      icon: Clock,
    },
  ];

  const initials = fieldValues.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-nexura-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {(saveSuccess || saveError) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
              saveSuccess
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {saveSuccess || saveError}
          </motion.div>
        )}

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-strong rounded-2xl p-8 w-full"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar — fixed square + object-fit: cover prevents stretching */}
            <div className="relative flex-shrink-0 group">
              <div
                className="w-28 h-28 rounded-full overflow-hidden border-2 border-nexura-cyan/40"
                style={{ aspectRatio: "1 / 1" }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fieldValues.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      display: "block",
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-600/20 text-nexura-cyan font-bold text-3xl font-display">
                    {initials || "?"}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload avatar"
                disabled={saving}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {avatarError && (
              <p className="text-red-400 text-xs">{avatarError}</p>
            )}

            <div className="flex-1 w-full space-y-4 text-center sm:text-left">
              <EditableField
                value={fieldValues.name}
                isEditing={editField === "name"}
                tempValue={tempValue}
                onTempChange={setTempValue}
                onEdit={() => startEdit("name")}
                onSave={saveEdit}
                onCancel={cancelEdit}
                saving={saving}
                displayClass="text-2xl font-bold font-display gradient-text"
                inputClass="text-2xl font-bold font-display bg-transparent border-b border-nexura-cyan/50 text-nexura-text outline-none w-full"
              />
              <EditableField
                value={fieldValues.email}
                isEditing={editField === "email"}
                tempValue={tempValue}
                onTempChange={setTempValue}
                onEdit={() => startEdit("email")}
                onSave={saveEdit}
                onCancel={cancelEdit}
                saving={saving}
                icon={<Mail className="w-4 h-4 text-nexura-text-dim" />}
                displayClass="text-nexura-text-dim text-sm"
                inputClass="text-sm bg-transparent border-b border-nexura-cyan/50 text-nexura-text outline-none"
              />

              {/* Bio */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest text-nexura-text-dim">
                    About
                  </span>
                  {editField !== "bio" && (
                    <button
                      onClick={() => startEdit("bio")}
                      className="text-nexura-text-dim hover:text-nexura-cyan transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {editField === "bio" ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="w-full bg-transparent border border-nexura-cyan/30 rounded-lg p-2 text-sm text-nexura-text outline-none resize-none focus:border-nexura-cyan/60"
                      placeholder="Tell us about yourself…"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-nexura-cyan/10 text-nexura-cyan hover:bg-nexura-cyan/20 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}{" "}
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-nexura-text-dim hover:bg-white/10 transition-colors"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                      <span className="text-xs text-nexura-text-dim ml-auto">
                        {tempValue.length}/500
                      </span>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => startEdit("bio")}
                    className="text-nexura-text-dim text-sm leading-relaxed cursor-pointer hover:text-nexura-text transition-colors"
                  >
                    {fieldValues.bio || (
                      <span className="italic opacity-40">
                        Click to add a bio…
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
        >
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="glass-strong rounded-xl p-6 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-nexura-cyan/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-nexura-cyan" />
              </div>
              <div>
                <p className="text-xs text-nexura-text-dim uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-lg font-bold font-display gradient-text mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Account info */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 w-full"
        >
          <h3 className="text-sm font-semibold text-nexura-text mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-500 to-purple-600 inline-block" />
            Account Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "User ID", value: user?.id || user?._id || "—" },
              { label: "Reference ID", value: user?.referenceId || "—" },
              {
                label: "Email verified",
                value: user?.isVerified !== false ? "✅ Yes" : "❌ No",
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-nexura-text-dim mb-1">{label}</p>
                <p className="text-sm font-mono text-nexura-text break-all">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-xs text-nexura-text-dim pb-4"
        >
          Hover your avatar to upload · Max 5 MB · JPG, PNG, WebP — changes save
          directly to MongoDB
        </motion.p>
      </div>
    </div>
  );
}

function EditableField({
  value,
  isEditing,
  tempValue,
  onTempChange,
  onEdit,
  onSave,
  onCancel,
  saving,
  icon,
  displayClass,
  inputClass,
}) {
  return isEditing ? (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={tempValue}
        onChange={(e) => onTempChange(e.target.value)}
        className={inputClass}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
      />
      <button
        onClick={onSave}
        disabled={saving}
        className="text-nexura-cyan hover:text-cyan-300 transition-colors disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={onCancel}
        className="text-nexura-text-dim hover:text-red-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <button
      onClick={onEdit}
      className={`group flex items-center gap-2 hover:opacity-80 transition-opacity text-left ${displayClass}`}
    >
      {icon}
      {value || <span className="italic opacity-40 text-sm">Not set</span>}
      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
    </button>
  );
}
