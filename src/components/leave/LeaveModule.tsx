import React, { useState } from 'react';
import { 
  LeaveQuota, 
  LeaveRequest, 
  User, 
  LeaveType 
} from '../../types';
import { 
  Clock, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Settings2, 
  Check, 
  X, 
  Calendar, 
  UserCheck, 
  AlertTriangle,
  Phone 
} from 'lucide-react';

interface Props {
  quotas: Record<string, LeaveQuota>;
  leaveRequests: LeaveRequest[];
  currentUser: User;
  usersList: User[];
  onAddLeaveRequest: (req: LeaveRequest) => void;
  onUpdateLeaveRequest: (req: LeaveRequest) => void;
  onUpdateQuota: (userId: string, newQuota: LeaveQuota) => void;
  fiscalYear: number;
}

export const LeaveModule: React.FC<Props> = ({
  quotas,
  leaveRequests,
  currentUser,
  usersList,
  onAddLeaveRequest,
  onUpdateLeaveRequest,
  onUpdateQuota,
  fiscalYear,
}) => {
  const [activeTab, setActiveTab] = useState<'my_leave' | 'approval_queue' | 'hr_quotas'>('my_leave');

  // Submit Leave Form
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('vacation');
  const [startDate, setStartDate] = useState('2026-10-19');
  const [endDate, setEndDate] = useState('2026-10-20');
  const [daysCount, setDaysCount] = useState(2);
  const [leaveReason, setLeaveReason] = useState('');
  const [contactPhoneDuringLeave, setContactPhoneDuringLeave] = useState(currentUser.phone || '');

  // Approval Modal State
  const [selectedReqForApproval, setSelectedReqForApproval] = useState<LeaveRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');

  // HR Quota Management Modal
  const [selectedUserForHR, setSelectedUserForHR] = useState<User>(usersList[0] || currentUser);
  const [isHRQuotaModalOpen, setIsHRQuotaModalOpen] = useState(false);
  const [hrVacationTotal, setHrVacationTotal] = useState(10);
  const [hrSickTotal, setHrSickTotal] = useState(30);
  const [hrPersonalTotal, setHrPersonalTotal] = useState(45);

  const isHR = currentUser.role === 'hr_admin' || currentUser.role === 'super_admin' || currentUser.modules.hrManagement;
  const isApprover = currentUser.role === 'dept_head' || currentUser.role === 'executive' || currentUser.role === 'super_admin' || currentUser.modules.leaveReview || currentUser.modules.leaveApprove;

  // Privacy & Visibility enforcement:
  // Current user quota:
  const myQuota = quotas[currentUser.id] || {
    userId: currentUser.id,
    fiscalYear,
    vacation: { total: 10, used: 0, remaining: 10 },
    sick: { total: 30, used: 0, remaining: 30 },
    personal: { total: 45, used: 0, remaining: 45 },
  };

  // Visible requests:
  // If HR or Approver: sees all for management; If normal staff: sees ONLY their own!
  const myRequests = leaveRequests.filter(r => r.userId === currentUser.id);
  const allRequestsForApprover = leaveRequests;

  // Handle Submit Leave Request
  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const reqNo = `LV-${fiscalYear}-00${Math.floor(21 + Math.random() * 50)}`;

    const newReq: LeaveRequest = {
      id: `lv-${Date.now()}`,
      requestNo: reqNo,
      userId: currentUser.id,
      userName: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}`,
      userPosition: currentUser.position,
      userDept: currentUser.departmentName,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason: leaveReason,
      contactPhoneDuringLeave,
      contactPhone: contactPhoneDuringLeave,
      status: 'pending', // IMPORTANT: Pending = Days NOT deducted yet!
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    onAddLeaveRequest(newReq);
    setIsSubmitModalOpen(false);
    setLeaveReason('');
  };

  // Handle Approver Action (Step 1 Head or Step 2 Executive)
  const handleApproveLeave = (approved: boolean) => {
    if (!selectedReqForApproval) return;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (!approved) {
      // Rejected: NEVER deduct quota!
      const rejectedReq: LeaveRequest = {
        ...selectedReqForApproval,
        status: 'rejected',
        executiveReviewer: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName} (${currentUser.position})`,
        executiveComment: approvalComment || 'ไม่อนุมัติเนื่องจากมีภารกิจราชการเร่งด่วน',
        approvedAt: now,
      };
      onUpdateLeaveRequest(rejectedReq);
      setIsApproveModalOpen(false);
      setApprovalComment('');
      return;
    }

    // If Head of Division reviews:
    if (currentUser.role === 'dept_head' && selectedReqForApproval.status === 'pending') {
      const headReviewed: LeaveRequest = {
        ...selectedReqForApproval,
        status: 'head_approved',
        headReviewer: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName} (${currentUser.position})`,
        headComment: approvalComment || 'เห็นควรอนุญาต',
        headApprovedAt: now,
      };
      onUpdateLeaveRequest(headReviewed);
      setIsApproveModalOpen(false);
      setApprovalComment('');
      return;
    }

    // Final Executive Approval: This triggers the STRICT DEDUCTION from leave_quotas!
    const finalApprovedReq: LeaveRequest = {
      ...selectedReqForApproval,
      status: 'approved',
      executiveReviewer: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName} (${currentUser.position})`,
      executiveComment: approvalComment || 'อนุมัติการลาตามระเบียบ',
      approvedAt: now,
    };

    // Calculate Deduction
    const targetUserId = selectedReqForApproval.userId;
    const existingQuota = quotas[targetUserId] || {
      userId: targetUserId,
      fiscalYear,
      vacation: { total: 10, used: 0, remaining: 10 },
      sick: { total: 30, used: 0, remaining: 30 },
      personal: { total: 45, used: 0, remaining: 45 },
    };

    const typeKey = selectedReqForApproval.leaveType as 'vacation' | 'sick' | 'personal';
    if (existingQuota[typeKey]) {
      const updatedTypeQuota = {
        ...existingQuota[typeKey],
        used: existingQuota[typeKey].used + selectedReqForApproval.daysCount,
        remaining: Math.max(0, existingQuota[typeKey].remaining - selectedReqForApproval.daysCount),
      };

      const newFullQuota: LeaveQuota = {
        ...existingQuota,
        [typeKey]: updatedTypeQuota,
      };

      onUpdateQuota(targetUserId, newFullQuota);
    }

    onUpdateLeaveRequest(finalApprovedReq);
    setIsApproveModalOpen(false);
    setApprovalComment('');
  };

  // Handle Save HR Quota
  const handleSaveHRQuota = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = quotas[selectedUserForHR.id];
    const newQuota: LeaveQuota = {
      userId: selectedUserForHR.id,
      fiscalYear,
      vacation: {
        total: hrVacationTotal,
        used: existing?.vacation.used || 0,
        remaining: Math.max(0, hrVacationTotal - (existing?.vacation.used || 0)),
      },
      sick: {
        total: hrSickTotal,
        used: existing?.sick.used || 0,
        remaining: Math.max(0, hrSickTotal - (existing?.sick.used || 0)),
      },
      personal: {
        total: hrPersonalTotal,
        used: existing?.personal.used || 0,
        remaining: Math.max(0, hrPersonalTotal - (existing?.personal.used || 0)),
      },
    };

    onUpdateQuota(selectedUserForHR.id, newQuota);
    setIsHRQuotaModalOpen(false);
    alert(`อัปเดตโควตาวันลาเริ่มต้นประจำปี ${fiscalYear} สำหรับ ${selectedUserForHR.prefix}${selectedUserForHR.firstName} เรียบร้อยแล้ว`);
  };

  const getLeaveTypeLabel = (t: LeaveType) => {
    switch (t) {
      case 'vacation': return 'ลาพักผ่อน';
      case 'sick': return 'ลาป่วย';
      case 'personal': return 'ลากิจส่วนตัว';
      case 'maternity': return 'ลาคลอดบุตร';
      case 'ordination': return 'ลาอุปสมบท';
      default: return t;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              ระบบการลาออนไลน์ (Leave Management System)
            </h2>
            <span className="text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-medium">
              ปีงบประมาณ {fiscalYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ความเป็นส่วนตัวสูง: แสดงโควตาเฉพาะบัญชีของตนเอง และตัดยอดวันลาเมื่อผู้บริหารอนุมัติสิ้นสุดเท่านั้น
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ยื่นใบลาออนไลน์</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl p-1 gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('my_leave')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'my_leave'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ข้อมูลวันลาส่วนตัวของฉัน (My Dashboard)</span>
        </button>

        {isApprover && (
          <button
            onClick={() => setActiveTab('approval_queue')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'approval_queue'
                ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>กล่องข้อเสนออนุมัติใบลา ({allRequestsForApprover.filter(r => r.status !== 'approved' && r.status !== 'rejected').length})</span>
          </button>
        )}

        {isHR && (
          <button
            onClick={() => setActiveTab('hr_quotas')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'hr_quotas'
                ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>ตั้งค่าโควตาเริ่มต้นรายบุคคล (ฝ่ายบุคลากร HR)</span>
          </button>
        )}
      </div>

      {/* TAB 1: PERSONAL LEAVE DASHBOARD (PRIVACY ENFORCED) */}
      {activeTab === 'my_leave' && (
        <div className="space-y-6">
          {/* Privacy Notice Banner */}
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span><strong>การรักษาความปลอดภัย:</strong> ข้อมูลสิทธิ์วันลาและประวัตินี้มองเห็นได้เฉพาะท่านและฝ่ายบุคลากรเท่านั้น</span>
            </div>
            <span className="font-mono text-slate-500">{currentUser.prefix}{currentUser.firstName} {currentUser.lastName}</span>
          </div>

          {/* Quota Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Vacation Leave Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase">ลาพักผ่อน (Annual)</span>
                <span className="text-[11px] font-mono text-slate-400">สิทธิ์ {myQuota.vacation.total} วัน</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-blue-950 tabular-nums">{myQuota.vacation.remaining}</span>
                <span className="text-xs text-slate-500">วันคงเหลือ</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>ใช้ไปแล้ว: <strong className="text-slate-700 font-mono">{myQuota.vacation.used}</strong> วัน</span>
                <span className="text-[10px] text-blue-700">สะสมได้ตามระเบียบ</span>
              </div>
            </div>

            {/* Sick Leave Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase">ลาป่วย (Sick)</span>
                <span className="text-[11px] font-mono text-slate-400">สิทธิ์ {myQuota.sick.total} วัน</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-amber-900 tabular-nums">{myQuota.sick.remaining}</span>
                <span className="text-xs text-slate-500">วันคงเหลือ</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>ใช้ไปแล้ว: <strong className="text-slate-700 font-mono">{myQuota.sick.used}</strong> วัน</span>
                <span className="text-[10px] text-amber-700">มีใบรับรองแพทย์</span>
              </div>
            </div>

            {/* Personal Business Leave Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase">ลากิจส่วนตัว (Personal)</span>
                <span className="text-[11px] font-mono text-slate-400">สิทธิ์ {myQuota.personal.total} วัน</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-emerald-950 tabular-nums">{myQuota.personal.remaining}</span>
                <span className="text-xs text-slate-500">วันคงเหลือ</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>ใช้ไปแล้ว: <strong className="text-slate-700 font-mono">{myQuota.personal.used}</strong> วัน</span>
                <span className="text-[10px] text-emerald-700">ตามระเบียบ ก.อบต.</span>
              </div>
            </div>
          </div>

          {/* Deduction Logic Rule Callout */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong>หลักเกณฑ์การตัดยอดวันลา (Deduction Logic):</strong> เมื่อยื่นคำขอลา ระบบจะยัง <u>ไม่หัก</u> วันลาออกจากโควตาคงเหลือ แต่จะคงสถานะว่า <em>"รอดำเนินการ"</em> ยอดวันลาจะถูกคำนวณหักออกก็ต่อเมื่อได้รับการอนุมัติสิ้นสุด (Approved) จากผู้บริหารเท่านั้น หากคำขอถูกปฏิเสธ โควตาวันลาจะไม่ถูกหัก
            </div>
          </div>

          {/* My Leave History Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-900">
              ประวัติการยื่นใบลาของฉัน ({myRequests.length} รายการ)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">เลขที่ใบลา</th>
                    <th className="p-3.5">ประเภทการลา</th>
                    <th className="p-3.5">ช่วงวันที่ลา</th>
                    <th className="p-3.5">จำนวนวัน</th>
                    <th className="p-3.5">เหตุผลการลา</th>
                    <th className="p-3.5">สถานะการอนุมัติ</th>
                    <th className="p-3.5">ผลต่อโควตา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {req.requestNo}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800 whitespace-nowrap">
                        {getLeaveTypeLabel(req.leaveType)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-slate-600">
                        {req.startDate} ถึง {req.endDate}
                      </td>
                      <td className="p-3.5 font-bold font-mono text-slate-900 whitespace-nowrap">
                        {req.daysCount} วัน
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">
                        {req.reason}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'head_approved' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'approved' ? 'อนุมัติแล้ว' :
                           req.status === 'head_approved' ? 'หัวหน้าฝ่ายเห็นชอบ' :
                           req.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ (Pending)'}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {req.status === 'approved' ? (
                          <span className="text-emerald-700 font-bold text-[11px]">หักโควตาแล้ว (-{req.daysCount} วัน)</span>
                        ) : req.status === 'rejected' ? (
                          <span className="text-slate-400 text-[11px]">ไม่ถูกหักยอด (0 วัน)</span>
                        ) : (
                          <span className="text-amber-700 italic text-[11px]">รออนุมัติ (ยังไม่ตัดยอด)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL QUEUE (SUPERVISOR & EXECUTIVE) */}
      {activeTab === 'approval_queue' && isApprover && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs text-slate-600 flex justify-between items-center">
            <span>รายการคำขอลาของเจ้าหน้าที่ทั้งหมดใน อบต. รอการพิจารณา</span>
            <span className="text-slate-400">ขั้นตอน: หัวหน้าฝ่ายเห็นชอบ ➔ ปลัด/นายก อนุมัติขั้นสุดท้าย</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">เลขที่ใบลา</th>
                    <th className="p-3.5">ผู้ขอลา</th>
                    <th className="p-3.5">สังกัดกองงาน</th>
                    <th className="p-3.5">ประเภทการลา</th>
                    <th className="p-3.5">วันที่ลา / จำนวน</th>
                    <th className="p-3.5">สถานะ</th>
                    <th className="p-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allRequestsForApprover.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {req.requestNo}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{req.userName}</div>
                        <div className="text-[10px] text-slate-400">{req.userPosition}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">
                        {req.userDept}
                      </td>
                      <td className="p-3.5 font-medium text-slate-800 whitespace-nowrap">
                        {getLeaveTypeLabel(req.leaveType)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono">
                        {req.startDate} ({req.daysCount} วัน)
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'head_approved' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'approved' ? 'อนุมัติแล้ว' :
                           req.status === 'head_approved' ? 'หัวหน้าเห็นชอบแล้ว' :
                           req.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedReqForApproval(req);
                            setIsApproveModalOpen(true);
                          }}
                          className="px-3 py-1 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-medium"
                        >
                          พิจารณาคำขอ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HR QUOTA MANAGEMENT (HR ADMIN ONLY) */}
      {activeTab === 'hr_quotas' && isHR && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">
                กำหนดโควตาวันลาเริ่มต้นรายบุคคล (ฝ่ายบุคลากร)
              </h3>
              <p className="text-xs text-slate-500">
                กำหนด/แก้ไขจำนวนวันลาที่ได้รับสิทธิ์เริ่มต้น ประจำปีงบประมาณ {fiscalYear}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">เจ้าหน้าที่</th>
                    <th className="p-3.5">กอง / ฝ่าย</th>
                    <th className="p-3.5">โควตาพักผ่อน (คงเหลือ/สิทธิ์)</th>
                    <th className="p-3.5">โควตาลาป่วย (คงเหลือ/สิทธิ์)</th>
                    <th className="p-3.5">โควตาลากิจ (คงเหลือ/สิทธิ์)</th>
                    <th className="p-3.5 text-right">ปรับปรุงโควตา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.filter(u => u.role !== 'citizen').map((usr) => {
                    const q = quotas[usr.id] || {
                      userId: usr.id,
                      fiscalYear,
                      vacation: { total: 10, used: 0, remaining: 10 },
                      sick: { total: 30, used: 0, remaining: 30 },
                      personal: { total: 45, used: 0, remaining: 45 },
                    };

                    return (
                      <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{usr.prefix}{usr.firstName} {usr.lastName}</div>
                          <div className="text-[10px] text-slate-400">{usr.position}</div>
                        </td>
                        <td className="p-3.5 text-slate-600 whitespace-nowrap">
                          {usr.departmentName}
                        </td>
                        <td className="p-3.5 font-mono whitespace-nowrap">
                          <span className="font-bold text-blue-900">{q.vacation.remaining}</span> / {q.vacation.total} วัน
                        </td>
                        <td className="p-3.5 font-mono whitespace-nowrap">
                          <span className="font-bold text-amber-900">{q.sick.remaining}</span> / {q.sick.total} วัน
                        </td>
                        <td className="p-3.5 font-mono whitespace-nowrap">
                          <span className="font-bold text-emerald-900">{q.personal.remaining}</span> / {q.personal.total} วัน
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedUserForHR(usr);
                              setHrVacationTotal(q.vacation.total);
                              setHrSickTotal(q.sick.total);
                              setHrPersonalTotal(q.personal.total);
                              setIsHRQuotaModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 font-medium"
                          >
                            แก้ไขโควตา
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SUBMIT LEAVE REQUEST */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm font-heading">แบบฟอร์มยื่นใบลาออนไลน์</h3>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-100 rounded text-slate-700">
                ผู้ยื่นคำขอ: <strong>{currentUser.prefix}{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.position})
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ประเภทการลา *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-semibold text-slate-900"
                >
                  <option value="vacation">ลาพักผ่อน (คงเหลือ {myQuota.vacation.remaining} วัน)</option>
                  <option value="sick">ลาป่วย (คงเหลือ {myQuota.sick.remaining} วัน)</option>
                  <option value="personal">ลากิจส่วนตัว (คงเหลือ {myQuota.personal.remaining} วัน)</option>
                  <option value="maternity">ลาคลอดบุตร</option>
                  <option value="ordination">ลาอุปสมบท</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตั้งแต่วันที่ *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ถึงวันที่ *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนวันลา *</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={daysCount}
                    onChange={(e) => setDaysCount(parseFloat(e.target.value) || 1)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none font-mono font-bold text-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เหตุผลความจำเป็นในการลา *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="ระบุเหตุผล เช่น พักผ่อนประจำปี หรือ ไปพบแพทย์ตามนัด..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ระหว่างลาสามารถติดต่อได้ที่เบอร์ *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="เช่น 081-456-7890"
                    value={contactPhoneDuringLeave}
                    onChange={(e) => setContactPhoneDuringLeave(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none font-mono text-sm focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                ℹ️ คำขอนี้จะยัง <strong>ไม่ตัดโควตาวันลา</strong> ในทันที จนกว่าจะได้รับการอนุมัติเสร็จสิ้นจากผู้บริหาร
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"
                >
                  ส่งใบลาเสนอผู้บังคับบัญชา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPROVAL PANEL */}
      {isApproveModalOpen && selectedReqForApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm font-heading">พิจารณาใบลา ({selectedReqForApproval.requestNo})</h3>
                <p className="text-[10px] text-blue-200">{selectedReqForApproval.userName}</p>
              </div>
              <button onClick={() => setIsApproveModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div>ผู้ขอลา: <strong>{selectedReqForApproval.userName}</strong> ({selectedReqForApproval.userDept})</div>
                <div>ประเภท: <strong>{getLeaveTypeLabel(selectedReqForApproval.leaveType)}</strong> จำนวน: <strong>{selectedReqForApproval.daysCount} วัน</strong></div>
                <div>ช่วงวันที่: <span className="font-mono">{selectedReqForApproval.startDate} ถึง {selectedReqForApproval.endDate}</span></div>
                <div>เหตุผล: <em>"{selectedReqForApproval.reason}"</em></div>
                <div className="text-emerald-800 font-medium">ระหว่างลาติดต่อได้ที่เบอร์: <span className="font-mono font-bold">{selectedReqForApproval.contactPhoneDuringLeave || selectedReqForApproval.contactPhone || '-'}</span></div>
              </div>

              {selectedReqForApproval.headReviewer && (
                <div className="p-2.5 bg-blue-50 rounded border border-blue-200 text-blue-900">
                  <div className="font-bold">ความเห็นหัวหน้าฝ่าย:</div>
                  <div>{selectedReqForApproval.headReviewer}: "{selectedReqForApproval.headComment}"</div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ความเห็นผู้บังคับบัญชา / ผู้บริหาร</label>
                <textarea
                  rows={2}
                  placeholder="ระบุความเห็น..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px]">
                ⚡ <strong>หมายเหตุระบบ:</strong> หากท่านกด "อนุมัติ" ในฐานะผู้บริหาร ระบบจะทำการตัด {selectedReqForApproval.daysCount} วัน ออกจากโควตาคงเหลือของเจ้าหน้าที่ท่านนี้ทันที
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleApproveLeave(false)}
                  className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold"
                >
                  ไม่อนุมัติ (ไม่หักวันลา)
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveLeave(true)}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm"
                >
                  อนุมัติการลา (ตัดยอดวันลา)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: HR INITIAL QUOTA CONFIG */}
      {isHRQuotaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm font-heading">กำหนดโควตาวันลาเริ่มต้น ({selectedUserForHR.firstName})</h3>
              </div>
              <button onClick={() => setIsHRQuotaModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHRQuota} className="p-5 space-y-4 text-xs">
              <div className="p-2.5 bg-slate-100 rounded text-slate-700">
                เจ้าหน้าที่: <strong>{selectedUserForHR.prefix}{selectedUserForHR.firstName} {selectedUserForHR.lastName}</strong> ({selectedUserForHR.departmentName})
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">โควตาลาพักผ่อนเริ่มต้น (วัน) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={hrVacationTotal}
                  onChange={(e) => setHrVacationTotal(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">โควตาลาป่วยเริ่มต้น (วัน) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={hrSickTotal}
                  onChange={(e) => setHrSickTotal(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">โควตาลากิจเริ่มต้น (วัน) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={hrPersonalTotal}
                  onChange={(e) => setHrPersonalTotal(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsHRQuotaModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"
                >
                  บันทึกโควตาเริ่มต้น
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
