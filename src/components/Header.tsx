import React, { useState } from 'react';
import { User, SiteSettings, RoleCode } from '../types';
import { SaoEmblem } from './SaoEmblem';
import { 
  Building2, 
  Database, 
  UserCheck, 
  ChevronDown, 
  ExternalLink,
  ShieldAlert,
  Menu,
  X,
  LogIn,
  LogOut,
  Smartphone,
  Globe,
  Cloud,
  HelpCircle,
  Sparkles,
  MapPin
} from 'lucide-react';

interface Props {
  portalMode: 'public' | 'intranet';
  onTogglePortal: (mode: 'public' | 'intranet') => void;
  currentUser: User;
  usersList: User[];
  onSelectUser: (user: User) => void;
  onOpenBlueprint: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenCloudflareGuide?: () => void;
  siteSettings: SiteSettings;
  activeIntranetTab: string;
  onChangeIntranetTab: (tab: string) => void;
}

export const Header: React.FC<Props> = ({
  portalMode,
  onTogglePortal,
  currentUser,
  usersList,
  onSelectUser,
  onOpenBlueprint,
  onOpenProfile,
  onOpenLogin,
  onLogout,
  onOpenCloudflareGuide,
  siteSettings,
  activeIntranetTab,
  onChangeIntranetTab,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isCitizen = currentUser.role === 'citizen';

  const getRoleLabel = (role: RoleCode) => {
    switch (role) {
      case 'citizen': return 'ประชาชน (Public)';
      case 'staff': return 'เจ้าหน้าที่ทั่วไป';
      case 'central_registry': return 'สารบรรณกลาง (สำนักปลัด)';
      case 'dept_head': return 'ผอ.กอง / หัวหน้าฝ่าย';
      case 'technician': return 'ช่าง / ผู้ซ่อมบำรุง';
      case 'hr_admin': return 'เจ้าหน้าที่งานบุคลากร (HR)';
      case 'executive': return 'ปลัด / นายก อบต.';
      case 'super_admin': return 'ผู้ดูแลระบบ (Super Admin)';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#9D174D] via-[#BE185D] to-[#831843] text-white border-b border-[#BE185D]/60 shadow-lg select-none">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Identity with Official Emblem */}
          <div className="flex items-center gap-3">
            {/* Official SAO Emblem (Requirement: เพิ่มรูป ตรา อบต.) */}
            <SaoEmblem logoUrl={siteSettings.logoUrl} size="md" />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base lg:text-lg tracking-tight font-heading leading-tight truncate max-w-[210px] sm:max-w-none text-white drop-shadow-xs">
                  {siteSettings.saoName}
                </span>
                <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-300/40 px-1.5 py-0.2 rounded-full font-bold shrink-0">
                  พ.ศ. {siteSettings.fiscalYear}
                </span>
                <span className="text-[10px] bg-white/15 text-pink-100 border border-white/20 px-1.5 py-0.2 rounded-full font-medium hidden md:inline-flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-amber-300" />
                  <span>อ.{siteSettings.district || 'โพธิ์ทอง'} จ.{siteSettings.province || 'อ่างทอง'}</span>
                </span>
              </div>
              <p className="text-[11px] text-pink-100/90 hidden md:block">
                ระบบสารสนเทศภายในองค์กรและบริการประชาชนอิเล็กทรอนิกส์ (Smart SAO Portal)
              </p>
            </div>
          </div>

          {/* Desktop Controls (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Cloudflare Deployment Guide Button */}
            {onOpenCloudflareGuide && (
              <button
                onClick={onOpenCloudflareGuide}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-pink-100 hover:text-white text-xs font-semibold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all shadow-xs"
                title="คู่มือการนำระบบขึ้นใช้งานจริงบน Cloudflare Pages แบบละเอียด"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-300" />
                <span>วิธีขึ้น Cloudflare</span>
              </button>
            )}

            {/* System Blueprint Button */}
            <button
              onClick={onOpenBlueprint}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-pink-100 hover:text-white text-xs font-semibold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all shadow-xs"
              title="ดูโครงสร้างฐานข้อมูลและผังระบบงาน"
            >
              <Database className="w-3.5 h-3.5 text-amber-300" />
              <span>พิมพ์เขียวระบบ</span>
            </button>

            {/* Portal Switcher Tabs */}
            <div className="flex p-0.5 bg-black/25 rounded-xl border border-white/15">
              <button
                onClick={() => onTogglePortal('public')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  portalMode === 'public'
                    ? 'bg-white text-[#9D174D] shadow-xs'
                    : 'text-pink-100 hover:text-white'
                }`}
              >
                บริการประชาชน (Public)
              </button>
              <button
                onClick={() => {
                  if (isCitizen) {
                    onOpenLogin();
                  } else {
                    onTogglePortal('intranet');
                  }
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  portalMode === 'intranet'
                    ? 'bg-white text-[#9D174D] shadow-xs'
                    : 'text-pink-100 hover:text-white'
                }`}
              >
                ระบบภายใน (Intranet)
              </button>
            </div>

            {/* Login / Logout & Role Dropdown */}
            {isCitizen ? (
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบเจ้าหน้าที่</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* Role Switcher Menu with User Avatar */}
                <div className="relative">
                  <button
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-xs text-white transition-all shadow-xs"
                  >
                    {/* User Avatar Image (Requirement: เพิ่มรูปภาพประจำตัวได้) */}
                    <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/60 bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        currentUser.firstName.slice(0, 1)
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold leading-none">{currentUser.prefix}{currentUser.firstName} {currentUser.lastName}</div>
                      <div className="text-[10px] text-pink-200 leading-none mt-0.5">{getRoleLabel(currentUser.role)}</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-pink-200" />
                  </button>

                  {isRoleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-2xl border border-pink-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>สลับสิทธิ์เจ้าหน้าที่ (Quick Switch)</span>
                        <span className="text-[10px] text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded-full font-medium">ทดสอบระบบ</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1">
                        {usersList.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSelectUser(user);
                              setIsRoleDropdownOpen(false);
                              if (user.role === 'citizen') {
                                onTogglePortal('public');
                              } else {
                                onTogglePortal('intranet');
                              }
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-pink-50/60 transition-colors ${
                              currentUser.id === user.id ? 'bg-pink-50 font-semibold text-[#9D174D]' : 'text-slate-700'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100 shrink-0 flex items-center justify-center font-bold text-xs">
                              {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[#9D174D]">{user.firstName.slice(0, 1)}</span>
                              )}
                            </div>
                            <div className="flex-1 truncate">
                              <div className="truncate">{user.prefix}{user.firstName} {user.lastName}</div>
                              <div className="text-[10px] text-slate-400 truncate">{getRoleLabel(user.role)} · {user.departmentName}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 px-2 mt-1">
                        <button
                          onClick={() => {
                            setIsRoleDropdownOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full py-1.5 text-center text-xs text-[#9D174D] hover:text-[#831843] font-bold hover:bg-pink-50 rounded-lg transition-colors"
                        >
                          แก้ไขโปรไฟล์ & รูปภาพประจำตัว
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-xl bg-black/25 hover:bg-red-800 text-pink-100 hover:text-white border border-white/15 text-xs flex items-center gap-1 transition-all"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-300" />
                  <span className="text-[11px] font-medium hidden xl:inline">ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Action Controls Header Bar */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            {/* Direct Login or Logout Button for Mobile */}
            {isCitizen ? (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenProfile}
                  className="px-2 py-1 bg-white/10 text-pink-100 border border-white/20 rounded-xl text-[11px] flex items-center gap-1.5"
                  title="แก้ไขข้อมูลผู้ใช้"
                >
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-amber-400 shrink-0">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[8px] font-bold text-slate-900">{currentUser.firstName.slice(0, 1)}</span>
                    )}
                  </div>
                  <span className="truncate max-w-[65px] font-medium">{currentUser.firstName}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="px-2 py-1.5 bg-black/30 hover:bg-red-900 text-pink-100 rounded-xl text-xs flex items-center gap-1 border border-white/15"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-300" />
                  <span className="text-[11px] font-medium">ออก</span>
                </button>
              </div>
            )}

            {/* Mobile Cloudflare Guide Button */}
            {onOpenCloudflareGuide && (
              <button
                onClick={onOpenCloudflareGuide}
                className="p-2 bg-white/10 text-amber-300 rounded-xl text-xs border border-white/20"
                title="วิธีขึ้น Cloudflare"
              >
                <Cloud className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-pink-100 hover:text-white rounded-xl hover:bg-white/10 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Intranet Navigation Sub-Bar (Desktop & Mobile Touch Bar) */}
      {portalMode === 'intranet' && (
        <div className="bg-[#831843] border-t border-[#9D174D]/80 overflow-x-auto scrollbar-none py-1">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 text-xs font-medium whitespace-nowrap min-w-max">
              <button
                onClick={() => onChangeIntranetTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeIntranetTab === 'dashboard'
                    ? 'bg-white text-[#9D174D] font-bold shadow-xs'
                    : 'text-pink-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>📊 หน้าหลัก</span>
              </button>
              <button
                onClick={() => onChangeIntranetTab('edoc')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeIntranetTab === 'edoc'
                    ? 'bg-white text-[#9D174D] font-bold shadow-xs'
                    : 'text-pink-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>📄 สารบรรณ</span>
                {currentUser.modules.centralRegistry && (
                  <span className="text-[9px] bg-amber-400 text-slate-900 px-1 rounded font-bold">กลาง</span>
                )}
              </button>
              <button
                onClick={() => onChangeIntranetTab('repair')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeIntranetTab === 'repair'
                    ? 'bg-white text-[#9D174D] font-bold shadow-xs'
                    : 'text-pink-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🔧 แจ้งซ่อม</span>
                {currentUser.modules.repairDispatch && (
                  <span className="text-[9px] bg-amber-400 text-slate-900 px-1 rounded font-bold">ช่าง</span>
                )}
              </button>
              <button
                onClick={() => onChangeIntranetTab('permit')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeIntranetTab === 'permit'
                    ? 'bg-white text-[#9D174D] font-bold shadow-xs'
                    : 'text-pink-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>📝 ขออนุญาต</span>
                {(currentUser.modules.permitReview || currentUser.modules.permitApprove) && (
                  <span className="text-[9px] bg-emerald-400 text-slate-900 px-1 rounded font-bold">อนุมัติ</span>
                )}
              </button>
              <button
                onClick={() => onChangeIntranetTab('leave')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeIntranetTab === 'leave'
                    ? 'bg-white text-[#9D174D] font-bold shadow-xs'
                    : 'text-pink-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🏖️ ระบบลา</span>
                {currentUser.modules.hrManagement && (
                  <span className="text-[9px] bg-amber-300 text-slate-900 px-1 rounded font-bold">HR</span>
                )}
              </button>
              <button
                onClick={() => onChangeIntranetTab('calendar')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeIntranetTab === 'calendar'
                    ? 'bg-white text-[#9D174D] font-bold shadow-xs'
                    : 'text-pink-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🗓️ ปฏิทิน/เวรยาม</span>
                <span className="text-[9px] bg-amber-400/90 text-slate-900 px-1 rounded font-bold">2 คน</span>
              </button>
              {(currentUser.role === 'super_admin' || currentUser.role === 'executive') && (
                <button
                  onClick={() => onChangeIntranetTab('admin')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeIntranetTab === 'admin'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-amber-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>จัดการสิทธิ์ & CMS</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Drawer (Responsive & Touch-Friendly in Fuchsia Tone) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#831843] border-t border-[#9D174D] p-4 space-y-4 animate-in slide-in-from-top-3">
          {/* User Status / Login Banner with Avatar */}
          <div className="p-3.5 bg-black/25 rounded-2xl border border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/50 bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  currentUser.firstName.slice(0, 1)
                )}
              </div>
              <div>
                <div className="font-bold text-xs text-white">
                  {currentUser.prefix}{currentUser.firstName} {currentUser.lastName}
                </div>
                <div className="text-[10px] text-pink-200">
                  {getRoleLabel(currentUser.role)} · {currentUser.departmentName}
                </div>
              </div>
            </div>

            {isCitizen ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                เข้าสู่ระบบ
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="px-2.5 py-1.5 bg-red-900/80 text-rose-100 hover:text-white border border-red-700/60 rounded-xl text-xs flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>ออกจากระบบ</span>
              </button>
            )}
          </div>

          {/* Portal Switcher Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                onTogglePortal('public');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                portalMode === 'public'
                  ? 'bg-white text-[#9D174D] shadow-sm'
                  : 'bg-black/20 text-pink-100'
              }`}
            >
              บริการประชาชน (Public)
            </button>
            <button
              onClick={() => {
                if (isCitizen) {
                  onOpenLogin();
                } else {
                  onTogglePortal('intranet');
                }
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                portalMode === 'intranet'
                  ? 'bg-white text-[#9D174D] shadow-sm'
                  : 'bg-black/20 text-pink-100'
              }`}
            >
              ระบบภายใน (Intranet)
            </button>
          </div>

          {/* Intranet Navigation Links for Mobile */}
          {portalMode === 'intranet' && (
            <div className="space-y-1 pt-2 border-t border-white/10 text-xs">
              <div className="text-[11px] font-semibold text-pink-200 uppercase px-1 mb-1">
                เมนูระบบภายใน:
              </div>
              {[
                { id: 'dashboard', label: '1. หน้าหลัก & วาระงาน (Dashboard)' },
                { id: 'edoc', label: '2. ระบบสารบรรณ (E-Document)' },
                { id: 'repair', label: '3. ระบบแจ้งซ่อมแซม (Repair)' },
                { id: 'permit', label: '4. ระบบใบอนุญาต (E-Permit)' },
                { id: 'leave', label: '5. ระบบการลาออนไลน์ (Leave)' },
                { id: 'calendar', label: '6. ปฏิทินปฏิบัติงาน & เวรยาม (Calendar)' },
                ...(currentUser.role === 'super_admin' || currentUser.role === 'executive'
                  ? [{ id: 'admin', label: '7. จัดการผู้ใช้, ตรา อบต. & CMS' }]
                  : []),
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeIntranetTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeIntranetTab === item.id
                      ? 'bg-white text-[#9D174D] font-bold'
                      : 'text-pink-100 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Profile & Cloudflare Guide buttons for Mobile */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="w-full py-2 bg-white/10 text-pink-100 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>แก้ไขข้อมูลส่วนตัว & เปลี่ยนรูปประจำตัว</span>
            </button>
            {onOpenCloudflareGuide && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCloudflareGuide();
                }}
                className="w-full py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>เปิดดูคู่มือขึ้น Cloudflare Pages (ฟรี)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
