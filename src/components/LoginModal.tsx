import React, { useState } from 'react';
import { User, RoleCode } from '../types';
import { 
  LogIn, 
  X, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  User as UserIcon, 
  CheckCircle2, 
  Sparkles,
  Building2,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usersList: User[];
  onSelectUser: (user: User) => void;
  onSuccessLogin: (user: User) => void;
}

export const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  usersList,
  onSelectUser,
  onSuccessLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const getRoleLabel = (role: RoleCode) => {
    switch (role) {
      case 'citizen': return 'ประชาชน (Citizen)';
      case 'staff': return 'เจ้าหน้าที่ทั่วไป (Staff)';
      case 'central_registry': return 'สารบรรณกลาง (สำนักปลัด)';
      case 'dept_head': return 'ผอ.กอง / หัวหน้าฝ่าย';
      case 'technician': return 'ช่าง / ผู้ซ่อมบำรุง';
      case 'hr_admin': return 'งานบุคลากร (HR Admin)';
      case 'executive': return 'ปลัด / นายก อบต.';
      case 'super_admin': return 'ผู้ดูแลระบบ (Super Admin)';
      default: return role;
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const foundUser = usersList.find(
      u => u.username.toLowerCase() === trimmedUser
    );

    if (foundUser) {
      onSelectUser(foundUser);
      onSuccessLogin(foundUser);
      onClose();
    } else {
      setErrorMsg('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้ หรือเลือกบัญชีทดสอบด้านล่าง');
    }
  };

  const handleQuickSelect = (user: User) => {
    onSelectUser(user);
    onSuccessLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-heading">
                เข้าสู่ระบบ (Sign In)
              </h3>
              <p className="text-[11px] text-blue-200">
                ระบบสารสนเทศภายใน อบต. & บริการประชาชน
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="เช่น admin, central_admin, technician, hr_admin..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="รหัสผ่านเข้าใช้งาน..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบด้วยชื่อผู้ใช้</span>
            </button>
          </form>

          {/* Quick Demo Role Switcher Section (Great for test & evaluation) */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                เลือกสิทธิ์ทดสอบทันที (Quick Role Select)
              </span>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                แตะเพื่อเข้าสู่ระบบทันที
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {usersList.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickSelect(user)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition-all text-left flex items-center gap-2.5 group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    user.role === 'super_admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'executive' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'central_registry' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'technician' ? 'bg-amber-100 text-amber-700' :
                    user.role === 'hr_admin' ? 'bg-indigo-100 text-indigo-700' :
                    user.role === 'citizen' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {user.firstName.slice(0, 1)}
                  </div>
                  <div className="truncate flex-1">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-900 truncate">
                      {user.prefix}{user.firstName} {user.lastName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {getRoleLabel(user.role)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 shrink-0">
          <span>ความปลอดภัย: เข้ารหัสระดับองค์กร</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
