/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  EDocument, 
  RepairRequest, 
  PermitType, 
  PermitRequest, 
  LeaveQuota, 
  LeaveRequest, 
  DutyOfficer, 
  ActivityEvent, 
  SiteSettings 
} from './types';
import { 
  DEPARTMENTS, 
  INITIAL_USERS, 
  INITIAL_DOCUMENTS, 
  INITIAL_REPAIRS, 
  INITIAL_PERMIT_TYPES, 
  INITIAL_PERMIT_REQUESTS, 
  INITIAL_LEAVE_QUOTAS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_DUTY_ROSTER, 
  INITIAL_ACTIVITIES, 
  INITIAL_SITE_SETTINGS 
} from './data/mockData';

import { Header } from './components/Header';
import { SchemaBlueprintModal } from './components/SchemaBlueprintModal';
import { UserProfileModal } from './components/UserProfileModal';
import { LoginModal } from './components/LoginModal';
import { PublicPortal } from './components/public/PublicPortal';
import { EDocModule } from './components/edoc/EDocModule';
import { RepairModule } from './components/repair/RepairModule';
import { PermitModule } from './components/permit/PermitModule';
import { LeaveModule } from './components/leave/LeaveModule';
import { CalendarModule } from './components/calendar/CalendarModule';
import { AdminModule } from './components/admin/AdminModule';

import { 
  FileText, 
  Wrench, 
  FileCheck, 
  Clock, 
  Calendar as CalendarIcon, 
  ShieldAlert, 
  ArrowRight, 
  Phone, 
  Building2, 
  UserCheck,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  // Portal & Navigation State
  const [portalMode, setPortalMode] = useState<'public' | 'intranet'>('public');
  const [activeIntranetTab, setActiveIntranetTab] = useState<string>('dashboard');

  // Core Data State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // default staff
  const [documents, setDocuments] = useState<EDocument[]>(INITIAL_DOCUMENTS);
  const [repairs, setRepairs] = useState<RepairRequest[]>(INITIAL_REPAIRS);
  const [permitTypes, setPermitTypes] = useState<PermitType[]>(INITIAL_PERMIT_TYPES);
  const [permitRequests, setPermitRequests] = useState<PermitRequest[]>(INITIAL_PERMIT_REQUESTS);
  const [quotas, setQuotas] = useState<Record<string, LeaveQuota>>(INITIAL_LEAVE_QUOTAS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [dutyRoster, setDutyRoster] = useState<DutyOfficer[]>(INITIAL_DUTY_ROSTER);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);

  // Modals
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showFullCalendarOnDashboard, setShowFullCalendarOnDashboard] = useState(false);

  // Authentication Handlers
  const handleLogout = () => {
    const citizen = users.find(u => u.role === 'citizen') || INITIAL_USERS.find(u => u.role === 'citizen') || {
      id: 'usr_citizen',
      username: 'citizen',
      prefix: 'นาง',
      firstName: 'สมศรี',
      lastName: 'มีสุข',
      position: 'ประชาชนในเขต อบต.',
      departmentId: 'dept-public',
      departmentName: 'ประชาชนทั่วไป',
      role: 'citizen',
      mustChangePassword: false,
      modules: {
        centralRegistry: false,
        repairDispatch: false,
        permitReview: false,
        permitApprove: false,
        hrManagement: false,
        leaveReview: false,
        leaveApprove: false,
        calendarManage: false,
        cmsAdmin: false,
        auditLogView: false,
      },
    };
    setCurrentUser(citizen as User);
    setPortalMode('public');
    setActiveIntranetTab('dashboard');
  };

  // ค้นหาฟังก์ชันล็อกอินเดิม แล้วปรับเนื้อหาด้านในให้เป็นแบบนี้:
