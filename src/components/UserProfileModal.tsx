import React, { useState, useRef } from 'react';
import { User } from '../types';
import { 
  UserCheck, 
  Key, 
  Shield, 
  Check, 
  X, 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles,
  Phone,
  Mail,
  Building2,
  BadgeCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updated: User) => void;
}

export const UserProfileModal: React.FC<Props> = ({ isOpen, onClose, currentUser, onUpdateUser }) => {
  const [username, setUsername] = useState(currentUser.username);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Preset Avatar Options for Thai Government & Official Staff
  const avatarPresets = [
    { label: 'ข้าราชการชาย (สูทสากล)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'ข้าราชการหญิง (ชุดสุภาพ)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    { label: 'เจ้าหน้าที่ผู้บริหาร (ดร./นายก)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { label: 'พนักงานจ้าง/เจ้าหน้าที่ทั่วไป', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'ประชาชนทั่วไป', url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80' },
  ];

  // Handle local file upload (converts to base64 Data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('ขนาดรูปภาพต้องไม่เกิน 3 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setAvatar(result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    onUpdateUser({
      ...currentUser,
      username,
      avatar,
      phone,
      email,
      isFirstLogin: false,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-pink-200 w-full max-w-lg overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header in Fuchsia-Pink */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#9D174D] via-[#BE185D] to-[#831843] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20">
              <UserCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">ข้อมูลผู้ใช้และรูปภาพประจำตัว</h3>
              <p className="text-xs text-pink-100">User Profile & Official Avatar Management</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {currentUser.isFirstLogin && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>การเข้าสู่ระบบครั้งแรก:</strong> เพื่อความปลอดภัย กรุณาตั้งค่ารหัสผ่านใหม่ของท่าน
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">
              {errorMsg}
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600" /> 
              <span>บันทึกข้อมูลส่วนตัวและรูปภาพประจำตัวเรียบร้อยแล้ว</span>
            </div>
          )}

          {/* User Photo & Avatar Management (Requirement: เพิ่มรูปภาพประจำตัวได้) */}
          <div className="p-4 bg-gradient-to-br from-pink-50/70 via-rose-50/40 to-slate-50 rounded-2xl border border-pink-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#BE185D]" />
                <span>รูปภาพประจำตัว (Profile Picture)</span>
              </span>
              <span className="text-[10px] text-pink-700 font-medium bg-pink-100 px-2 py-0.5 rounded-full">
                อัปโหลดรูปจริงได้
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl ring-4 ring-white shadow-md overflow-hidden bg-slate-200 border-2 border-pink-300 flex items-center justify-center">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt={currentUser.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#BE185D] to-[#831843] flex items-center justify-center text-white font-bold text-2xl font-heading">
                      {currentUser.firstName.slice(0, 1)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-[#BE185D] hover:bg-[#9D174D] text-white rounded-full shadow-md transition-colors"
                  title="เปลี่ยนรูปภาพ"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload Controls */}
              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white border border-pink-300 hover:bg-pink-50 text-[#9D174D] font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดรูปจากอุปกรณ์</span>
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-lg transition-colors flex items-center gap-1"
                      title="ลบรูปภาพออก"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบรูป</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  รองรับไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 3 MB รูปจะแสดงทันทีในระบบ
                </p>
              </div>
            </div>

            {/* Quick Preset Avatars */}
            <div className="pt-2 border-t border-pink-200/60">
              <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                หรือเลือกจากภาพประจำตัวแนะนำ:
              </span>
              <div className="flex flex-wrap gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset.url)}
                    className={`flex items-center gap-1.5 p-1 rounded-lg border text-[10px] transition-all ${
                      avatar === preset.url
                        ? 'border-[#BE185D] bg-pink-100/90 text-[#831843] font-bold shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-pink-300 text-slate-600'
                    }`}
                  >
                    <img src={preset.url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span>{preset.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Official Position & Department Information (Read-only verified government data) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800">ข้อมูลตำแหน่งทางราชการ</span>
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> ยืนยันตัวตนแล้ว
              </span>
            </div>
            <div className="font-semibold text-slate-900 text-sm">
              {currentUser.prefix}{currentUser.firstName} {currentUser.lastName}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>สังกัด: {currentUser.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400">ตำแหน่ง: </span>
                <span className="font-medium text-slate-800">{currentUser.position}</span>
              </div>
            </div>
          </div>

          {/* Editable Contact Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username) *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#BE185D] outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#BE185D]" />
                  <span>เบอร์โทรศัพท์ติดต่อ *</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#BE185D] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#BE185D]" />
                  <span>อีเมลราชการ</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#BE185D] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Password Change Option */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Key className="w-3.5 h-3.5 text-[#BE185D]" />
              <span>เปลี่ยนรหัสผ่าน (หากไม่ต้องการเปลี่ยนให้เว้นว่างไว้)</span>
            </div>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="รหัสผ่านเดิม"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#BE185D] outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="password"
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#BE185D] outline-none"
                />
                <input
                  type="password"
                  placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#BE185D] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#BE185D] to-[#9D174D] hover:from-[#9D174D] hover:to-[#831843] text-white text-xs font-bold shadow-md transition-all"
            >
              บันทึกข้อมูลและรูปภาพ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
