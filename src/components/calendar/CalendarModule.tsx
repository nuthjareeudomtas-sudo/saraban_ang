import React, { useState } from 'react';
import { 
  DutyOfficer, 
  ActivityEvent, 
  User 
} from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Phone, 
  ShieldAlert, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  UserCheck, 
  X, 
  Sparkles,
  Users,
  Eye,
  Info,
  CalendarDays,
  Building2,
  FileText
} from 'lucide-react';

interface Props {
  dutyRoster: DutyOfficer[];
  activities: ActivityEvent[];
  currentUser: User;
  usersList: User[];
  onAddDuty: (duty: DutyOfficer) => void;
  onAddActivity: (act: ActivityEvent) => void;
}

export const CalendarModule: React.FC<Props> = ({
  dutyRoster,
  activities,
  currentUser,
  usersList,
  onAddDuty,
  onAddActivity,
}) => {
  // Calendar Navigation (Oct 2026 default based on prompt local time)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed, 9 = October

  const [isAddDutyModalOpen, setIsAddDutyModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [selectedDayDetailDate, setSelectedDayDetailDate] = useState<string | null>(null);

  // New Duty State (Requirement: ระบุเป็นเวลา & เวรละ 2 คน ทั้งวันธรรมดาและวันหยุด)
  const [dutyDate, setDutyDate] = useState('2026-10-15');
  const [dutyShiftType, setDutyShiftType] = useState<'day_guard' | 'night_guard' | 'emergency_standby' | 'complaint_receiver'>('day_guard');
  const [dutyTimeRange, setDutyTimeRange] = useState('08:30 - 16:30 น.');
  
  // Officer 1 (ผู้ปฏิบัติหน้าที่คนที่ 1)
  const [dutyOfficerId, setDutyOfficerId] = useState(usersList[0]?.id || '');
  const [dutyContactPhone, setDutyContactPhone] = useState(usersList[0]?.phone || '');
  
  // Officer 2 (ผู้ปฏิบัติหน้าที่คนที่ 2 - เวรละ 2 คน)
  const [secondOfficerId, setSecondOfficerId] = useState(usersList[1]?.id || '');
  const [secondOfficerPhone, setSecondOfficerPhone] = useState(usersList[1]?.phone || '');
  
  const [dutyBackupPhone, setDutyBackupPhone] = useState('035-691-234');
  const [dutyNotes, setDutyNotes] = useState('');

  // New Activity State
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actType, setActType] = useState<'meeting' | 'community' | 'holiday' | 'training'>('meeting');
  const [actDate, setActDate] = useState('2026-10-16');
  const [actStartTime, setActStartTime] = useState('09:30');
  const [actEndTime, setActEndTime] = useState('16:00');
  const [actLocation, setActLocation] = useState('ห้องประชุมสภา อบต.อ่างแก้ว (ชั้น 2)');

  // Permission Check: Central Registry, HR Admin or Super Admin only can modify duty roster
  const canManageDuty = currentUser.role === 'central_registry' || currentUser.role === 'hr_admin' || currentUser.role === 'super_admin' || currentUser.modules.hrManagement || currentUser.modules.centralRegistry;

  const monthNamesThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle Save Duty (Enforcing 2 officers per duty and explicit time)
  const handleSaveDuty = (e: React.FormEvent) => {
    e.preventDefault();
    const officer1 = usersList.find(u => u.id === dutyOfficerId);
    const officer2 = usersList.find(u => u.id === secondOfficerId);
    if (!officer1) return;

    const shiftLabels = {
      day_guard: 'เวรยามประจำวัน (กลางวัน)',
      night_guard: 'เวรรักษาการณ์ (กลางคืน)',
      emergency_standby: 'เวรเผชิญเหตุฉุกเฉินและสาธารณภัย (24 ชม.)',
      complaint_receiver: 'เวรศูนย์รับเรื่องราวร้องทุกข์',
    };

    const newDuty: DutyOfficer = {
      id: `duty-${Date.now()}`,
      date: dutyDate,
      shiftType: dutyShiftType,
      shiftLabel: shiftLabels[dutyShiftType],
      timeRange: dutyTimeRange,
      officerId: officer1.id,
      officerName: `${officer1.prefix}${officer1.firstName} ${officer1.lastName}`,
      position: officer1.position,
      department: officer1.departmentName,
      phone: dutyContactPhone,
      avatar: officer1.avatar,
      backupPhone: dutyBackupPhone,
      // Officer 2
      secondOfficerId: officer2?.id,
      secondOfficerName: officer2 ? `${officer2.prefix}${officer2.firstName} ${officer2.lastName}` : undefined,
      secondOfficerPosition: officer2?.position,
      secondOfficerDepartment: officer2?.departmentName,
      secondOfficerPhone: secondOfficerPhone,
      secondOfficerAvatar: officer2?.avatar,
      notes: dutyNotes,
    };

    onAddDuty(newDuty);
    setIsAddDutyModalOpen(false);
  };

  // Handle Save Activity
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      title: actTitle,
      description: actDesc,
      type: actType,
      startDate: `${actDate} ${actStartTime}`,
      endDate: `${actDate} ${actEndTime}`,
      location: actLocation,
      department: currentUser.departmentName,
    };

    onAddActivity(newAct);
    setIsAddActivityModalOpen(false);
    setActTitle('');
    setActDesc('');
  };

  // Activities or Duties for Day Modal
  const dayDuties = selectedDayDetailDate ? dutyRoster.filter(d => d.date === selectedDayDetailDate) : [];
  const dayActivities = selectedDayDetailDate ? activities.filter(a => a.startDate.startsWith(selectedDayDetailDate)) : [];

  return (
    <div className="space-y-6">
      {/* Title & Controls Bar in Fuchsia-Pink */}
      <div className="bg-white p-5 rounded-2xl border border-pink-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              ปฏิทินวาระงาน & ตารางเวรปฏิบัติหน้าที่ (Calendar & Duty Roster)
            </h2>
            <span className="text-xs bg-pink-100 text-[#9D174D] border border-pink-200 px-2.5 py-0.5 rounded-full font-bold">
              เวรละ 2 คน (วันธรรมดา & วันหยุด)
            </span>
            <span className="text-xs bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> แสดงข้อมูลเมื่อวางเมาส์ (Hover)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ระบุเวลาเข้าเวรชัดเจน มีเจ้าหน้าที่เวรคู่ 2 คนทุกผลัด และเมื่อวางเมาส์เหนือแถบกิจกรรมจะแสดงรายละเอียดวาระงานทันที
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canManageDuty ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddDutyModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ จัดตารางเวร (เวรละ 2 คน)</span>
              </button>
              <button
                onClick={() => setIsAddActivityModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-[#BE185D] to-[#9D174D] hover:from-[#9D174D] hover:to-[#831843] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มกิจกรรม/วาระงาน</span>
              </button>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-pink-50 text-pink-700 text-xs rounded-xl border border-pink-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#BE185D]" />
              <span>โหมดดูข้อมูล: สิทธิ์จัดเวรเฉพาะสารบรรณกลาง/HR</span>
            </div>
          )}
        </div>
      </div>

      {/* Month Navigator Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#BE185D] flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              เดือน{monthNamesThai[currentMonth]} พ.ศ. {currentYear + 543}
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              ({currentYear}-{String(currentMonth + 1).padStart(2, '0')})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-pink-50 hover:text-[#BE185D] transition-colors"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(9);
            }}
            className="px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-bold text-[#9D174D] hover:bg-pink-50 transition-colors"
          >
            วันนี้ (ต.ค. 2569)
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-pink-50 hover:text-[#BE185D] transition-colors"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> เวรยาม 2 คน
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> ประชุมสภา/ราชการ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> จิตอาสา/พัฒนา
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> วันหยุดราชการ
          </span>
        </div>
      </div>

      {/* Calendar Grid Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-r from-pink-50 via-slate-50 to-pink-50 text-center text-xs font-bold text-slate-700 py-3">
          <div className="text-red-600">อาทิตย์ (เวรวันหยุด)</div>
          <div>จันทร์</div>
          <div>อังคาร</div>
          <div>พุธ</div>
          <div>พฤหัสบดี</div>
          <div>ศุกร์</div>
          <div className="text-blue-600">เสาร์ (เวรวันหยุด)</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
          {/* Empty cells before day 1 */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50/40 p-2 opacity-50" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === '2026-10-07';
            const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            // Find duties on this date
            const dutiesOnDay = dutyRoster.filter(d => d.date === dateStr);
            // Find activities on this date
            const actsOnDay = activities.filter(a => a.startDate.startsWith(dateStr));

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDayDetailDate(dateStr)}
                className={`min-h-[125px] p-2 transition-all relative flex flex-col justify-between cursor-pointer group/cell ${
                  isToday 
                    ? 'bg-pink-50/60 ring-2 ring-[#BE185D] ring-inset' 
                    : isWeekend
                    ? 'bg-amber-50/20 hover:bg-pink-50/40'
                    : 'bg-white hover:bg-pink-50/30'
                }`}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold transition-transform ${
                    isToday 
                      ? 'w-6 h-6 rounded-full bg-[#BE185D] text-white flex items-center justify-center font-mono shadow-xs' 
                      : isWeekend
                      ? 'text-amber-800'
                      : 'text-slate-700'
                  }`}>
                    {dayNum}
                  </span>
                  <div className="flex items-center gap-1">
                    {isToday && (
                      <span className="text-[9px] bg-[#BE185D] text-white px-1.5 py-0.2 rounded font-bold uppercase">
                        วันนี้
                      </span>
                    )}
                    {isWeekend && (
                      <span className="text-[9px] text-amber-700 font-medium hidden sm:inline">
                        วันหยุด
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Slots: Duties with Hover Tooltip & Time Range & 2 Officers */}
                <div className="space-y-1.5 my-auto">
                  {/* Duty Roster Items (Requirement: แสดงเวลา & เวรละ 2 คน & Tooltip) */}
                  {dutiesOnDay.map((duty) => (
                    <div key={duty.id} className="relative group/duty" onClick={(e) => e.stopPropagation()}>
                      <div className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-[11px] cursor-pointer font-medium shadow-2xs space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-amber-800 font-mono">
                          <span className="font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>{duty.timeRange || '08:30 - 16:30 น.'}</span>
                          </span>
                          <span className="bg-amber-200/80 px-1 rounded text-[9px] font-sans font-bold">
                            2 คน
                          </span>
                        </div>
                        <div className="truncate font-semibold text-slate-900 flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-700 shrink-0" />
                          <span className="truncate">
                            {duty.officerName.split(' ')[1] || duty.officerName} 
                            {duty.secondOfficerName && ` & ${duty.secondOfficerName.split(' ')[1] || duty.secondOfficerName}`}
                          </span>
                        </div>
                      </div>

                      {/* FLOATING HOVER TOOLTIP FOR DUTY ROSTER */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/duty:block z-50 w-72 p-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl text-xs pointer-events-auto animate-in fade-in zoom-in-95 border border-slate-700">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2.5">
                          <span className="font-bold text-amber-300 text-[11px]">{duty.shiftLabel}</span>
                          <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-mono">
                            🕒 {duty.timeRange || '08:30 - 16:30 น.'}
                          </span>
                        </div>

                        {/* Officer 1 */}
                        <div className="p-2 bg-slate-800/80 rounded-xl space-y-1 mb-2 border border-slate-700">
                          <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span>1. หัวหน้าเวร / เจ้าหน้าที่หลัก:</span>
                          </div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            {duty.avatar && (
                              <img src={duty.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                            )}
                            <span>{duty.officerName}</span>
                          </div>
                          <div className="text-[10px] text-slate-300">{duty.position} ({duty.department})</div>
                          <a
                            href={`tel:${duty.phone}`}
                            className="font-mono text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px] pt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {duty.phone}
                          </a>
                        </div>

                        {/* Officer 2 (Requirement: เวรละ 2 คน ทั้งวันธรรมดาและวันหยุด) */}
                        {duty.secondOfficerName ? (
                          <div className="p-2 bg-slate-800/80 rounded-xl space-y-1 border border-slate-700">
                            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                              <span>2. เจ้าหน้าที่ปฏิบัติการร่วม (เวรคู่):</span>
                            </div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              {duty.secondOfficerAvatar && (
                                <img src={duty.secondOfficerAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                              )}
                              <span>{duty.secondOfficerName}</span>
                            </div>
                            <div className="text-[10px] text-slate-300">{duty.secondOfficerPosition} ({duty.secondOfficerDepartment})</div>
                            {duty.secondOfficerPhone && (
                              <a
                                href={`tel:${duty.secondOfficerPhone}`}
                                className="font-mono text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px] pt-0.5"
                              >
                                <Phone className="w-3 h-3" />
                                {duty.secondOfficerPhone}
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">
                            * ประจำการร่วมกับเจ้าหน้าที่สายตรวจ อบต.
                          </div>
                        )}

                        {duty.notes && (
                          <div className="mt-2 text-[10px] text-amber-200/90 italic pt-1 border-t border-slate-800">
                            ภารกิจ: {duty.notes}
                          </div>
                        )}

                        {/* Pointer Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  ))}

                  {/* Organization Activities (Requirement: แสดงกิจกรรมเมื่อมีเมาส์อยู่ตรงจุดนั้น Hover Tooltip) */}
                  {actsOnDay.map((act) => (
                    <div key={act.id} className="relative group/act" onClick={(e) => e.stopPropagation()}>
                      <div
                        className={`p-1.5 rounded-lg text-[11px] truncate font-medium border transition-all cursor-pointer shadow-2xs flex items-center gap-1 ${
                          act.type === 'meeting' ? 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100' :
                          act.type === 'holiday' ? 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100 font-bold' :
                          act.type === 'training' ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100' :
                          'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          act.type === 'meeting' ? 'bg-blue-600' :
                          act.type === 'holiday' ? 'bg-red-600' :
                          act.type === 'training' ? 'bg-purple-600' :
                          'bg-emerald-600'
                        }`}></span>
                        <span className="truncate">{act.title}</span>
                      </div>

                      {/* FLOATING HOVER CARD FOR ACTIVITY (Requirement: แสดงกิจกรรมเมื่อมีเมาส์อยู่ตรงจุดนั้น) */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/act:block z-50 w-80 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl text-xs pointer-events-auto animate-in fade-in zoom-in-95 border border-pink-500/40">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.type === 'meeting' ? 'bg-blue-900 text-blue-200 border border-blue-700' :
                            act.type === 'holiday' ? 'bg-red-900 text-red-200 border border-red-700' :
                            act.type === 'training' ? 'bg-purple-900 text-purple-200 border border-purple-700' :
                            'bg-emerald-900 text-emerald-200 border border-emerald-700'
                          }`}>
                            {act.type === 'meeting' ? '🏛️ การประชุมสภา / ราชการ' :
                             act.type === 'holiday' ? '🚩 วันหยุดราชการ' :
                             act.type === 'training' ? '🎓 ฝึกอบรม / สัมมนา' :
                             '🤝 จิตอาสา / กิจกรรมชุมชน'}
                          </span>
                          <span className="text-[10px] text-pink-300 font-mono">
                            📅 {act.startDate.split(' ')[0]}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-white font-heading leading-snug mb-2">
                          {act.title}
                        </h4>

                        <div className="space-y-1.5 text-slate-300 text-[11px] mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                            <span>เวลา: {act.startDate.split(' ')[1] || '09:00'} - {act.endDate.split(' ')[1] || '16:00'} น.</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>สถานที่: {act.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>หน่วยงาน: {act.department}</span>
                          </div>
                        </div>

                        {act.description && (
                          <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700 text-[11px] text-slate-200 leading-relaxed">
                            {act.description}
                          </div>
                        )}

                        <div className="mt-2 text-[10px] text-slate-400 text-right">
                          คลิกที่ช่องวันที่เพื่อดูข้อมูลขนาดเต็ม
                        </div>

                        {/* Pointer Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: ADD ON-DUTY OFFICER (ENFORCING 2 OFFICERS & EXPLICIT TIME) */}
      {isAddDutyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-pink-200 w-full max-w-lg overflow-hidden my-4">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-heading">
                    จัดตารางเวรปฏิบัติหน้าที่ (เวรละ 2 คน ตามระเบียบ)
                  </h3>
                  <p className="text-xs text-amber-100">รองรับทั้งวันทำการปกติและวันเสาร์-อาทิตย์</p>
                </div>
              </div>
              <button onClick={() => setIsAddDutyModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDuty} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่เข้าเวร *</label>
                  <input
                    type="date"
                    required
                    value={dutyDate}
                    onChange={(e) => setDutyDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ช่วงเวลาปฏิบัติหน้าที่ (ระบุเวลา) *</label>
                  <select
                    value={dutyTimeRange}
                    onChange={(e) => setDutyTimeRange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-medium focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="08:30 - 16:30 น.">08:30 - 16:30 น. (ผลัดกลางวัน)</option>
                    <option value="16:30 - 08:30 น.">16:30 - 08:30 น. (ผลัดกลางคืน)</option>
                    <option value="08:30 - 08:30 น. (24 ชม.)">08:30 - 08:30 น. (เวรเผชิญเหตุ 24 ชม.)</option>
                    <option value="08:30 - 12:00 น.">08:30 - 12:00 น. (ครึ่งวันเช้า)</option>
                    <option value="13:00 - 16:30 น.">13:00 - 16:30 น. (ครึ่งวันบ่าย)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ประเภทเวร *</label>
                <select
                  value={dutyShiftType}
                  onChange={(e) => setDutyShiftType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="day_guard">เวรยามประจำวัน (กลางวัน)</option>
                  <option value="night_guard">เวรรักษาการณ์วันหยุด / กลางคืน</option>
                  <option value="emergency_standby">เวรเผชิญเหตุฉุกเฉินและสาธารณภัย (24 ชม.)</option>
                  <option value="complaint_receiver">เวรศูนย์รับเรื่องราวร้องทุกข์ One Stop Service</option>
                </select>
              </div>

              {/* Officer 1 */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>เจ้าหน้าที่คนที่ 1 (หัวหน้าเวร / ผู้ตรวจเวรหลัก) *</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">เลือกเจ้าหน้าที่ *</label>
                    <select
                      value={dutyOfficerId}
                      onChange={(e) => {
                        setDutyOfficerId(e.target.value);
                        const off = usersList.find(u => u.id === e.target.value);
                        if (off) setDutyContactPhone(off.phone);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white"
                    >
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.prefix}{u.firstName} {u.lastName} ({u.position})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">เบอร์โทรติดต่อด่วน *</label>
                    <input
                      type="tel"
                      required
                      value={dutyContactPhone}
                      onChange={(e) => setDutyContactPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Officer 2 (Requirement: เวรละ 2 คน) */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>เจ้าหน้าที่คนที่ 2 (ผู้ปฏิบัติหน้าที่ร่วม / เวรคู่) *</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">เลือกเจ้าหน้าที่ *</label>
                    <select
                      value={secondOfficerId}
                      onChange={(e) => {
                        setSecondOfficerId(e.target.value);
                        const off = usersList.find(u => u.id === e.target.value);
                        if (off) setSecondOfficerPhone(off.phone);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white"
                    >
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.prefix}{u.firstName} {u.lastName} ({u.position})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">เบอร์โทรติดต่อด่วน *</label>
                    <input
                      type="tel"
                      required
                      value={secondOfficerPhone}
                      onChange={(e) => setSecondOfficerPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมายเหตุประจำเวร / ภารกิจมอบหมาย</label>
                <textarea
                  rows={2}
                  placeholder="เช่น ตรวจสอบอาคารสำนักงานและระบบไฟฟ้า ปิดประตูหน้าต่างให้เรียบร้อย..."
                  value={dutyNotes}
                  onChange={(e) => setDutyNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddDutyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-sm"
                >
                  บันทึกตารางเวร (2 คน)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ACTIVITY */}
      {isAddActivityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-pink-200 w-full max-w-lg overflow-hidden my-4">
            <div className="px-6 py-4 bg-gradient-to-r from-[#9D174D] via-[#BE185D] to-[#831843] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-pink-200" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-heading">
                    เพิ่มวาระงาน / กิจกรรม อบต.อ่างแก้ว
                  </h3>
                  <p className="text-xs text-pink-100">ข้อมูลจะแสดงบนปฏิทินและมีกล่องขยายเมื่อชี้เมาส์ (Hover)</p>
                </div>
              </div>
              <button onClick={() => setIsAddActivityModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อกิจกรรม / วาระงาน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น การประชุมสภา อบต.อ่างแก้ว สมัยสามัญ สมัยที่ 4"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-semibold text-slate-900 focus:ring-2 focus:ring-[#BE185D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภท *</label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#BE185D]"
                  >
                    <option value="meeting">การประชุมสภา/ราชการ</option>
                    <option value="community">จิตอาสา/กิจกรรมชุมชน</option>
                    <option value="training">การฝึกอบรม/สัมมนา</option>
                    <option value="holiday">วันหยุดราชการ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่จัดกิจกรรม *</label>
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เวลาเริ่ม *</label>
                  <input
                    type="time"
                    required
                    value={actStartTime}
                    onChange={(e) => setActStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เวลาสิ้นสุด *</label>
                  <input
                    type="time"
                    required
                    value={actEndTime}
                    onChange={(e) => setActEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานที่จัดงาน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ห้องประชุมสภา อบต.อ่างแก้ว (ชั้น 2)"
                  value={actLocation}
                  onChange={(e) => setActLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#BE185D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รายละเอียดสรุป / วาระการประชุม</label>
                <textarea
                  rows={2}
                  placeholder="อธิบายวัตถุประสงค์ ระเบียบวาระ หรือกลุ่มเป้าหมาย..."
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddActivityModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#BE185D] to-[#9D174D] hover:from-[#9D174D] hover:to-[#831843] text-white font-bold rounded-xl shadow-sm"
                >
                  บันทึกกิจกรรม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DAY SUMMARY MODAL (WHEN CLICKING A DAY CELL) */}
      {selectedDayDetailDate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-pink-200 w-full max-w-lg overflow-hidden my-4 max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-[#9D174D] via-[#BE185D] to-[#831843] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-pink-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-heading">
                    กำหนดการและเวรยามประจำวันที่ {selectedDayDetailDate}
                  </h3>
                  <p className="text-xs text-pink-100">รายละเอียดครบถ้วนประจำวัน</p>
                </div>
              </div>
              <button onClick={() => setSelectedDayDetailDate(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
              {/* Day Duty Officers */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>เวรยามประจำวัน (เวรละ 2 คน)</span>
                </h4>
                {dayDuties.length > 0 ? (
                  <div className="space-y-2">
                    {dayDuties.map(d => (
                      <div key={d.id} className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900">{d.shiftLabel}</span>
                          <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded font-mono font-bold text-amber-950">
                            🕒 {d.timeRange}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-amber-200/60">
                          <div>
                            <span className="text-[10px] text-amber-800 font-bold block">1. เจ้าหน้าที่หลัก:</span>
                            <span className="font-semibold text-slate-900">{d.officerName}</span>
                            <div className="text-[10px] text-slate-500">{d.position} ({d.department})</div>
                            <a href={`tel:${d.phone}`} className="text-emerald-700 font-mono font-bold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> {d.phone}
                            </a>
                          </div>
                          {d.secondOfficerName && (
                            <div>
                              <span className="text-[10px] text-amber-800 font-bold block">2. เจ้าหน้าที่ปฏิบัติการร่วม:</span>
                              <span className="font-semibold text-slate-900">{d.secondOfficerName}</span>
                              <div className="text-[10px] text-slate-500">{d.secondOfficerPosition} ({d.secondOfficerDepartment})</div>
                              {d.secondOfficerPhone && (
                                <a href={`tel:${d.secondOfficerPhone}`} className="text-emerald-700 font-mono font-bold flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" /> {d.secondOfficerPhone}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        {d.notes && (
                          <div className="text-[10px] text-amber-800/90 italic pt-1">
                            * {d.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-center italic">
                    ไม่มีการบันทึกตารางเวรในวันนี้
                  </div>
                )}
              </div>

              {/* Day Activities */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#BE185D]" />
                  <span>กิจกรรมและวาระงาน</span>
                </h4>
                {dayActivities.length > 0 ? (
                  <div className="space-y-2">
                    {dayActivities.map(act => (
                      <div key={act.id} className="p-3.5 bg-pink-50/60 border border-pink-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#9D174D] text-sm">{act.title}</span>
                          <span className="text-[10px] bg-white border border-pink-300 px-2 py-0.5 rounded font-mono">
                            {act.startDate.split(' ')[1]} - {act.endDate.split(' ')[1]} น.
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{act.location}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{act.department}</span>
                        </div>
                        {act.description && (
                          <p className="p-2 bg-white rounded-lg border border-pink-100 text-[11px] text-slate-700 leading-relaxed">
                            {act.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-center italic">
                    ไม่มีวาระงานราชการในวันนี้
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDayDetailDate(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-medium"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
