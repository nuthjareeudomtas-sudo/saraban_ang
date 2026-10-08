import React, { useState } from 'react';
import { 
  RepairRequest, 
  PermitType, 
  PermitRequest, 
  SiteSettings 
} from '../../types';
import { 
  Wrench, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Phone, 
  Upload, 
  Building2, 
  Send, 
  Check, 
  ArrowRight,
  Eye,
  Calendar,
  Sparkles,
  Download,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface Props {
  repairs: RepairRequest[];
  permitTypes: PermitType[];
  permitRequests: PermitRequest[];
  onAddRepair: (repair: RepairRequest) => void;
  onAddPermitRequest: (req: PermitRequest) => void;
  siteSettings: SiteSettings;
  onSwitchToIntranet: () => void;
}

export const PublicPortal: React.FC<Props> = ({
  repairs,
  permitTypes,
  permitRequests,
  onAddRepair,
  onAddPermitRequest,
  siteSettings,
  onSwitchToIntranet,
}) => {
  const [activeTab, setActiveTab] = useState<'repair_form' | 'repair_track' | 'permit_apply' | 'permit_track'>('repair_form');

  // Repair Form State
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [repairCategory, setRepairCategory] = useState<'electricity' | 'street' | 'water' | 'drainage'>('electricity');
  const [repairTitle, setRepairTitle] = useState('');
  const [repairDescription, setRepairDescription] = useState('');
  const [repairLocation, setRepairLocation] = useState('');
  const [repairVillageMoo, setRepairVillageMoo] = useState('หมู่ที่ 3');
  const [repairUrgency, setRepairUrgency] = useState<'normal' | 'urgent' | 'most_urgent'>('normal');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({ lat: 18.8452, lng: 98.9684 });
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Search Ticket ID
  const [searchTicketInput, setSearchTicketInput] = useState('');
  const [searchedRepair, setSearchedRepair] = useState<RepairRequest | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);

  // Search Permit Application No
  const [searchPermitInput, setSearchPermitInput] = useState('');
  const [searchedPermit, setSearchedPermit] = useState<PermitRequest | null>(null);
  const [permitSearchNotFound, setPermitSearchNotFound] = useState(false);

  // Permit Form State
  const [selectedPermitType, setSelectedPermitType] = useState<PermitType>(permitTypes[0] || null);
  const [permitCitizenName, setPermitCitizenName] = useState('');
  const [permitCitizenId, setPermitCitizenId] = useState('');
  const [permitCitizenPhone, setPermitCitizenPhone] = useState('');
  const [permitCitizenAddress, setPermitCitizenAddress] = useState('');
  const [permitDynamicValues, setPermitDynamicValues] = useState<Record<string, any>>({});
  const [createdPermitAppNo, setCreatedPermitAppNo] = useState<string | null>(null);

  // PDPA Consent States
  const [pdpaRepairConsent, setPdpaRepairConsent] = useState(false);
  const [pdpaPermitConsent, setPdpaPermitConsent] = useState(false);

  // Handle Repair Submit
  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdpaRepairConsent) {
      alert('กรุณาทำเครื่องหมายยินยอมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) ก่อนส่งข้อมูล');
      return;
    }

    const newIdNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket = `RP-${siteSettings.fiscalYear}-${newIdNum}`;

    const catLabels: Record<string, string> = {
      electricity: 'ไฟฟ้าสาธารณะ (ไฟกิ่ง)',
      street: 'ถนนชำรุด / หลุมบ่อ',
      water: 'ระบบประปาหมู่บ้าน',
      drainage: 'ทางระบายน้ำอุดตัน',
    };

    const newReq: RepairRequest = {
      id: `rep-pub-${Date.now()}`,
      ticketId: newTicket,
      channel: 'public',
      citizenName,
      citizenPhone,
      category: repairCategory,
      categoryLabel: catLabels[repairCategory],
      title: repairTitle,
      description: repairDescription,
      location: `${repairLocation} (${repairVillageMoo})`,
      villageMoo: repairVillageMoo,
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
      urgency: repairUrgency,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      assignedDept: 'กองช่าง',
      beforeImages: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop'],
      afterImages: [],
      materialsUsed: [],
      lineNotified: true,
      pdpaConsent: true,
    };

    onAddRepair(newReq);
    setCreatedTicketId(newTicket);
  };

  // Handle Search Ticket
  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchTicketInput.trim().toUpperCase();
    const found = repairs.find(r => r.ticketId.toUpperCase() === cleanQuery);
    if (found) {
      setSearchedRepair(found);
      setSearchNotFound(false);
    } else {
      setSearchedRepair(null);
      setSearchNotFound(true);
    }
  };

  // Handle Permit Submit
  const handlePermitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdpaPermitConsent) {
      alert('กรุณาทำเครื่องหมายยินยอมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) ก่อนยื่นคำขอรับใบอนุญาต');
      return;
    }

    const appNo = `PM-${siteSettings.fiscalYear}-00${Math.floor(50 + Math.random() * 50)}`;

    const newPermitReq: PermitRequest = {
      id: `perm-req-${Date.now()}`,
      applicationNo: appNo,
      permitTypeId: selectedPermitType.id,
      permitTypeName: selectedPermitType.name,
      citizenName: permitCitizenName,
      citizenIdCard: permitCitizenId,
      citizenPhone: permitCitizenPhone,
      citizenAddress: permitCitizenAddress,
      formData: permitDynamicValues,
      attachedDocs: selectedPermitType.requiredDocuments.map(doc => ({
        name: doc,
        uploaded: true,
      })),
      status: 'submitted',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      pdpaConsent: true,
    };

    onAddPermitRequest(newPermitReq);
    setCreatedPermitAppNo(appNo);
  };

  // Handle Search Permit
  const handleSearchPermit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchPermitInput.trim().toUpperCase();
    const found = permitRequests.find(p => p.applicationNo.toUpperCase() === clean);
    if (found) {
      setSearchedPermit(found);
      setPermitSearchNotFound(false);
    } else {
      setSearchedPermit(null);
      setPermitSearchNotFound(true);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F2C59] via-[#1B3B6F] to-[#212E53] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-900 relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            ศูนย์บริการประชาชนออนไลน์แบบเบ็ดเสร็จ (E-Service One Stop)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading mb-2 text-wrap balance">
            บริการประชาชน {siteSettings.saoName}
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
            แจ้งซ่อมไฟฟ้าสาธารณะ ถนนชำรุด ท่อระบายน้ำ ประปาหมู่บ้าน หรือยื่นขอใบอนุญาตก่อสร้างและขุดถมดินออนไลน์ได้ทันที ตลอด 24 ชั่วโมง โดยไม่ต้องเดินทางมาที่สำนักงาน
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('repair_form')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              แจ้งซ่อมสาธารณูปโภค (ทันที)
            </button>
            <button
              onClick={() => setActiveTab('repair_track')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-amber-300" />
              ติดตามสถานะการซ่อม
            </button>
            <button
              onClick={() => setActiveTab('permit_apply')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              ยื่นขอใบอนุญาตออนไลน์
            </button>
          </div>
        </div>

        {/* Ambient Crest Background */}
        <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none hidden md:block">
          <Building2 className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs flex items-center justify-between text-xs text-amber-950">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{siteSettings.announcementText}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-600 font-mono text-[11px]">
          <span>สายด่วน: {siteSettings.emergencyHotline}</span>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl p-1 gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('repair_form')}
          className={`flex-1 py-3 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'repair_form'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>1. แจ้งซ่อมแซมสาธารณูปโภค</span>
        </button>
        <button
          onClick={() => setActiveTab('repair_track')}
          className={`flex-1 py-3 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'repair_track'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>2. ค้นหา & ติดตามงานซ่อม</span>
        </button>
        <button
          onClick={() => setActiveTab('permit_apply')}
          className={`flex-1 py-3 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'permit_apply'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. ยื่นขอใบอนุญาตออนไลน์</span>
        </button>
        <button
          onClick={() => setActiveTab('permit_track')}
          className={`flex-1 py-3 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'permit_track'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>4. ติดตามใบอนุญาต & ดาวน์โหลด</span>
        </button>
      </div>

      {/* TAB 1: CITIZEN REPAIR SUBMISSION */}
      {activeTab === 'repair_form' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {createdTicketId ? (
            <div className="max-w-xl mx-auto text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                บันทึกการแจ้งซ่อมเรียบร้อยแล้ว
              </h2>
              <p className="text-sm text-slate-600">
                ระบบได้ส่งการแจ้งเตือนไปยังกลุ่ม Line ช่างกองช่างเรียบร้อยแล้ว ท่านสามารถนำหมายเลข Ticket ID ด้านล่างนี้ไปใช้ติดตามผลการซ่อมแซมได้ทันที
              </p>
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl inline-block">
                <div className="text-xs text-slate-500 uppercase font-mono">รหัสติดตามเรื่อง (Ticket ID)</div>
                <div className="text-2xl font-bold text-blue-900 font-mono tracking-wider mt-1">
                  {createdTicketId}
                </div>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchTicketInput(createdTicketId);
                    setActiveTab('repair_track');
                    setSearchedRepair(repairs.find(r => r.ticketId === createdTicketId) || null);
                  }}
                  className="px-5 py-2.5 bg-blue-800 text-white font-medium rounded-lg text-sm hover:bg-blue-900 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  ติดตามงานซ่อมนี้ทันที
                </button>
                <button
                  onClick={() => {
                    setCreatedTicketId(null);
                    setRepairTitle('');
                    setRepairDescription('');
                  }}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
                >
                  แจ้งเรื่องใหม่อีกครั้ง
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRepairSubmit} className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">แบบฟอร์มแจ้งซ่อมแซมสาธารณูปโภค (สำหรับประชาชน)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ไม่ต้องเข้าสู่ระบบ เจ้าหน้าที่จะได้รับข้อมูลแจ้งเตือนทันทีผ่านระบบ Line Notify
                </p>
              </div>

              {/* Step 1: Citizen Contact Verification */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <div className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                  1. ข้อมูลผู้แจ้งเรื่อง (เพื่อการติดต่อกลับและป้องกันการแจ้งเท็จ)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น นายสมศรี มีสุข"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 089-776-5544"
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Issue Details */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  2. ประเภทและรายละเอียดความชำรุดเสียหาย
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'electricity', label: 'ไฟฟ้าสาธารณะ (ไฟกิ่ง)', icon: '💡' },
                    { id: 'street', label: 'ถนนชำรุด / หลุมบ่อ', icon: '🛣️' },
                    { id: 'water', label: 'ประปาหมู่บ้าน / ท่อแตก', icon: '💧' },
                    { id: 'drainage', label: 'ท่อระบายน้ำอุดตัน', icon: '🌊' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRepairCategory(cat.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        repairCategory === cat.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="text-xs leading-tight">{cat.label}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อเรื่องที่แจ้ง *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น หลอดไฟส่องสว่างดับมืด หน้าปากซอย 4"
                    value={repairTitle}
                    onChange={(e) => setRepairTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดอาการชำรุด *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="อธิบายอาการชำรุดเพิ่มเติม เช่น ดับมาแล้วกี่วัน หรือมีเสาไฟต้นใดเอียง..."
                    value={repairDescription}
                    onChange={(e) => setRepairDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">หมู่บ้าน / หมู่ที่ *</label>
                    <select
                      value={repairVillageMoo}
                      onChange={(e) => setRepairVillageMoo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="หมู่ที่ 1">หมู่ที่ 1 บ้านดอนแก้ว</option>
                      <option value="หมู่ที่ 2">หมู่ที่ 2 บ้านสันป่าสัก</option>
                      <option value="หมู่ที่ 3">หมู่ที่ 3 บ้านดอนแก้วพัฒนา</option>
                      <option value="หมู่ที่ 4">หมู่ที่ 4 บ้านท่าศาลา</option>
                      <option value="หมู่ที่ 5">หมู่ที่ 5 บ้านริมปิง</option>
                      <option value="หมู่ที่ 6">หมู่ที่ 6 บ้านหนองหอย</option>
                      <option value="หมู่ที่ 7">หมู่ที่ 7 บ้านสุขสมบูรณ์</option>
                      <option value="หมู่ที่ 8">หมู่ที่ 8 บ้านสันกลาง</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">สถานที่ / จุดสังเกต *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น หน้าบ้านเลขที่ 45/2 หรือ ตรงข้ามศาลาหมู่บ้าน"
                      value={repairLocation}
                      onChange={(e) => setRepairLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Interactive GPS Map Pin Simulation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    3. ตำแหน่งพิกัดแผนที่ GPS (คลิกเพื่อเลื่อนหมุด)
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    พิกัด: {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                  </span>
                </div>

                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const xRatio = (e.clientX - rect.left) / rect.width;
                    const yRatio = (e.clientY - rect.top) / rect.height;
                    setSelectedCoords({
                      lat: +(18.8400 + (1 - yRatio) * 0.0150).toFixed(4),
                      lng: +(98.9600 + xRatio * 0.0200).toFixed(4),
                    });
                  }}
                  className="relative h-44 rounded-xl border border-slate-300 bg-slate-100 overflow-hidden cursor-crosshair group shadow-inner"
                  title="คลิกเพื่อปักหมุดตำแหน่งในเขต อบต."
                >
                  {/* Styled Map Background Representation */}
                  <div className="absolute inset-0 bg-[#e5e9ec] flex flex-col justify-between p-3 select-none">
                    <div className="text-[11px] font-bold text-slate-600">
                      แผนที่เขตรับผิดชอบ องค์การบริหารส่วนตำบลดอนแก้ว
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-400">
                      <div className="p-2 border border-dashed border-slate-300 rounded">ม.1 ดอนแก้ว</div>
                      <div className="p-2 border border-dashed border-slate-300 rounded">ม.2 สันป่าสัก</div>
                      <div className="p-2 border border-dashed border-slate-300 rounded bg-blue-50/50">ม.3 ดอนแก้วพัฒนา</div>
                      <div className="p-2 border border-dashed border-slate-300 rounded">ม.4 ท่าศาลา</div>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>แม่น้ำปิง</span>
                      <span>ถนนสายหลัก เชียงใหม่ - แม่ริม</span>
                    </div>
                  </div>

                  {/* Marker Pin */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center animate-bounce">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="w-3 h-1 bg-black/30 rounded-full mt-1 blur-2xs"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-white/90 text-[10px] px-2 py-1 rounded shadow-xs text-slate-700">
                    คลิกบนแผนที่เพื่อเปลี่ยนจุดปักหมุด
                  </div>
                </div>
              </div>

              {/* Step 4: Urgency & Photo Attachment Simulation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ระดับความเร่งด่วน</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'normal', label: 'ปกติ', color: 'border-slate-300' },
                      { id: 'urgent', label: 'ด่วน', color: 'border-amber-400 text-amber-700' },
                      { id: 'most_urgent', label: 'ด่วนที่สุด (อันตราย)', color: 'border-red-500 text-red-700' },
                    ].map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setRepairUrgency(u.id as any)}
                        className={`flex-1 py-2 text-xs rounded-lg border text-center font-medium transition-all ${
                          repairUrgency === u.id
                            ? 'bg-blue-900 text-white border-blue-900 font-semibold'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">แนบรูปภาพความเสียหาย (ถ่ายภาพจริง)</label>
                  <div className="border border-dashed border-slate-300 rounded-lg p-2.5 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>คลิกเพื่ออัปโหลดภาพ (ได้สูงสุด 3 รูป)</span>
                  </div>
                </div>
              </div>

              {/* Step 5: PDPA Compliance (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562) */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-950 font-heading">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>การคุ้มครองข้อมูลส่วนบุคคล (PDPA) ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  อบต. ขอแจ้งให้ทราบว่า ข้อมูลส่วนบุคคลของท่าน (ได้แก่ ชื่อ-นามสกุล, หมายเลขโทรศัพท์ติดต่อ, ภาพถ่าย และพิกัดสถานที่เกิดเหตุ) จะถูกจัดเก็บและใช้เพื่อวัตถุประสงค์ในการตรวจสอบ ประสานงาน ติดตามผล และดำเนินการซ่อมแซมสาธารณูปโภคตามหน้าที่ขององค์กรปกครองส่วนท้องถิ่นเท่านั้น โดยจะได้รับการคุ้มครองความปลอดภัยตามมาตรฐาน PDPA ไม่มีการเปิดเผยต่อบุคคลภายนอกที่ไม่เกี่ยวข้อง
                </p>
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={pdpaRepairConsent}
                    onChange={(e) => setPdpaRepairConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-800 border-slate-300 focus:ring-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-800 select-none">
                    ข้าพเจ้ารับทราบและยินยอมให้ อบต. จัดเก็บและประมวลผลข้อมูลส่วนบุคคลข้างต้น เพื่อการให้บริการแจ้งซ่อมแซมสาธารณูปโภคตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                ส่งข้อมูลแจ้งซ่อมแซมสาธารณูปโภค
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: SEARCH & TRACK REPAIR TICKET */}
      {activeTab === 'repair_track' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-slate-900 font-heading mb-1 text-center">
              ติดตามสถานะการซ่อมแซมสาธารณูปโภค
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              กรอกรหัสแจ้งเรื่อง (Ticket ID) เช่น RP-2569-0012 หรือ RP-2569-0013 เพื่อดูผลการดำเนินการ
            </p>

            <form onSubmit={handleSearchTicket} className="flex gap-2">
              <input
                type="text"
                placeholder="กรอกรหัส Ticket ID เช่น RP-2569-0012"
                value={searchTicketInput}
                onChange={(e) => setSearchTicketInput(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                ค้นหา
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 justify-center">
              <span>ตัวอย่างรหัสทดสอบ:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchTicketInput('RP-2569-0012');
                  const f = repairs.find(r => r.ticketId === 'RP-2569-0012');
                  if (f) setSearchedRepair(f);
                }}
                className="text-blue-700 underline font-mono"
              >
                RP-2569-0012 (กำลังซ่อม)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setSearchTicketInput('RP-2569-0013');
                  const f = repairs.find(r => r.ticketId === 'RP-2569-0013');
                  if (f) setSearchedRepair(f);
                }}
                className="text-emerald-700 underline font-mono"
              >
                RP-2569-0013 (ซ่อมเสร็จแล้ว มีรูป Before/After)
              </button>
            </div>
          </div>

          {/* Active 5 Repair Queues (สำหรับประชาชนที่จำรหัส Ticket ID ไม่ได้) */}
          <div className="max-w-3xl mx-auto space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>คิวงานแจ้งซ่อมล่าสุดในระบบ (5 คิวล่าสุด - กรณีจำเลข Ticket ไม่ได้)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  ประชาชนสามารถแตะเลือกดูสถานะและภาพถ่ายผลงานได้ทันที
                </p>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium self-start sm:self-auto">
                คิวสาธารณะปัจจุบัน
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {repairs.slice(0, 5).map((rep, index) => {
                const isSelected = searchedRepair?.id === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => {
                      setSearchTicketInput(rep.ticketId);
                      setSearchedRepair(rep);
                      setSearchNotFound(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/90 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#0F2C59] text-amber-300 font-bold font-mono flex items-center justify-center text-xs shrink-0">
                        #{index + 1}
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-blue-900">{rep.ticketId}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({rep.createdAt})</span>
                        </div>
                        <div className="font-semibold text-slate-900 truncate">
                          {rep.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                          <span>{rep.categoryLabel}</span>
                          <span>·</span>
                          <span className="text-slate-600 font-medium truncate">📍 {rep.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                        rep.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        rep.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        rep.status === 'assigned' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rep.status === 'completed' ? '✓ ซ่อมเสร็จแล้ว' :
                         rep.status === 'in_progress' ? '⚙️ กำลังซ่อม' :
                         rep.status === 'assigned' ? '⏳ จ่ายงานช่าง' : '⏳ รอดำเนินการ'}
                      </span>
                      <button
                        type="button"
                        className="px-2.5 py-1 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-[11px] font-medium flex items-center gap-1 shadow-xs whitespace-nowrap"
                      >
                        <Search className="w-3 h-3" />
                        <span>ดูคิวนี้</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {searchNotFound && (
            <div className="max-w-2xl mx-auto p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-center text-sm">
              ไม่พบข้อมูลหมายเลขแจ้งซ่อมนี้ในระบบ กรุณาตรวจสอบรหัส Ticket ID อีกครั้ง
            </div>
          )}

          {/* Searched Result Details */}
          {searchedRepair && (
            <div className="max-w-3xl mx-auto bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-blue-900">{searchedRepair.ticketId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      searchedRepair.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      searchedRepair.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      searchedRepair.status === 'assigned' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {searchedRepair.status === 'completed' ? 'ซ่อมเสร็จสิ้นแล้ว' :
                       searchedRepair.status === 'in_progress' ? 'อยู่ระหว่างดำเนินการซ่อม' :
                       searchedRepair.status === 'assigned' ? 'จ่ายงานให้ช่างแล้ว' : 'รอดำเนินการ'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{searchedRepair.title}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>{searchedRepair.categoryLabel}</span>
                    <span>·</span>
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{searchedRepair.location}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>แจ้งเมื่อ: {searchedRepair.createdAt}</div>
                  {searchedRepair.assignedTo && (
                    <div className="text-slate-700 font-medium mt-1">ช่างผู้รับผิดชอบ: {searchedRepair.assignedTo}</div>
                  )}
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase mb-3">ขั้นตอนการดำเนินงาน</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className={`p-2.5 rounded-lg border ${
                    ['pending', 'assigned', 'in_progress', 'completed'].includes(searchedRepair.status)
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    1. รับเรื่อง
                  </div>
                  <div className={`p-2.5 rounded-lg border ${
                    ['assigned', 'in_progress', 'completed'].includes(searchedRepair.status)
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    2. จ่ายงานช่าง
                  </div>
                  <div className={`p-2.5 rounded-lg border ${
                    ['in_progress', 'completed'].includes(searchedRepair.status)
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    3. กำลังซ่อมแซม
                  </div>
                  <div className={`p-2.5 rounded-lg border ${
                    searchedRepair.status === 'completed'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    4. ซ่อมเสร็จสมบูรณ์
                  </div>
                </div>
              </div>

              {/* Technician Notes */}
              {searchedRepair.technicianNotes && (
                <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    บันทึกการทำงานของช่าง:
                  </div>
                  <p className="leading-relaxed">{searchedRepair.technicianNotes}</p>
                </div>
              )}

              {/* Before & After Photos (Proof of Work) */}
              {(searchedRepair.beforeImages.length > 0 || searchedRepair.afterImages.length > 0) && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase">
                    ภาพถ่ายเปรียบเทียบก่อน-หลังการซ่อมแซม (Before / After)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchedRepair.beforeImages[0] && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <div className="text-[11px] font-semibold text-slate-500 mb-1">ภาพถ่ายขณะชำรุด (ก่อนซ่อม)</div>
                        <img
                          src={searchedRepair.beforeImages[0]}
                          alt="Before repair"
                          className="w-full h-40 object-cover rounded"
                        />
                      </div>
                    )}
                    {searchedRepair.afterImages[0] ? (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <div className="text-[11px] font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ภาพถ่ายเมื่อซ่อมเสร็จสิ้น (หลังซ่อม)
                        </div>
                        <img
                          src={searchedRepair.afterImages[0]}
                          alt="After repair"
                          className="w-full h-40 object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="bg-white p-2 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs h-48">
                        <Clock className="w-6 h-6 mb-1 text-slate-300" />
                        <span>อยู่ระหว่างช่างเข้าดำเนินการ</span>
                        <span className="text-[10px]">จะอัปโหลดภาพหลังซ่อมเสร็จ</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Used Materials (Transparency) */}
              {searchedRepair.materialsUsed.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900 mb-2">วัสดุและอุปกรณ์ที่ใช้ในการซ่อมแซม:</div>
                  <div className="divide-y divide-slate-100">
                    {searchedRepair.materialsUsed.map(m => (
                      <div key={m.id} className="py-1.5 flex justify-between">
                        <span>{m.name}</span>
                        <span className="font-mono text-slate-600">{m.quantity} {m.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: E-PERMIT CITIZEN APPLICATION */}
      {activeTab === 'permit_apply' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {createdPermitAppNo ? (
            <div className="max-w-xl mx-auto text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                ยื่นคำขอรับใบอนุญาตเรียบร้อยแล้ว
              </h2>
              <p className="text-sm text-slate-600">
                คำขอของท่านได้เข้าสู่ระบบของ <strong>{selectedPermitType.responsibleDept}</strong> แล้ว จะเข้าสู่กระบวนการตรวจสอบเอกสารและเสนอลงนาม 2 ขั้นตอน
              </p>
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl inline-block">
                <div className="text-xs text-slate-500 uppercase font-mono">เลขที่คำขอ (Application No.)</div>
                <div className="text-2xl font-bold text-blue-900 font-mono tracking-wider mt-1">
                  {createdPermitAppNo}
                </div>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchPermitInput(createdPermitAppNo);
                    setActiveTab('permit_track');
                    setSearchedPermit(permitRequests.find(p => p.applicationNo === createdPermitAppNo) || null);
                  }}
                  className="px-5 py-2.5 bg-blue-800 text-white font-medium rounded-lg text-sm hover:bg-blue-900 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  ติดตามคำขอนี้ทันที
                </button>
                <button
                  onClick={() => setCreatedPermitAppNo(null)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
                >
                  ยื่นคำขอประเภทอื่น
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePermitSubmit} className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">ยื่นขอใบอนุญาตออนไลน์ (E-License Application)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  เลือกประเภทใบอนุญาตที่ต้องการ กรอกข้อมูล และแนบไฟล์เอกสารหลักฐาน
                </p>
              </div>

              {/* Select Permit Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">เลือกประเภทใบอนุญาตที่ต้องการขอรับ *</label>
                <select
                  value={selectedPermitType?.id}
                  onChange={(e) => {
                    const found = permitTypes.find(p => p.id === e.target.value);
                    if (found) setSelectedPermitType(found);
                  }}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                >
                  {permitTypes.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} ({p.responsibleDept})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-blue-700 mt-1.5 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                  {selectedPermitType.description} · ค่าธรรมเนียม {selectedPermitType.fee} บาท · ระยะเวลาพิจารณา {selectedPermitType.processingDays} วันทำการ
                </p>
              </div>

              {/* Citizen Personal Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  ข้อมูลผู้ขอรับใบอนุญาต
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น นางสมศรี มีสุข"
                      value={permitCitizenName}
                      onChange={(e) => setPermitCitizenName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">เลขประจำตัวประชาชน (13 หลัก) *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น 3-5099-00123-45-6"
                      value={permitCitizenId}
                      onChange={(e) => setPermitCitizenId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 089-776-5544"
                      value={permitCitizenPhone}
                      onChange={(e) => setPermitCitizenPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ที่อยู่ตามทะเบียนบ้าน *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น 45/2 หมู่ที่ 3 ต.ดอนแก้ว"
                      value={permitCitizenAddress}
                      onChange={(e) => setPermitCitizenAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Form Fields Rendered from Admin Builder */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
                  <span>ข้อมูลเฉพาะสำหรับ {selectedPermitType.name}</span>
                  <span className="text-[10px] text-blue-600 font-mono">Dynamic Fields</span>
                </div>

                <div className="space-y-3">
                  {selectedPermitType.fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          required={field.required}
                          value={permitDynamicValues[field.name] || ''}
                          onChange={(e) => setPermitDynamicValues({ ...permitDynamicValues, [field.name]: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                        >
                          <option value="">-- กรุณาเลือก --</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : field.type === 'radio' ? (
                        <div className="flex gap-4">
                          {field.options?.map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-700">
                              <input
                                type="radio"
                                name={field.name}
                                value={opt}
                                checked={permitDynamicValues[field.name] === opt}
                                onChange={(e) => setPermitDynamicValues({ ...permitDynamicValues, [field.name]: e.target.value })}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          required={field.required}
                          placeholder={field.placeholder}
                          value={permitDynamicValues[field.name] || ''}
                          onChange={(e) => setPermitDynamicValues({ ...permitDynamicValues, [field.name]: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Upload Checklist */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  เอกสารหลักฐานที่ต้องแนบประกอบคำขอ
                </div>
                <div className="space-y-2">
                  {selectedPermitType.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <span className="text-slate-700">{doc}</span>
                      <button
                        type="button"
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1 text-[11px]"
                      >
                        <Upload className="w-3 h-3" /> แนบไฟล์ (PDF/JPG)
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PDPA Compliance Section (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562) */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 font-heading">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>การคุ้มครองข้อมูลส่วนบุคคล (PDPA Consent) ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  อบต. ขอแจ้งให้ทราบว่า ข้อมูลส่วนบุคคลของท่าน รวมถึงเลขประจำตัวประชาชน 13 หลัก, ที่อยู่, ข้อมูลคำขอ และสำเนาเอกสารหลักฐานที่แนบมา จะถูกนำไปใช้เพื่อวัตถุประสงค์ในการตรวจสอบคุณสมบัติ การพิจารณาอนุมัติออกใบอนุญาตตามอำนาจหน้าที่ขององค์กรปกครองส่วนท้องถิ่น และการจัดทำทะเบียนควบคุมตามระเบียบราชการเท่านั้น โดยมีมาตรการรักษาความลับและความมั่นคงปลอดภัยของข้อมูลตามมาตรฐานกฎหมาย
                </p>
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={pdpaPermitConsent}
                    onChange={(e) => setPdpaPermitConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-800 border-slate-300 focus:ring-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-800 select-none">
                    ข้าพเจ้าได้อ่านและยินยอมให้ อบต. เก็บรวบรวม ใช้ และประมวลผลข้อมูลส่วนบุคคลและเอกสารหลักฐานเพื่อการยื่นคำขอรับใบอนุญาตตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                ยื่นคำขอรับใบอนุญาตออนไลน์
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 4: PERMIT TRACKING & DOWNLOAD E-LICENSE */}
      {activeTab === 'permit_track' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-slate-900 font-heading mb-1 text-center">
              ค้นหาและติดตามคำขอใบอนุญาตออนไลน์
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              กรอกเลขที่คำขอ (Application No.) เช่น PM-2569-0045 หรือ PM-2569-0046 เพื่อดูผลการอนุมัติและดาวน์โหลดใบอนุญาต
            </p>

            <form onSubmit={handleSearchPermit} className="flex gap-2">
              <input
                type="text"
                placeholder="กรอกเลขที่คำขอ เช่น PM-2569-0046"
                value={searchPermitInput}
                onChange={(e) => setSearchPermitInput(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                ค้นหา
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 justify-center">
              <span>ตัวอย่างคำขอทดสอบ:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchPermitInput('PM-2569-0045');
                  const p = permitRequests.find(x => x.applicationNo === 'PM-2569-0045');
                  if (p) setSearchedPermit(p);
                }}
                className="text-blue-700 underline font-mono"
              >
                PM-2569-0045 (รอผู้บริหารอนุมัติขั้น 2)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setSearchPermitInput('PM-2569-0046');
                  const p = permitRequests.find(x => x.applicationNo === 'PM-2569-0046');
                  if (p) setSearchedPermit(p);
                }}
                className="text-emerald-700 underline font-mono font-bold"
              >
                PM-2569-0046 (อนุมัติแล้ว - พร้อมดาวน์โหลดใบอนุญาต)
              </button>
            </div>
          </div>

          {permitSearchNotFound && (
            <div className="max-w-2xl mx-auto p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-center text-sm">
              ไม่พบข้อมูลคำขอใบอนุญาตหมายเลขนี้ กรุณาตรวจสอบเลขที่คำขออีกครั้ง
            </div>
          )}

          {/* Searched Permit Card */}
          {searchedPermit && (
            <div className="max-w-3xl mx-auto bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-blue-900">{searchedPermit.applicationNo}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      searchedPermit.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      searchedPermit.status === 'step1_reviewed' ? 'bg-blue-100 text-blue-800' :
                      searchedPermit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {searchedPermit.status === 'approved' ? 'อนุมัติเรียบร้อยแล้ว' :
                       searchedPermit.status === 'step1_reviewed' ? 'หัวหน้ากองเห็นชอบแล้ว (รอผู้บริหารลงนาม)' :
                       searchedPermit.status === 'rejected' ? 'ไม่อนุมัติ' : 'ยื่นคำขอแล้ว (รอกองงานตรวจ)'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{searchedPermit.permitTypeName}</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    ผู้ยื่นคำขอ: {searchedPermit.citizenName} ({searchedPermit.citizenPhone})
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div>ยื่นคำขอเมื่อ: {searchedPermit.submittedAt}</div>
                  {searchedPermit.electronicLicenseNo && (
                    <div className="text-emerald-700 font-bold font-mono mt-1">
                      เลขที่ใบอนุญาต: {searchedPermit.electronicLicenseNo}
                    </div>
                  )}
                </div>
              </div>

              {/* 2-Step Approval Progress Trail */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase">ขั้นตอนการอนุมัติ 2 ระดับ (2-Step Approval)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className={`p-3 rounded-lg border ${
                    searchedPermit.step1Reviewer ? 'bg-white border-blue-200' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div className="font-bold text-blue-900 flex items-center justify-between">
                      <span>ขั้นที่ 1: หัวหน้าส่วนราชการ/กอง</span>
                      {searchedPermit.step1Reviewer && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    {searchedPermit.step1Reviewer ? (
                      <div className="mt-1 space-y-1 text-slate-600">
                        <div>ผู้ตรวจสอบ: {searchedPermit.step1Reviewer}</div>
                        <div className="italic text-slate-700">"{searchedPermit.step1Comment}"</div>
                        <div className="text-[10px] text-slate-400">เมื่อ: {searchedPermit.step1ApprovedAt}</div>
                      </div>
                    ) : (
                      <div className="mt-1 text-slate-400">อยู่ระหว่างกองงานตรวจสอบความถูกต้อง</div>
                    )}
                  </div>

                  {/* Step 2 */}
                  <div className={`p-3 rounded-lg border ${
                    searchedPermit.step2Reviewer ? 'bg-white border-emerald-200' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>ขั้นที่ 2: ปลัด / นายก อบต. (ลงนาม)</span>
                      {searchedPermit.step2Reviewer && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    {searchedPermit.step2Reviewer ? (
                      <div className="mt-1 space-y-1 text-slate-600">
                        <div>ผู้ลงนามอนุมัติ: {searchedPermit.step2Reviewer}</div>
                        <div className="italic text-slate-700">"{searchedPermit.step2Comment}"</div>
                        <div className="text-[10px] text-slate-400">เมื่อ: {searchedPermit.step2ApprovedAt}</div>
                      </div>
                    ) : (
                      <div className="mt-1 text-slate-400">รอเสนอผู้บริหารลงนาม</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Electronic License Certificate View (When Approved) */}
              {searchedPermit.status === 'approved' && (
                <div className="bg-amber-50/60 border-2 border-amber-300 rounded-xl p-5 text-center space-y-3 shadow-xs">
                  <div className="inline-block p-2 bg-amber-100 rounded-full text-amber-800">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      ใบอนุญาตอิเล็กทรอนิกส์ (E-License Certificate)
                    </div>
                    <div className="font-bold text-base text-slate-900 mt-1">
                      {searchedPermit.permitTypeName}
                    </div>
                    <div className="font-mono text-sm text-blue-900 font-bold mt-0.5">
                      เลขที่: {searchedPermit.electronicLicenseNo}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    ใบอนุญาตฉบับนี้ออกโดยระบบอิเล็กทรอนิกส์ของ {siteSettings.saoName} มีผลสมบูรณ์ตาม พ.ร.บ. การปฏิบัติราชการทางอิเล็กทรอนิกส์ พ.ศ. 2565
                  </p>
                  <button
                    onClick={() => alert(`จำลองการพิมพ์/ดาวน์โหลดเอกสารใบอนุญาตเลขที่: ${searchedPermit.electronicLicenseNo}`)}
                    className="px-5 py-2 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    พิมพ์ / ดาวน์โหลดใบอนุญาตอิเล็กทรอนิกส์ (PDF)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Internal Staff Gateway Notice */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">ช่องทางเข้าใช้งานสำหรับเจ้าหน้าที่ อบต. (Intranet Portal)</h4>
            <p className="text-xs text-slate-500">
              ระบบสารบรรณกลาง, จัดการงานช่าง, อนุมัติคำขอ, ระบบลา และจัดการสิทธิ์ผู้ใช้งาน
            </p>
          </div>
        </div>
        <button
          onClick={onSwitchToIntranet}
          className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>เข้าสู่ระบบ Intranet เจ้าหน้าที่</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
