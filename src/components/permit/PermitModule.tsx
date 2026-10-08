import React, { useState } from 'react';
import { 
  PermitType, 
  PermitRequest, 
  User, 
  PermitFieldConfig,
  Department
} from '../../types';
import { 
  FileCheck, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Car, 
  Users, 
  Briefcase, 
  Settings2, 
  Trash2, 
  Check, 
  X, 
  Download,
  Building2,
  FileText,
  ShieldCheck
} from 'lucide-react';

interface Props {
  permitTypes: PermitType[];
  permitRequests: PermitRequest[];
  currentUser: User;
  departments: Department[];
  onUpdatePermitRequest: (req: PermitRequest) => void;
  onAddPermitType: (pt: PermitType) => void;
  fiscalYear: number;
}

export const PermitModule: React.FC<Props> = ({
  permitTypes,
  permitRequests,
  currentUser,
  departments,
  onUpdatePermitRequest,
  onAddPermitType,
  fiscalYear,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'builder' | 'internal_requests'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReqForReview, setSelectedReqForReview] = useState<PermitRequest | null>(null);

  // Review & Approval Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  // Dynamic Form Builder State (Admin)
  const [isNewPermitTypeModalOpen, setIsNewPermitTypeModalOpen] = useState(false);
  const [newPermitCode, setNewPermitCode] = useState('');
  const [newPermitName, setNewPermitName] = useState('');
  const [newPermitDesc, setNewPermitDesc] = useState('');
  const [newPermitDept, setNewPermitDept] = useState(departments[0]?.name || 'กองช่าง');
  const [newPermitFee, setNewPermitFee] = useState('0');
  const [newPermitDays, setNewPermitDays] = useState('7');
  const [builderFields, setBuilderFields] = useState<PermitFieldConfig[]>([
    { id: 'f-init-1', name: 'targetLocation', label: 'สถานที่หรือจุดที่จะดำเนินการ', type: 'text', required: true, placeholder: 'ระบุตำแหน่ง' }
  ]);
  const [builderDocs, setBuilderDocs] = useState<string[]>([
    'สำเนาบัตรประจำตัวประชาชน',
    'สำเนาทะเบียนบ้าน',
  ]);

  // Temp field adder
  const [tempFieldLabel, setTempFieldLabel] = useState('');
  const [tempFieldType, setTempFieldType] = useState<'text' | 'number' | 'select' | 'radio'>('text');
  const [tempFieldOptions, setTempFieldOptions] = useState('');
  const [tempFieldRequired, setTempFieldRequired] = useState(true);
  const [tempDocName, setTempDocName] = useState('');

  // Internal Vehicle / Meeting Room Mock State
  const [internalBookings, setInternalBookings] = useState([
    { id: 'b-1', type: 'vehicle', title: 'ขอใช้รถตู้ส่วนกลาง (กข 9912 เชียงใหม่)', requester: 'นายสมชาย วงศ์สุข', date: '2026-10-15', destination: 'ศูนย์ประชุมนานาชาติเชียงใหม่', status: 'approved' },
    { id: 'b-2', type: 'room', title: 'ขอใช้ห้องประชุมสภา อบต. (ชั้น 3)', requester: 'นางสุดา เพียรเรียน', date: '2026-10-18 (09:00 - 12:00)', destination: 'จัดประชุมคณะกรรมการการศึกษา', status: 'approved' },
    { id: 'b-3', type: 'travel', title: 'ขออนุมัติเดินทางไปราชการฝึกอบรม ITA', requester: 'นางวิไล พัฒนากิจ', date: '2026-10-22 - 2026-10-24', destination: 'โรงแรมเชียงใหม่แกรนด์วิว', status: 'pending' },
  ]);

  const canStep1Review = currentUser.role === 'dept_head' || currentUser.role === 'super_admin' || currentUser.modules.permitReview;
  const canStep2Approve = currentUser.role === 'executive' || currentUser.role === 'super_admin' || currentUser.modules.permitApprove;
  const canBuildForms = currentUser.role === 'super_admin' || currentUser.modules.cmsAdmin;

  // Filtered Requests
  const filteredRequests = permitRequests.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    return !q ||
      r.applicationNo.toLowerCase().includes(q) ||
      r.citizenName.toLowerCase().includes(q) ||
      r.permitTypeName.toLowerCase().includes(q);
  });

  // Handle Step 1 Approval (Head of Division)
  const handleApproveStep1 = () => {
    if (!selectedReqForReview) return;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const updated: PermitRequest = {
      ...selectedReqForReview,
      status: 'step1_reviewed',
      step1Reviewer: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName} (${currentUser.position})`,
      step1Comment: reviewComment || 'ตรวจสอบเอกสารหลักฐานและคุณสมบัติถูกต้องครบถ้วน เห็นควรเสนอผู้บริหารลงนามอนุมัติ',
      step1ApprovedAt: now,
    };

    onUpdatePermitRequest(updated);
    setSelectedReqForReview(updated);
    setIsReviewModalOpen(false);
    setReviewComment('');
  };

  // Handle Step 2 Final Approval (Executive: Palad / Mayor)
  const handleApproveStep2 = () => {
    if (!selectedReqForReview) return;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const licenseNo = `อบต.ดก-${selectedReqForReview.permitTypeId.slice(0, 3)}/${fiscalYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updated: PermitRequest = {
      ...selectedReqForReview,
      status: 'approved',
      step2Reviewer: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName} (${currentUser.position})`,
      step2Comment: reviewComment || 'อนุมัติออกใบอนุญาตอิเล็กทรอนิกส์ตามระเบียบ',
      step2ApprovedAt: now,
      electronicLicenseNo: licenseNo,
    };

    onUpdatePermitRequest(updated);
    setSelectedReqForReview(updated);
    setIsReviewModalOpen(false);
    setReviewComment('');
  };

  // Add field to builder
  const handleAddFieldToBuilder = () => {
    if (!tempFieldLabel) return;
    const newField: PermitFieldConfig = {
      id: `f-${Date.now()}`,
      name: `field_${Date.now()}`,
      label: tempFieldLabel,
      type: tempFieldType,
      required: tempFieldRequired,
      options: tempFieldOptions ? tempFieldOptions.split(',').map(s => s.trim()) : undefined,
    };
    setBuilderFields([...builderFields, newField]);
    setTempFieldLabel('');
    setTempFieldOptions('');
  };

  // Add doc to builder
  const handleAddDocToBuilder = () => {
    if (!tempDocName) return;
    setBuilderDocs([...builderDocs, tempDocName]);
    setTempDocName('');
  };

  // Save new permit type
  const handleSavePermitType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermitName || !newPermitCode) return;

    const newPT: PermitType = {
      id: `perm-${newPermitCode.toLowerCase()}-${Date.now()}`,
      code: newPermitCode,
      name: newPermitName,
      description: newPermitDesc,
      responsibleDept: newPermitDept,
      processingDays: parseInt(newPermitDays, 10) || 7,
      fee: parseFloat(newPermitFee) || 0,
      isActive: true,
      requiredDocuments: builderDocs,
      fields: builderFields,
    };

    onAddPermitType(newPT);
    setIsNewPermitTypeModalOpen(false);
    alert(`สร้างแบบฟอร์มใบอนุญาตใหม่ "${newPermitName}" เรียบร้อยแล้ว พร้อมเปิดให้ประชาชนยื่นออนไลน์ทันที!`);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              ระบบขอใบอนุญาตออนไลน์ & คำขอภายใน (E-Permit & Permissions)
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
              อนุมัติ 2 ขั้นตอน (หัวหน้ากอง ➔ ปลัด/นายก)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            พิจารณาคำขอใบอนุญาตประชาชน, ระบบ Dynamic Form Builder สำหรับ Admin, และคำขอใช้รถยนต์ส่วนกลาง/ห้องประชุม
          </p>
        </div>

        {canBuildForms && (
          <button
            onClick={() => setIsNewPermitTypeModalOpen(true)}
            className="px-3.5 py-2 bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Settings2 className="w-4 h-4 text-amber-300" />
            <span>สร้างแบบฟอร์มใบอนุญาตใหม่ (Admin Form Builder)</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl p-1 gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>คำขอใบอนุญาตของประชาชน ({permitRequests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'builder'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>ประเภทใบอนุญาต & Dynamic Fields ({permitTypes.length} แบบ)</span>
        </button>
        <button
          onClick={() => setActiveTab('internal_requests')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'internal_requests'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>ขอใช้รถยนต์ส่วนกลาง / ห้องประชุม / ไปราชการ</span>
        </button>
      </div>

      {/* TAB 1: CITIZEN PERMIT REQUESTS (2-STEP APPROVAL BACK-OFFICE) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่คำขอ, ชื่อผู้ขอ, หรือประเภทใบอนุญาต..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div className="text-slate-500">
              สถานะ: รอพิจารณา / เห็นชอบแล้ว / ออกใบอนุญาตแล้ว
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">เลขที่คำขอ</th>
                    <th className="p-3.5">ประเภทใบอนุญาต</th>
                    <th className="p-3.5">ผู้ขออนุญาต</th>
                    <th className="p-3.5">วันที่ยื่น</th>
                    <th className="p-3.5">สถานะ</th>
                    <th className="p-3.5">ความคืบหน้า 2-Step</th>
                    <th className="p-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {req.applicationNo}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{req.permitTypeName}</div>
                        {req.electronicLicenseNo && (
                          <div className="text-[10px] text-emerald-700 font-mono">
                            เลขที่ใบอนุญาต: {req.electronicLicenseNo}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{req.citizenName}</div>
                        <div className="text-[10px] text-slate-400">{req.citizenPhone}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono">
                        {req.submittedAt}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'step1_reviewed' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'approved' ? 'อนุมัติแล้ว' :
                           req.status === 'step1_reviewed' ? 'หัวหน้ากองเห็นชอบ' :
                           req.status === 'rejected' ? 'ไม่อนุมัติ' : 'ยื่นคำขอใหม่'}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded ${req.step1Reviewer ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                            1. กองงาน
                          </span>
                          <span>➔</span>
                          <span className={`px-1.5 py-0.5 rounded ${req.step2Reviewer ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                            2. ปลัด/นายก
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedReqForReview(req);
                            setIsReviewModalOpen(true);
                          }}
                          className="px-3 py-1 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-medium"
                        >
                          ตรวจและลงนาม
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

      {/* TAB 2: DYNAMIC FORM BUILDER (ADMIN VIEW) */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 font-heading mb-2">
              แบบฟอร์มใบอนุญาตที่เปิดให้บริการในระบบ (Dynamic Forms)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ผู้ดูแลระบบสามารถปรับแต่งฟีลด์คำถาม, ข้อกำหนดเอกสารแนบ, และเพิ่มประเภทใบอนุญาตใหม่ได้ทันทีโดยไม่ต้องแก้ไขโค้ด
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permitTypes.map((pt) => (
                <div key={pt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                        [{pt.code}] {pt.responsibleDept}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{pt.name}</h4>
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      เปิดใช้งาน
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{pt.description}</p>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                    <div><strong>ฟีลด์ข้อมูลเฉพาะ ({pt.fields.length} ช่อง):</strong> {pt.fields.map(f => f.label).join(', ')}</div>
                    <div><strong>เอกสารบังคับแนบ ({pt.requiredDocuments.length} รายการ):</strong> {pt.requiredDocuments.slice(0, 2).join(', ')}...</div>
                    <div className="flex justify-between pt-1 font-mono text-[10px]">
                      <span>ค่าธรรมเนียม: {pt.fee} บาท</span>
                      <span>ระยะเวลาพิจารณา: {pt.processingDays} วันทำการ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERNAL REQUESTS (VEHICLE / ROOM / TRAVEL) */}
      {activeTab === 'internal_requests' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">
                ระบบขออนุญาตภายในองค์กร (รถยนต์ / ห้องประชุม / ไปราชการ)
              </h3>
              <p className="text-xs text-slate-500">
                ยื่นขอใช้ทรัพยากรส่วนกลางของ อบต. และติดตามผลการอนุมัติ
              </p>
            </div>
            <button
              onClick={() => alert('จำลองการเปิดฟอร์มขอใช้รถยนต์ส่วนกลาง/ขอใช้ห้องประชุม')}
              className="px-3.5 py-2 bg-blue-800 text-white rounded-lg text-xs font-bold"
            >
              + ยื่นขอใช้ทรัพยากรใหม่
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {internalBookings.map((b) => (
              <div key={b.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    b.type === 'vehicle' ? 'bg-amber-50 text-amber-700' :
                    b.type === 'room' ? 'bg-indigo-50 text-indigo-700' :
                    'bg-emerald-50 text-emerald-700'
                  }`}>
                    {b.type === 'vehicle' ? <Car className="w-5 h-5" /> :
                     b.type === 'room' ? <Users className="w-5 h-5" /> :
                     <Briefcase className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{b.title}</div>
                    <div className="text-slate-500 mt-0.5">
                      ผู้ขอ: {b.requester} · วัตถุประสงค์/เป้าหมาย: {b.destination}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">กำหนดการ: {b.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-medium ${
                    b.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {b.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: 2-STEP REVIEW & APPROVAL MODAL */}
      {isReviewModalOpen && selectedReqForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm font-heading">พิจารณาคำขอรับใบอนุญาต ({selectedReqForReview.applicationNo})</h3>
                <p className="text-xs text-blue-200">{selectedReqForReview.permitTypeName}</p>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Citizen Details */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">ข้อมูลผู้ยื่นคำขอ</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>ชื่อ: {selectedReqForReview.citizenName}</div>
                  <div>เลขบัตรประชาชน: {selectedReqForReview.citizenIdCard}</div>
                  <div>โทร: {selectedReqForReview.citizenPhone}</div>
                  <div>ที่อยู่: {selectedReqForReview.citizenAddress}</div>
                  <div className="col-span-2 pt-1 border-t border-slate-200 text-emerald-700 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PDPA Consent: ประชาชนยินยอมให้ประมวลผลข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</span>
                  </div>
                </div>
              </div>

              {/* Submitted Dynamic Form Data */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 mb-1">ข้อมูลรายละเอียดตามแบบคำขอ</div>
                {Object.entries(selectedReqForReview.formData).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-700 py-0.5">
                    <span className="text-slate-500 font-medium">{k}:</span>
                    <span className="font-semibold text-slate-900">{String(v)}</span>
                  </div>
                ))}
              </div>

              {/* Attached Docs Checklist */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 mb-1">เอกสารหลักฐานที่แนบมา</div>
                <div className="space-y-1">
                  {selectedReqForReview.attachedDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{doc.name} (ตรวจสอบไฟล์แล้ว)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Trail Review */}
              {selectedReqForReview.step1Reviewer && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-950">
                  <div className="font-bold">ผลการตรวจขั้นที่ 1 (หัวหน้ากอง):</div>
                  <div className="mt-0.5">ผู้ตรวจ: {selectedReqForReview.step1Reviewer}</div>
                  <div className="italic">ความเห็น: "{selectedReqForReview.step1Comment}"</div>
                  <div className="text-[10px] text-blue-700 mt-1">อนุมัติเมื่อ: {selectedReqForReview.step1ApprovedAt}</div>
                </div>
              )}

              {/* Comment Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ความเห็น / ข้อสั่งการ *</label>
                <textarea
                  rows={2}
                  placeholder="ระบุความเห็นของท่าน..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              {/* Action Buttons Depending on User Role */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  ปิด
                </button>

                {/* Step 1 Approval Button (Head of Division) */}
                {canStep1Review && selectedReqForReview.status === 'submitted' && (
                  <button
                    type="button"
                    onClick={handleApproveStep1}
                    className="px-4 py-1.5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"
                  >
                    เห็นชอบ (ผ่านขั้นที่ 1 เสนอผู้บริหาร)
                  </button>
                )}

                {/* Step 2 Approval Button (Executive Palad/Mayor) */}
                {canStep2Approve && selectedReqForReview.status === 'step1_reviewed' && (
                  <button
                    type="button"
                    onClick={handleApproveStep2}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    ลงนามอนุมัติออกใบอนุญาต (ขั้นสุดท้าย)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DYNAMIC FORM BUILDER (ADMIN) */}
      {isNewPermitTypeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm font-heading">สร้างแบบฟอร์มใบอนุญาตใหม่ (Dynamic Form Builder)</h3>
              </div>
              <button onClick={() => setIsNewPermitTypeModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePermitType} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัสประเภท (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น B-05 หรือ S-01"
                    value={newPermitCode}
                    onChange={(e) => setNewPermitCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">กองงานที่รับผิดชอบ *</label>
                  <select
                    value={newPermitDept}
                    onChange={(e) => setNewPermitDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อประเภทใบอนุญาต *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คำขออนุญาตติดตั้งป้ายโฆษณาในที่สาธารณะ"
                  value={newPermitName}
                  onChange={(e) => setNewPermitName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">คำอธิบายและข้อกำหนดทางกฎหมาย</label>
                <textarea
                  rows={2}
                  placeholder="ระบุ พ.ร.บ. หรือระเบียบที่เกี่ยวข้อง..."
                  value={newPermitDesc}
                  onChange={(e) => setNewPermitDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              {/* Dynamic Field Builder Sub-section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900">1. เพิ่มฟีลด์ข้อมูลคำถามในแบบฟอร์ม (Form Fields)</div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="ป้ายชื่อฟีลด์ (เช่น ขนาดป้าย)"
                    value={tempFieldLabel}
                    onChange={(e) => setTempFieldLabel(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded outline-none"
                  />
                  <select
                    value={tempFieldType}
                    onChange={(e) => setTempFieldType(e.target.value as any)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded outline-none"
                  >
                    <option value="text">ข้อความสั้น (Text)</option>
                    <option value="number">ตัวเลข (Number)</option>
                    <option value="select">ตัวเลือกแบบ Dropdown</option>
                    <option value="radio">ตัวเลือกแบบ Radio</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddFieldToBuilder}
                    className="px-3 py-1.5 bg-blue-700 text-white rounded font-medium hover:bg-blue-800"
                  >
                    + เพิ่มฟีลด์
                  </button>
                </div>

                {/* Configured fields list */}
                <div className="space-y-1">
                  {builderFields.map((f, i) => (
                    <div key={f.id} className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center text-slate-700">
                      <span>{i + 1}. {f.label} <span className="text-slate-400 font-mono">({f.type})</span></span>
                      <button
                        type="button"
                        onClick={() => setBuilderFields(builderFields.filter(x => x.id !== f.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Checklist Builder */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900">2. กำหนดเอกสารหลักฐานที่ต้องแนบ (Required Attachments)</div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ชื่อเอกสารที่บังคับแนบ เช่น ภาพถ่ายสถานที่ หรือ แบบจำลอง"
                    value={tempDocName}
                    onChange={(e) => setTempDocName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocToBuilder}
                    className="px-3 py-1.5 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 shrink-0"
                  >
                    + เพิ่มเอกสาร
                  </button>
                </div>

                <div className="space-y-1">
                  {builderDocs.map((doc, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center text-slate-700">
                      <span>• {doc}</span>
                      <button
                        type="button"
                        onClick={() => setBuilderDocs(builderDocs.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewPermitTypeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"
                >
                  บันทึกแบบฟอร์มและเปิดใช้งาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
