import React, { useState } from 'react';
import { 
  RepairRequest, 
  User, 
  RepairCategory, 
  RepairUrgency, 
  RepairStatus, 
  SiteSettings,
  RepairMaterial 
} from '../../types';
import { 
  Wrench, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  MapPin, 
  BarChart3, 
  Check, 
  X, 
  Send, 
  Eye, 
  Layers, 
  Smartphone,
  Flame,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Props {
  repairs: RepairRequest[];
  currentUser: User;
  onUpdateRepair: (repair: RepairRequest) => void;
  onAddRepair: (repair: RepairRequest) => void;
  siteSettings: SiteSettings;
}

export const RepairModule: React.FC<Props> = ({
  repairs,
  currentUser,
  onUpdateRepair,
  onAddRepair,
  siteSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard' | 'heatmap'>('list');
  const [channelFilter, setChannelFilter] = useState<'all' | 'public' | 'internal'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Repair Modal
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isLineNotifyModalOpen, setIsLineNotifyModalOpen] = useState(false);
  const [isNewInternalModalOpen, setIsNewInternalModalOpen] = useState(false);

  // Status Update State (Technician Panel)
  const [newStatus, setNewStatus] = useState<RepairStatus>('in_progress');
  const [techNotes, setTechNotes] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialQty, setMaterialQty] = useState('');
  const [materialUnit, setMaterialUnit] = useState('ชิ้น');
  const [materialCost, setMaterialCost] = useState('');
  const [currentMaterials, setCurrentMaterials] = useState<RepairMaterial[]>([]);

  // Internal Request Form State
  const [internalTitle, setInternalTitle] = useState('');
  const [internalCategory, setInternalCategory] = useState<'office_equipment' | 'building' | 'electricity'>('office_equipment');
  const [internalDesc, setInternalDesc] = useState('');
  const [internalLocation, setInternalLocation] = useState('');
  const [internalUrgency, setInternalUrgency] = useState<RepairUrgency>('normal');

  const canManageRepairs = currentUser.role === 'technician' || currentUser.role === 'dept_head' || currentUser.role === 'super_admin' || currentUser.modules.repairDispatch;

  // Filtered List
  const filteredRepairs = repairs.filter((r) => {
    const matchesChannel = channelFilter === 'all' || r.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      r.ticketId.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      (r.citizenName && r.citizenName.toLowerCase().includes(q)) ||
      (r.reporterName && r.reporterName.toLowerCase().includes(q));
    return matchesChannel && matchesStatus && matchesSearch;
  });

  // Analytics KPI Computations
  const totalCases = repairs.length;
  const completedCases = repairs.filter(r => r.status === 'completed').length;
  const inProgressCases = repairs.filter(r => r.status === 'in_progress').length;
  const pendingCases = repairs.filter(r => r.status === 'pending' || r.status === 'assigned').length;
  const completionRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  repairs.forEach(r => {
    categoryCounts[r.categoryLabel] = (categoryCounts[r.categoryLabel] || 0) + 1;
  });

  // Handle Technician Save Status & Parts
  const handleSaveTechnicianUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepair) return;

    const updated: RepairRequest = {
      ...selectedRepair,
      status: newStatus,
      technicianNotes: techNotes || selectedRepair.technicianNotes,
      afterImages: afterImageUrl ? [afterImageUrl] : selectedRepair.afterImages,
      materialsUsed: [...selectedRepair.materialsUsed, ...currentMaterials],
      completedAt: newStatus === 'completed' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : selectedRepair.completedAt,
    };

    onUpdateRepair(updated);
    setSelectedRepair(updated);
    setIsUpdateStatusModalOpen(false);
  };

  // Add material item
  const handleAddMaterial = () => {
    if (!materialName || !materialQty) return;
    const newMat: RepairMaterial = {
      id: `mat-${Date.now()}`,
      name: materialName,
      quantity: parseFloat(materialQty) || 1,
      unit: materialUnit,
      cost: parseFloat(materialCost) || 0,
    };
    setCurrentMaterials([...currentMaterials, newMat]);
    setMaterialName('');
    setMaterialQty('');
    setMaterialCost('');
  };

  // Handle Create Internal Repair
  const handleCreateInternalRepair = (e: React.FormEvent) => {
    e.preventDefault();
    const newIdNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket = `RP-${siteSettings.fiscalYear}-${newIdNum}`;

    const catLabels: Record<string, string> = {
      office_equipment: 'ครุภัณฑ์สำนักงาน',
      building: 'อาคารสถานที่ อบต.',
      electricity: 'ระบบไฟฟ้าสำนักงาน',
    };

    const newReq: RepairRequest = {
      id: `rep-int-${Date.now()}`,
      ticketId: newTicket,
      channel: 'internal',
      reporterName: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}`,
      reporterDept: currentUser.departmentName,
      category: internalCategory as any,
      categoryLabel: catLabels[internalCategory],
      title: internalTitle,
      description: internalDesc,
      location: internalLocation,
      lat: 18.8421,
      lng: 98.9667,
      urgency: internalUrgency,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      assignedDept: 'กองช่าง',
      beforeImages: [],
      afterImages: [],
      materialsUsed: [],
      lineNotified: true,
    };

    onAddRepair(newReq);
    setIsNewInternalModalOpen(false);
    setSelectedRepair(newReq);
    // Reset
    setInternalTitle('');
    setInternalDesc('');
    setInternalLocation('');
  };

  return (
    <div className="space-y-6">
      {/* Module Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              ระบบบริหารจัดการงานแจ้งซ่อมแซม (Repair Management System)
            </h2>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
              2 ช่องทาง (ประชาชน & ภายใน)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            รับแจ้งเรื่อง, จ่ายงานให้ช่าง, แจ้งเตือนผ่าน Line Notify, อัปเดตรูปหลังซ่อมและวัสดุ พร้อม Executive Dashboard และ Heatmap
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewInternalModalOpen(true)}
            className="px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>เจ้าหน้าที่แจ้งซ่อมครุภัณฑ์/อาคาร (Internal)</span>
          </button>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl p-1 gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'list'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>รายการงานแจ้งซ่อม ({repairs.length} รายการ)</span>
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'dashboard'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>แดชบอร์ดผู้บริหาร & สถิติ KPI (Executive Dashboard)</span>
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'heatmap'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span>แผนที่ความร้อนจุดเกิดเหตุ (Incident Heatmap)</span>
        </button>
      </div>

      {/* TAB 1: REPAIR LIST VIEW */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหา Ticket ID, เรื่อง, สถานที่, ผู้แจ้ง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* Channel Segregation Filter */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setChannelFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  channelFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setChannelFilter('public')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  channelFilter === 'public' ? 'bg-white text-blue-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                ประชาชน (Public)
              </button>
              <button
                onClick={() => setChannelFilter('internal')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  channelFilter === 'internal' ? 'bg-white text-indigo-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                ภายในเจ้าหน้าที่ (Internal)
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white font-medium text-slate-700"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอดำเนินการ (Pending)</option>
              <option value="assigned">จ่ายงานแล้ว (Assigned)</option>
              <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
              <option value="completed">ซ่อมเสร็จสิ้น (Completed)</option>
            </select>
          </div>

          {/* Table of Repairs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Ticket ID</th>
                    <th className="p-3.5">ช่องทาง</th>
                    <th className="p-3.5">ประเภท / เรื่องที่แจ้ง</th>
                    <th className="p-3.5">สถานที่</th>
                    <th className="p-3.5">ความเร่งด่วน</th>
                    <th className="p-3.5">สถานะ</th>
                    <th className="p-3.5">ช่างผู้รับผิดชอบ</th>
                    <th className="p-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRepairs.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {rep.ticketId}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {rep.channel === 'public' ? (
                          <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                            ประชาชน
                          </span>
                        ) : (
                          <span className="text-[11px] text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
                            เจ้าหน้าที่ภายใน
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{rep.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{rep.categoryLabel}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-[180px] truncate">
                        {rep.location}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-medium ${
                          rep.urgency === 'most_urgent' ? 'bg-red-100 text-red-700 font-bold' :
                          rep.urgency === 'urgent' ? 'bg-amber-100 text-amber-700 font-semibold' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {rep.urgency === 'most_urgent' ? 'ด่วนที่สุด' : rep.urgency === 'urgent' ? 'ด่วน' : 'ปกติ'}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full font-medium text-[11px] ${
                          rep.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          rep.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          rep.status === 'assigned' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {rep.status === 'completed' ? 'ซ่อมเสร็จสิ้น' :
                           rep.status === 'in_progress' ? 'กำลังดำเนินการ' :
                           rep.status === 'assigned' ? 'จ่ายงานแล้ว' : 'รอดำเนินการ'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">
                        {rep.assignedTo || '-'}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        {/* Simulated Line Notify Preview Button */}
                        <button
                          onClick={() => {
                            setSelectedRepair(rep);
                            setIsLineNotifyModalOpen(true);
                          }}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition-colors"
                          title="ดูการแจ้งเตือน Line Notify"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>

                        {/* Action Details / Technician Update Button */}
                        {canManageRepairs && (
                          <button
                            onClick={() => {
                              setSelectedRepair(rep);
                              setNewStatus(rep.status);
                              setTechNotes(rep.technicianNotes || '');
                              setCurrentMaterials([]);
                              setAfterImageUrl(rep.afterImages[0] || '');
                              setIsUpdateStatusModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-[#0F2C59] hover:bg-blue-900 text-white rounded text-xs font-medium transition-colors"
                          >
                            อัปเดตงานช่าง
                          </button>
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

      {/* TAB 2: EXECUTIVE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">งานแจ้งซ่อมทั้งหมด</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{totalCases} เคส</div>
              <div className="text-[11px] text-slate-500 mt-2">คำขอสะสมปีงบประมาณ 2569</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-emerald-600 uppercase">อัตราความสำเร็จ (KPI)</div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">{completionRate}%</div>
              <div className="text-[11px] text-emerald-600 mt-2">ซ่อมเสร็จสิ้น {completedCases} จาก {totalCases} เคส</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-blue-600 uppercase">กำลังดำเนินการซ่อม</div>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-1 tabular-nums">{inProgressCases} เคส</div>
              <div className="text-[11px] text-blue-600 mt-2">ทีมช่างเข้าปฏิบัติงานในพื้นที่</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-amber-600 uppercase">ระยะเวลาเฉลี่ยปิดงาน</div>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">2.3 วัน</div>
              <div className="text-[11px] text-slate-500 mt-2">ความรวดเร็วในการบริการประชาชน</div>
            </div>
          </div>

          {/* Breakdown Charts & Turnaround Times */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-heading">
                สัดส่วนงานแจ้งซ่อมแยกตามประเภทสาธารณูปโภค
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryCounts).map(([label, count]) => {
                  const pct = Math.round((count / totalCases) * 100);
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{label}</span>
                        <span className="font-mono text-slate-500 tabular-nums">{count} เคส ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-700 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Average Turnaround Times per Category */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-heading">
                ระยะเวลาเฉลี่ยในการซ่อมแซมแยกตามประเภท (Turnaround Time)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-700">ไฟฟ้าสาธารณะ (ไฟกิ่ง)</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    1.4 วัน (รวดเร็ว)
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-700">ระบบประปาหมู่บ้าน / ท่อแตก</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    0.8 วัน (เร่งด่วน)
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-700">ถนนชำรุด / ปรับปรุงผิวจราจร</span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    3.8 วัน (ตามรอบยางมะตอย)
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-700">ทางระบายน้ำอุดตัน</span>
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    2.1 วัน
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                ข้อมูลสรุปสำหรับ ปลัด อบต. และ นายก อบต. เพื่อการวางแผนจัดสรรงบประมาณกองช่าง
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEATMAP & CLUSTER MAP */}
      {activeTab === 'heatmap' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                แผนที่ความหนาแน่นจุดเกิดเหตุ (Incident Heatmap / Spatial Density)
              </h3>
              <p className="text-xs text-slate-500">
                แสดงพิกัดที่ประชาชนปักหมุดแจ้งซ่อมบ่อยที่สุด เพื่อให้ผู้บริหารมองเห็นปัญหาซ้ำซากและวางแผนตั้งงบประมาณปรับปรุงครั้งใหญ่
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> ด่วนที่สุด</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> ด่วน</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> ซ่อมแล้ว</span>
            </div>
          </div>

          {/* Interactive Heatmap Representation */}
          <div className="relative h-96 bg-slate-100 rounded-xl border border-slate-300 overflow-hidden shadow-inner flex flex-col justify-between p-4">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[#e8ecf1] opacity-70"></div>

            <div className="relative z-10 flex justify-between text-xs text-slate-700 font-semibold">
              <span>ตำบลดอนแก้ว อำเภอแม่ริม จังหวัดเชียงใหม่</span>
              <span className="font-mono text-slate-500">พื้นที่รวม 8 หมู่บ้าน</span>
            </div>

            {/* Pins on map */}
            <div className="relative z-10 w-full h-full my-4">
              {repairs.map((r, index) => {
                const leftPct = 15 + (index * 22) % 75;
                const topPct = 20 + (index * 26) % 65;

                return (
                  <div
                    key={r.id}
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    {/* Glowing Heat Ring */}
                    <div className="absolute -inset-2 bg-orange-500/20 rounded-full animate-ping pointer-events-none"></div>

                    {/* Marker */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white ${
                      r.status === 'completed' ? 'bg-emerald-600' :
                      r.urgency === 'most_urgent' ? 'bg-red-600' : 'bg-amber-600'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>

                    {/* Popover on Hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-56 p-2.5 bg-slate-900 text-white rounded-lg shadow-xl text-xs pointer-events-none">
                      <div className="font-bold text-amber-300">{r.ticketId}</div>
                      <div className="font-medium text-slate-100 truncate">{r.title}</div>
                      <div className="text-[10px] text-slate-300 mt-1">{r.location}</div>
                      <div className="mt-1 text-[10px] text-emerald-300">สถานะ: {r.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative z-10 bg-white/90 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex justify-between">
              <span><strong>พื้นที่ที่มีการแจ้งซ่อมบ่อยที่สุด:</strong> หมู่ 3 บ้านดอนแก้วพัฒนา (โคมไฟส่องสว่างดับบ่อย) และ หมู่ 2 บ้านสันป่าสัก</span>
              <span className="font-mono text-blue-800">พิกัดศูนย์กลาง: 18.8452 N, 98.9684 E</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TECHNICIAN STATUS & PROOF & MATERIALS UPDATE */}
      {isUpdateStatusModalOpen && selectedRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm font-heading">บันทึกผลการปฏิบัติงานของช่าง ({selectedRepair.ticketId})</h3>
                  <p className="text-[10px] text-blue-200">{selectedRepair.title}</p>
                </div>
              </div>
              <button onClick={() => setIsUpdateStatusModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTechnicianUpdate} className="p-5 space-y-4 text-xs">
              {/* Status Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ปรับปรุงสถานะงานซ่อม *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('in_progress')}
                    className={`py-2 rounded-lg border font-medium transition-all ${
                      newStatus === 'in_progress' ? 'bg-blue-800 text-white border-blue-800 font-bold' : 'bg-white text-slate-700'
                    }`}
                  >
                    กำลังดำเนินการ
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('completed')}
                    className={`py-2 rounded-lg border font-medium transition-all ${
                      newStatus === 'completed' ? 'bg-emerald-700 text-white border-emerald-700 font-bold' : 'bg-white text-slate-700'
                    }`}
                  >
                    ซ่อมเสร็จสิ้น (ปิดเคส)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('cancelled')}
                    className={`py-2 rounded-lg border font-medium transition-all ${
                      newStatus === 'cancelled' ? 'bg-red-700 text-white border-red-700 font-bold' : 'bg-white text-slate-700'
                    }`}
                  >
                    ยกเลิก/นอกอำนาจ
                  </button>
                </div>
              </div>

              {/* Technician Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">บันทึกรายละเอียดการซ่อมแซมของช่าง *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น เข้าตรวจสอบเปลี่ยนหลอด LED และบัลลาสต์เรียบร้อย เปิดทดสอบติดสว่างปกติ..."
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              {/* After Photo Proof */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">แนบรูปภาพ "หลังซ่อมเสร็จ" (Proof of Completion)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL รูปภาพหลังซ่อมเสร็จ (หรือคลิกปุ่มจำลอง)"
                    value={afterImageUrl}
                    onChange={(e) => setAfterImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAfterImageUrl('https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=600&auto=format&fit=crop')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 font-medium shrink-0"
                  >
                    ใช้รูปจำลองหลังซ่อม
                  </button>
                </div>
              </div>

              {/* Materials & Parts Used Form */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800">บันทึกวัสดุและอุปกรณ์ที่ใช้</div>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="ชื่อวัสดุ (เช่น โคม LED)"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 border border-slate-300 rounded outline-none"
                  />
                  <input
                    type="number"
                    placeholder="จำนวน"
                    value={materialQty}
                    onChange={(e) => setMaterialQty(e.target.value)}
                    className="px-2 py-1.5 border border-slate-300 rounded outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-2 py-1.5 bg-blue-700 text-white rounded font-medium hover:bg-blue-800"
                  >
                    + เพิ่มวัสดุ
                  </button>
                </div>

                {currentMaterials.length > 0 && (
                  <div className="divide-y divide-slate-200 pt-1">
                    {currentMaterials.map((m) => (
                      <div key={m.id} className="py-1 flex justify-between text-slate-700">
                        <span>{m.name}</span>
                        <span className="font-mono">{m.quantity} {m.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUpdateStatusModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
                >
                  บันทึกผลการซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REALISTIC LINE NOTIFY CARD SIMULATION */}
      {isLineNotifyModalOpen && selectedRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            {/* Line Green Header */}
            <div className="px-5 py-3.5 bg-[#00B900] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white text-[#00B900] font-black flex items-center justify-center text-xs">
                  LINE
                </div>
                <div>
                  <h3 className="font-bold text-xs">LINE Notify Alert</h3>
                  <p className="text-[10px] text-emerald-100">{siteSettings.lineNotifyGroup}</p>
                </div>
              </div>
              <button onClick={() => setIsLineNotifyModalOpen(false)} className="text-white hover:text-emerald-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Line Message Bubble */}
            <div className="p-4 bg-[#748899]/15 min-h-[260px] flex flex-col justify-center">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-xs space-y-2 text-slate-800 font-sans">
                <div className="font-bold text-[#00B900] flex items-center gap-1">
                  <span>🔔 แจ้งเตือนงานซ่อมแซมใหม่!</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  รหัส: {selectedRepair.ticketId}
                </div>
                <div className="font-bold text-slate-900">
                  {selectedRepair.title}
                </div>
                <div className="text-slate-600">
                  📍 พิกัด: {selectedRepair.location}
                </div>
                <div className="text-slate-600">
                  ⚡ ความเร่งด่วน: {selectedRepair.urgency === 'most_urgent' ? 'ด่วนที่สุด' : 'ปกติ'}
                </div>
                <div className="text-slate-500 text-[11px]">
                  👤 ผู้แจ้ง: {selectedRepair.citizenName || selectedRepair.reporterName} ({selectedRepair.citizenPhone || 'เจ้าหน้าที่'})
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert('จำลองเปิดแผนที่ Google Maps พิกัด: ' + selectedRepair.lat + ', ' + selectedRepair.lng); }}
                    className="flex-1 py-1.5 bg-blue-50 text-blue-700 text-center rounded text-[11px] font-medium"
                  >
                    ดูแผนที่ GPS
                  </a>
                  <button
                    onClick={() => {
                      setIsLineNotifyModalOpen(false);
                      setIsUpdateStatusModalOpen(true);
                    }}
                    className="flex-1 py-1.5 bg-[#00B900] text-white text-center rounded text-[11px] font-bold"
                  >
                    กดรับงานทันที
                  </button>
                </div>
              </div>
              <div className="text-center text-[10px] text-slate-400 mt-3">
                ส่งตรงถึงกลุ่มงานช่างและกู้ภัย อบต.ดอนแก้ว
              </div>
            </div>

            <div className="p-3 bg-white text-right border-t border-slate-100">
              <button
                onClick={() => setIsLineNotifyModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs rounded-lg font-medium"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INTERNAL REPAIR SUBMISSION FORM (STAFF) */}
      {isNewInternalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm font-heading">เจ้าหน้าที่แจ้งซ่อมแซมครุภัณฑ์ / อาคารสถานที่</h3>
              </div>
              <button onClick={() => setIsNewInternalModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInternalRepair} className="p-5 space-y-4 text-xs">
              <div className="p-2.5 bg-slate-100 rounded text-slate-700">
                ผู้แจ้ง: <strong>{currentUser.prefix}{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.departmentName})
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่การแจ้งซ่อม *</label>
                  <select
                    value={internalCategory}
                    onChange={(e) => setInternalCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="office_equipment">ครุภัณฑ์สำนักงาน (แอร์, คอมพิวเตอร์, ปริ้นเตอร์)</option>
                    <option value="building">อาคารสถานที่ / ประตู / หน้าต่าง</option>
                    <option value="electricity">ระบบไฟฟ้า / สวิตช์ / ปลั๊กไฟ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ความเร่งด่วน *</label>
                  <select
                    value={internalUrgency}
                    onChange={(e) => setInternalUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="normal">ปกติ</option>
                    <option value="urgent">ด่วน</option>
                    <option value="most_urgent">ด่วนที่สุด</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เรื่อง / อาการที่ต้องการซ่อม *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แอร์ห้องทำงานไม่เย็น มีน้ำหยดลงโต๊ะ"
                  value={internalTitle}
                  onChange={(e) => setInternalTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานที่ / ชั้น / หมายเลขห้อง *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อาคาร 2 ชั้น 1 ห้องกองการศึกษาฯ หรือ หน้าต่างห้องประชุมสภา"
                  value={internalLocation}
                  onChange={(e) => setInternalLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รายละเอียดอาการชำรุดเพิ่มเติม</label>
                <textarea
                  rows={2}
                  placeholder="ระบุรหัสครุภัณฑ์ หรืออาการอย่างละเอียด..."
                  value={internalDesc}
                  onChange={(e) => setInternalDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>ระบบรักษาความปลอดภัยข้อมูลและปฏิบัติตามมาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewInternalModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"
                >
                  ส่งแจ้งซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
