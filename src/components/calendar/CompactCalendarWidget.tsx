import React from 'react';
import { DutyOfficer, ActivityEvent } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Phone, 
  UserCheck, 
  ArrowRight, 
  MapPin, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface Props {
  dutyRoster: DutyOfficer[];
  activities: ActivityEvent[];
  onViewFullCalendar: () => void;
}

export const CompactCalendarWidget: React.FC<Props> = ({
  dutyRoster,
  activities,
  onViewFullCalendar,
}) => {
  // Today's date (2026-10-07 based on local app time)
  const todayStr = '2026-10-07';
  const todaysDuties = dutyRoster.filter(d => d.date === todayStr);
  const otherUpcomingDuties = dutyRoster.filter(d => d.date > todayStr).slice(0, 3);
  const upcomingActs = activities.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-heading leading-tight">
              วาระงานและเวรยามประจำวันนี้ (Today's Schedule & Duty Roster)
            </h3>
            <p className="text-[11px] text-slate-500">
              วันพุธที่ 7 ตุลาคม 2569 · ติดต่อประสานงานเร่งด่วน
            </p>
          </div>
        </div>

        <button
          onClick={onViewFullCalendar}
          className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 group py-1 px-2 rounded hover:bg-blue-50 transition-colors"
        >
          <span>เปิดปฏิทินฉบับเต็ม</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Two-Column Grid: Today's On-Duty Officers (Left) & Upcoming Meetings/Events (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Today's Duty Officers with Instant Emergency Contact Phone */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-amber-900 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              ผู้เข้าเวรปฏิบัติหน้าที่วันนี้ (On-Duty Today)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ชี้เพื่อดูรายละเอียด</span>
          </div>

          <div className="space-y-2">
            {todaysDuties.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                ไม่มีข้อมูลเวรยามในวันนี้
              </div>
            ) : (
              todaysDuties.map((duty) => (
                <div
                  key={duty.id}
                  className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition-all flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                      {duty.officerName.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{duty.officerName}</span>
                        <span className="text-[10px] font-medium text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
                          {duty.shiftLabel.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {duty.position} · {duty.department}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${duty.phone}`}
                    className="px-2.5 py-1.5 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 hover:border-emerald-600 rounded-lg font-mono font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                    title="โทรติดต่อด่วน"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{duty.phone}</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Upcoming Agenda & Meetings */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              วาระงานสำคัญในสัปดาห์นี้ (Weekly Agenda)
            </span>
            <span className="text-[10px] text-slate-400">ห้องประชุม อบต.</span>
          </div>

          <div className="space-y-2">
            {upcomingActs.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all text-xs flex items-start justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 line-clamp-1">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-mono text-blue-900 font-semibold">{act.startDate}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      {act.location}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                  act.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                  act.type === 'holiday' ? 'bg-red-100 text-red-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {act.type === 'meeting' ? 'ประชุมสภา' : act.type === 'holiday' ? 'วันหยุด' : 'กิจกรรม'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