const handleLogin = async (username, password) => {
  try {
    // ยิงข้อมูลไปที่ระบบหลังบ้าน Cloudflareที่เราสร้างไว้
    const response = await fetch('/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("เข้าสู่ระบบสำเร็จ");
      // โค้ดเดิมที่พาเปลี่ยนหน้า หรือเซ็ตสถานะล็อกอิน เช่น setIsLoggedIn(true)
    } else {
      alert(data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อระบบหลังบ้าน");
  }
};

  };

  // Handlers
  const handleAddDocument = (newDoc: EDocument) => setDocuments([newDoc, ...documents]);
  const handleUpdateDocument = (upDoc: EDocument) => setDocuments(documents.map(d => d.id === upDoc.id ? upDoc : d));

  const handleAddRepair = (newRep: RepairRequest) => setRepairs([newRep, ...repairs]);
  const handleUpdateRepair = (upRep: RepairRequest) => setRepairs(repairs.map(r => r.id === upRep.id ? upRep : r));

  const handleAddPermitRequest = (newP: PermitRequest) => setPermitRequests([newP, ...permitRequests]);
  const handleUpdatePermitRequest = (upP: PermitRequest) => setPermitRequests(permitRequests.map(p => p.id === upP.id ? upP : p));
  const handleAddPermitType = (newPt: PermitType) => setPermitTypes([newPt, ...permitTypes]);

  const handleAddLeaveRequest = (newLv: LeaveRequest) => setLeaveRequests([newLv, ...leaveRequests]);
  const handleUpdateLeaveRequest = (upLv: LeaveRequest) => setLeaveRequests(leaveRequests.map(l => l.id === upLv.id ? upLv : l));
  const handleUpdateQuota = (userId: string, newQ: LeaveQuota) => setQuotas({ ...quotas, [userId]: newQ });

  const handleAddDuty = (newD: DutyOfficer) => setDutyRoster([newD, ...dutyRoster]);
  const handleAddActivity = (newA: ActivityEvent) => setActivities([newA, ...activities]);

  const handleAddUser = (newU: User) => setUsers([...users, newU]);
  const handleUpdateUser = (upU: User) => {
    setUsers(users.map(u => u.id === upU.id ? upU : u));
    if (currentUser.id === upU.id) setCurrentUser(upU);
  };
  const handleDeleteUser = (id: string) => setUsers(users.filter(u => u.id !== id));

  // Current user's leave quota
  const myQuota = quotas[currentUser.id] || {
    userId: currentUser.id,
    fiscalYear: siteSettings.fiscalYear,
    vacation: { total: 10, used: 0, remaining: 10 },
    sick: { total: 30, used: 0, remaining: 30 },
    personal: { total: 45, used: 0, remaining: 45 },
  };

  // Pending counts
  const pendingRepairs = repairs.filter(r => r.status === 'pending' || r.status === 'assigned').length;
  const pendingPermits = permitRequests.filter(p => p.status === 'submitted' || p.status === 'step1_reviewed').length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending' || l.status === 'head_approved').length;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-['Sarabun',sans-serif]">
      {/* Top Main Government Header */}
      <Header
        portalMode={portalMode}
        onTogglePortal={(mode) => setPortalMode(mode)}
        currentUser={currentUser}
        usersList={users}
        onSelectUser={(u) => setCurrentUser(u)}
        onOpenBlueprint={() => setIsBlueprintOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        siteSettings={siteSettings}
        activeIntranetTab={activeIntranetTab}
        onChangeIntranetTab={(t) => setActiveIntranetTab(t)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* PUBLIC CITIZEN PORTAL */}
        {portalMode === 'public' ? (
          <PublicPortal
            repairs={repairs}
            permitTypes={permitTypes}
            permitRequests={permitRequests}
            onAddRepair={handleAddRepair}
            onAddPermitRequest={handleAddPermitRequest}
            siteSettings={siteSettings}
            onSwitchToIntranet={() => {
              setPortalMode('intranet');
              setActiveIntranetTab('dashboard');
            }}
          />
        ) : (
          /* INTRANET STAFF PORTAL */
          <div className="space-y-6">
            {/* Active User Persona Callout */}
            <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-600">
                  เข้าสู่ระบบในฐานะ: <strong className="text-slate-900">{currentUser.prefix}{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.position})
                </span>
                <span className="text-blue-900 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {currentUser.departmentName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span>💡 คุณสามารถคลิกที่ชื่อผู้ใช้ด้านบนขวาเพื่อ <strong>สลับบทบาท (Role Switcher)</strong> ทดสอบสิทธิ์อื่นๆ ได้ทันที</span>
              </div>
            </div>

            {/* TAB: DASHBOARD (HOME) */}
            {activeIntranetTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div 
                    onClick={() => setActiveIntranetTab('edoc')}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>หนังสือราชการในระบบ</span>
                      <FileText className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-blue-950 mt-1 tabular-nums">
                      {documents.length} ฉบับ
                    </div>
                    <div className="text-[11px] text-blue-700 mt-2 flex items-center gap-1">
                      <span>เปิดระบบสารบรรณ</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveIntranetTab('repair')}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>งานแจ้งซ่อมรอช่างปิดงาน</span>
                      <Wrench className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-amber-900 mt-1 tabular-nums">
                      {pendingRepairs} รายการ
                    </div>
                    <div className="text-[11px] text-amber-700 mt-2 flex items-center gap-1">
                      <span>ตรวจสอบงานช่าง & Line</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveIntranetTab('permit')}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>คำขอใบอนุญาตรออนุมัติ</span>
                      <FileCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-950 mt-1 tabular-nums">
                      {pendingPermits} คำขอ
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-2 flex items-center gap-1">
                      <span>พิจารณา 2-Step Approval</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveIntranetTab('leave')}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-400 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>สิทธิ์วันลาพักผ่อนคงเหลือฉัน</span>
                      <Clock className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-purple-950 mt-1 tabular-nums">
                      {myQuota.vacation.remaining} / {myQuota.vacation.total} วัน
                    </div>
                    <div className="text-[11px] text-purple-700 mt-2 flex items-center gap-1">
                      <span>ยื่นใบลา / ดูประวัติส่วนตัว</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Compact Agenda & Today's Duty Widget (Sleek, responsive, mobile-friendly) */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 font-heading flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-800" />
                        วาระงานสำคัญและเวรยามวันนี้ (Daily Agenda & Duty Roster)
                      </h3>
                      <p className="text-xs text-slate-500">
                        สรุปภารกิจประจำวันของ อบต. และเจ้าหน้าที่ปฏิบัติการประจำเวร
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowFullCalendarOnDashboard(!showFullCalendarOnDashboard)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium transition-colors cursor-pointer"
                      >
                        {showFullCalendarOnDashboard ? '▲ ย่อปฏิทินรายเดือน' : '▼ ขยายปฏิทินรายเดือน'}
                      </button>
                      <button
                        onClick={() => setActiveIntranetTab('calendar')}
                        className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>เปิดปฏิทินเต็ม</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2-Column Responsive Compact Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Upcoming Agenda & Meetings */}
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5 font-heading">
                          <Clock className="w-4 h-4 text-blue-700" />
                          วาระงานและกิจกรรมสำคัญสัปดาห์นี้
                        </span>
                        <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">
                          {activities.length} รายการ
                        </span>
                      </div>

                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {activities.slice(0, 4).map((act) => (
                          <div 
                            key={act.id} 
                            className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-blue-50/40 transition-colors flex items-start justify-between gap-2.5 text-xs"
                          >
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 truncate">
                                {act.title}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>📍 {act.location}</span>
                                <span>·</span>
                                <span>🏛️ {act.department}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono text-[11px] font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 block">
                                {act.startDate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Today's Duty Officers with Instant Quick Dial */}
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5 font-heading">
                          <Building2 className="w-4 h-4 text-amber-600" />
                          ตารางเวรยามประจำวันและผู้ติดต่อฉุกเฉิน
                        </span>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          ประจำการวันนี้
                        </span>
                      </div>

                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {dutyRoster.slice(0, 3).map((duty) => (
                          <div 
                            key={duty.id} 
                            className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-amber-50/30 transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                                {duty.officerName.slice(0, 1)}
                              </div>
                              <div className="truncate">
                                <div className="font-semibold text-slate-900 truncate">
                                  {duty.officerName}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {duty.shiftLabel} · {duty.department}
                                </div>
                              </div>
                            </div>

                            <a
                              href={`tel:${duty.phone}`}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 shrink-0 transition-colors"
                              title="โทรด่วน"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{duty.phone}</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Full Calendar if user clicks toggle */}
                  {showFullCalendarOnDashboard && (
                    <div className="pt-2 animate-in fade-in">
                      <CalendarModule
                        dutyRoster={dutyRoster}
                        activities={activities}
                        currentUser={currentUser}
                        usersList={users}
                        onAddDuty={handleAddDuty}
                        onAddActivity={handleAddActivity}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: E-DOCUMENT */}
            {activeIntranetTab === 'edoc' && (
              <EDocModule
                documents={documents}
                currentUser={currentUser}
                departments={DEPARTMENTS}
                onAddDocument={handleAddDocument}
                onUpdateDocument={handleUpdateDocument}
                fiscalYear={siteSettings.fiscalYear}
              />
            )}

            {/* TAB: REPAIR */}
            {activeIntranetTab === 'repair' && (
              <RepairModule
                repairs={repairs}
                currentUser={currentUser}
                onUpdateRepair={handleUpdateRepair}
                onAddRepair={handleAddRepair}
                siteSettings={siteSettings}
              />
            )}

            {/* TAB: PERMIT & REQUESTS */}
            {activeIntranetTab === 'permit' && (
              <PermitModule
                permitTypes={permitTypes}
                permitRequests={permitRequests}
                currentUser={currentUser}
                departments={DEPARTMENTS}
                onUpdatePermitRequest={handleUpdatePermitRequest}
                onAddPermitType={handleAddPermitType}
                fiscalYear={siteSettings.fiscalYear}
              />
            )}

            {/* TAB: LEAVE ONLINE */}
            {activeIntranetTab === 'leave' && (
              <LeaveModule
                quotas={quotas}
                leaveRequests={leaveRequests}
                currentUser={currentUser}
                usersList={users}
                onAddLeaveRequest={handleAddLeaveRequest}
                onUpdateLeaveRequest={handleUpdateLeaveRequest}
                onUpdateQuota={handleUpdateQuota}
                fiscalYear={siteSettings.fiscalYear}
              />
            )}

            {/* TAB: CALENDAR */}
            {activeIntranetTab === 'calendar' && (
              <CalendarModule
                dutyRoster={dutyRoster}
                activities={activities}
                currentUser={currentUser}
                usersList={users}
                onAddDuty={handleAddDuty}
                onAddActivity={handleAddActivity}
              />
            )}

            {/* TAB: ADMIN & RBAC */}
            {activeIntranetTab === 'admin' && (
              <AdminModule
                users={users}
                departments={DEPARTMENTS}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                siteSettings={siteSettings}
                onUpdateSettings={setSiteSettings}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>{siteSettings.saoName}</strong> อ.แม่ริม จ.เชียงใหม่ | โทรศัพท์: {siteSettings.phone}
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsBlueprintOpen(true)}
              className="text-blue-700 hover:underline font-medium"
            >
              ดูสถาปัตยกรรม & โครงสร้าง SQL (17 Tables)
            </button>
            <span>·</span>
            <span>มาตรฐาน พ.ร.บ. การปฏิบัติราชการทางอิเล็กทรอนิกส์ พ.ศ. 2565</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SchemaBlueprintModal
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        usersList={users}
        onSelectUser={setCurrentUser}
        onSuccessLogin={handleLoginSuccess}
      />
    </div>
  );
}
