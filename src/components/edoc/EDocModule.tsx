import React, { useState } from 'react';
import { 
  EDocument, 
  User, 
  Department, 
  DocumentType, 
  UrgencyLevel, 
  DocStatus,
  DocumentAuditLog
} from '../../types';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit3, 
  Send, 
  CheckCircle2, 
  Clock, 
  Paperclip, 
  ShieldAlert, 
  ArrowRight, 
  History, 
  Check, 
  X,
  FileDown,
  Building,
  Eye,
  Filter
} from 'lucide-react';

interface Props {
  documents: EDocument[];
  currentUser: User;
  departments: Department[];
  onAddDocument: (doc: EDocument) => void;
  onUpdateDocument: (doc: EDocument) => void;
  fiscalYear: number;
}

export const EDocModule: React.FC<Props> = ({
  documents,
  currentUser,
  departments,
  onAddDocument,
  onUpdateDocument,
  fiscalYear,
}) => {
  const [activeFilterType, setActiveFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocForDetail, setSelectedDocForDetail] = useState<EDocument | null>(documents[0] || null);

  // Modal States
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isOverrideNumberModalOpen, setIsOverrideNumberModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isPreviewAttachmentOpen, setIsPreviewAttachmentOpen] = useState<string | null>(null);

  // New Doc Form
  const [docType, setDocType] = useState<DocumentType>('incoming');
  const [bookNumber, setBookNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [sourceAgency, setSourceAgency] = useState('');
  const [recipient, setRecipient] = useState(''); // ส่งถึง / เสนอถึง เว้นว่างเพื่อกรอก
  const [destinationDeptId, setDestinationDeptId] = useState(departments[0]?.id || '');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');

  // Override Number Form
  const [overrideTargetDoc, setOverrideTargetDoc] = useState<EDocument | null>(null);
  const [newReceiveNumber, setNewReceiveNumber] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  // Dispatch Form
  const [dispatchTargetDeptId, setDispatchTargetDeptId] = useState(departments[1]?.id || '');
  const [dispatchNote, setDispatchNote] = useState('');

  // Permission Check
  const canRegisterCentral = currentUser.role === 'central_registry' || currentUser.role === 'super_admin' || currentUser.modules.centralRegistry;
  const canOverrideNumber = currentUser.role === 'central_registry' || currentUser.role === 'super_admin';

  // Calculate Next Auto-running Number
  const nextRunningNumber = () => {
    const currentMax = documents.reduce((max, d) => {
      const match = d.receiveNumber.match(/^(\d+)\//);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 430);
    const nextVal = currentMax + 1;
    return `${String(nextVal).padStart(4, '0')}/${fiscalYear}`;
  };

  // Filtered Documents
  const filteredDocs = documents.filter((doc) => {
    const matchesType = activeFilterType === 'all' || doc.docType === activeFilterType;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      doc.subject.toLowerCase().includes(query) ||
      doc.bookNumber.toLowerCase().includes(query) ||
      doc.receiveNumber.toLowerCase().includes(query) ||
      doc.sourceAgency.toLowerCase().includes(query) ||
      doc.currentDeptName.toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });

  // Handle Create New Document
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRegisterCentral) {
      alert('ขออภัย เฉพาะเจ้าหน้าที่สารบรรณกลาง (สำนักปลัด) หรือผู้ดูแลระบบเท่านั้นที่มีสิทธิ์ลงทะเบียนรับหนังสือ');
      return;
    }

    const autoNum = nextRunningNumber();
    const destDept = departments.find(d => d.id === destinationDeptId);

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newDoc: EDocument = {
      id: `doc-${Date.now()}`,
      docType,
      bookNumber,
      receiveNumber: autoNum,
      fiscalYear,
      subject,
      sourceAgency,
      destinationDeptId,
      recipient: recipient.trim(),
      urgency,
      secretLevel: 'normal',
      registeredDate: now,
      registeredBy: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName} (${currentUser.position})`,
      currentStatus: 'central_received',
      currentDeptName: destDept?.name || 'สำนักปลัด อบต. (สารบรรณกลาง)',
      attachments: [
        { id: `att-${Date.now()}-1`, name: 'เอกสารต้นฉบับ_สแกน.pdf', size: '1.8 MB', type: 'application/pdf', url: '#' },
      ],
      history: [
        {
          id: `log-${Date.now()}`,
          documentId: `doc-${Date.now()}`,
          action: 'ลงรับหนังสือสารบรรณกลาง',
          detail: `ลงทะเบียนรับหนังสืออัตโนมัติ เลขที่ ${autoNum} ประจำปีงบประมาณ ${fiscalYear}${recipient ? ` (ส่งถึง: ${recipient})` : ''}`,
          actorName: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}`,
          actorRole: 'สารบรรณกลาง',
          timestamp: now,
        },
      ],
    };

    onAddDocument(newDoc);
    setSelectedDocForDetail(newDoc);
    setIsNewDocModalOpen(false);
    // Reset form
    setBookNumber('');
    setSubject('');
    setSourceAgency('');
    setRecipient('');
  };

  // Handle Number Override (Audit Log Enforced)
  const handleSaveNumberOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTargetDoc || !newReceiveNumber || !overrideReason) return;

    const oldNum = overrideTargetDoc.receiveNumber;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newAuditLog: DocumentAuditLog = {
      id: `log-override-${Date.now()}`,
      documentId: overrideTargetDoc.id,
      action: 'แก้ไขเลขที่รับ (Override Number)',
      detail: `แก้ไขเลขรับจากเดิม "${oldNum}" เป็น "${newReceiveNumber}" เนื่องจาก: ${overrideReason}`,
      actorName: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}`,
      actorRole: currentUser.position,
      timestamp: now,
      previousValue: oldNum,
      newValue: newReceiveNumber,
    };

    const updatedDoc: EDocument = {
      ...overrideTargetDoc,
      receiveNumber: newReceiveNumber,
      history: [newAuditLog, ...overrideTargetDoc.history],
    };

    onUpdateDocument(updatedDoc);
    setSelectedDocForDetail(updatedDoc);
    setIsOverrideNumberModalOpen(false);
    setOverrideReason('');
  };

  // Handle Dispatch to Division
  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForDetail) return;

    const targetDept = departments.find(d => d.id === dispatchTargetDeptId);
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newAuditLog: DocumentAuditLog = {
      id: `log-dispatch-${Date.now()}`,
      documentId: selectedDocForDetail.id,
      action: `จ่ายหนังสือให้${targetDept?.name || 'กองงาน'}`,
      detail: dispatchNote ? `ข้อความสารบรรณ: ${dispatchNote}` : `ส่งต่อหนังสือให้สารบรรณ${targetDept?.name} เพื่อดำเนินการ`,
      actorName: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}`,
      actorRole: 'สารบรรณกลาง',
      timestamp: now,
    };

    const updatedDoc: EDocument = {
      ...selectedDocForDetail,
      destinationDeptId: dispatchTargetDeptId,
      currentDeptName: targetDept?.name || 'กองงานที่รับผิดชอบ',
      currentStatus: 'dispatched_to_dept',
      history: [newAuditLog, ...selectedDocForDetail.history],
    };

    onUpdateDocument(updatedDoc);
    setSelectedDocForDetail(updatedDoc);
    setIsDispatchModalOpen(false);
    setDispatchNote('');
  };

  // Handle Division Receive & Endorse
  const handleAdvanceStatus = (nextStatus: DocStatus, label: string) => {
    if (!selectedDocForDetail) return;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newAuditLog: DocumentAuditLog = {
      id: `log-status-${Date.now()}`,
      documentId: selectedDocForDetail.id,
      action: label,
      detail: `ดำเนินการสถานะ "${label}" โดย ${currentUser.position}`,
      actorName: `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}`,
      actorRole: currentUser.position,
      timestamp: now,
    };

    const updatedDoc: EDocument = {
      ...selectedDocForDetail,
      currentStatus: nextStatus,
      history: [newAuditLog, ...selectedDocForDetail.history],
    };

    onUpdateDocument(updatedDoc);
    setSelectedDocForDetail(updatedDoc);
  };

  const getStatusBadge = (status: DocStatus) => {
    switch (status) {
      case 'central_received':
        return { text: 'สารบรรณกลางลงรับ', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'dispatched_to_dept':
        return { text: 'จ่ายให้กองงานแล้ว', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'dept_received':
        return { text: 'สารบรรณกองลงรับแล้ว', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'head_reviewing':
        return { text: 'เสนอ ผอ.กอง พิจารณา', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'endorsed':
        return { text: 'เกษียณหนังสือ/ปิดงาน', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'archived':
        return { text: 'จัดเก็บเข้าสารบบ', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { text: status, color: 'bg-slate-100 text-slate-800' };
    }
  };

  const getUrgencyBadge = (u: UrgencyLevel) => {
    switch (u) {
      case 'normal': return 'text-slate-600 bg-slate-100';
      case 'urgent': return 'text-amber-700 bg-amber-100 font-semibold';
      case 'very_urgent': return 'text-orange-700 bg-orange-100 font-semibold';
      case 'most_urgent': return 'text-red-700 bg-red-100 font-bold';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Role Action Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              ระบบสารบรรณอิเล็กทรอนิกส์ (E-Document Tracking)
            </h2>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
              ปีงบประมาณ {fiscalYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ระเบียบงานสารบรรณภาครัฐ: ลงทะเบียนรับสารบรรณกลาง, จ่ายหนังสือให้กองงาน, แก้ไขเลขรับพร้อม Audit Log และติดตาม Timeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canRegisterCentral ? (
            <button
              onClick={() => setIsNewDocModalOpen(true)}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>ลงทะเบียนรับหนังสือใหม่ (สารบรรณกลาง)</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs rounded-lg border border-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <span>สิทธิ์เฉพาะสารบรรณกลาง (สำนักปลัด) ในการลงรับ</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Document List & Document Tracking View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document List & Search Filter (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่รับ, เลขที่หนังสือ, เรื่อง, หน่วยงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* Document Type Filter */}
            <div className="flex flex-wrap gap-1 text-xs">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'incoming', label: 'หนังสือรับ' },
                { id: 'internal', label: 'หนังสือภายใน' },
                { id: 'outgoing', label: 'หนังสือส่ง' },
                { id: 'order', label: 'คำสั่ง' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterType(tab.id)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeFilterType === tab.id
                      ? 'bg-blue-800 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Document Items List */}
          <div className="space-y-2">
            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                ไม่พบหนังสือตามเงื่อนไขที่ค้นหา
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDocForDetail?.id === doc.id;
                const statusInfo = getStatusBadge(doc.currentStatus);

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocForDetail(doc)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-900 bg-blue-100/70 px-1.5 py-0.5 rounded text-[11px]">
                          รับ {doc.receiveNumber}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${getUrgencyBadge(doc.urgency)}`}>
                          {doc.urgency === 'normal' ? 'ปกติ' : doc.urgency === 'urgent' ? 'ด่วน' : 'ด่วนที่สุด'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                      {doc.subject}
                    </h4>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[180px]">จาก: {doc.sourceAgency}</span>
                      <span className="font-mono">{doc.registeredDate.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Document Detailed View & Tracking Timeline (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDocForDetail ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header Box */}
              <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold bg-blue-900 text-white px-2.5 py-1 rounded">
                      เลขรับ: {selectedDocForDetail.receiveNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      (เลขที่หนังสือ: {selectedDocForDetail.bookNumber})
                    </span>
                  </div>

                  {/* Actions for Central Registry */}
                  <div className="flex items-center gap-1.5">
                    {canOverrideNumber && (
                      <button
                        onClick={() => {
                          setOverrideTargetDoc(selectedDocForDetail);
                          setNewReceiveNumber(selectedDocForDetail.receiveNumber);
                          setIsOverrideNumberModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 shadow-xs"
                        title="แก้ไขเลขที่รับในกรณีลงย้อนหลังหรือคีย์ผิด พร้อมบันทึกประวัติ"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไขเลขรับ (Override)</span>
                      </button>
                    )}

                    {canRegisterCentral && selectedDocForDetail.currentStatus === 'central_received' && (
                      <button
                        onClick={() => setIsDispatchModalOpen(true)}
                        className="px-3 py-1 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-bold flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>จ่ายหนังสือให้กอง</span>
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {selectedDocForDetail.subject}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">จากหน่วยงาน:</span>
                    <span className="font-semibold text-slate-800">{selectedDocForDetail.sourceAgency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ส่งถึง / เสนอถึง:</span>
                    <span className="font-semibold text-blue-900">
                      {selectedDocForDetail.recipient ? (
                        selectedDocForDetail.recipient
                      ) : (
                        <span className="text-slate-400 italic font-normal">(เว้นว่างไว้ / ส่งตามสายงาน)</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">กองงานที่รับผิดชอบ:</span>
                    <span className="font-semibold text-slate-800">{selectedDocForDetail.currentDeptName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">วันที่ลงรับ:</span>
                    <span className="font-mono">{selectedDocForDetail.registeredDate}</span>
                  </div>
                </div>
              </div>

              {/* Status Advancement Quick Buttons (for Division workflow) */}
              <div className="p-3 bg-blue-50/40 border-b border-blue-100 px-5 flex flex-wrap items-center justify-between text-xs gap-2">
                <span className="font-semibold text-slate-700">การเดินหนังสือประจำกอง:</span>
                <div className="flex gap-2">
                  {selectedDocForDetail.currentStatus === 'dispatched_to_dept' && (
                    <button
                      onClick={() => handleAdvanceStatus('dept_received', `สารบรรณ${selectedDocForDetail.currentDeptName} ลงรับเข้ากอง`)}
                      className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded text-xs font-medium"
                    >
                      สารบรรณกองลงรับ
                    </button>
                  )}
                  {selectedDocForDetail.currentStatus === 'dept_received' && (
                    <button
                      onClick={() => handleAdvanceStatus('head_reviewing', 'เสนอผู้อำนวยการกองพิจารณาลงความเห็น')}
                      className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-medium"
                    >
                      เสนอ ผอ.กอง
                    </button>
                  )}
                  {selectedDocForDetail.currentStatus === 'head_reviewing' && (
                    <button
                      onClick={() => handleAdvanceStatus('endorsed', 'ผอ.กอง เกษียณหนังสือ / มอบหมายงานเรียบร้อย')}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium"
                    >
                      เกษียณหนังสือ (ปิดงาน)
                    </button>
                  )}
                </div>
              </div>

              {/* Attachments Section */}
              <div className="p-5 border-b border-slate-200">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-700" />
                  ไฟล์เอกสารแนบต้นฉบับ ({selectedDocForDetail.attachments.length} ไฟล์)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDocForDetail.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="truncate text-slate-800 font-medium">{att.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>
                      </div>
                      <button
                        onClick={() => setIsPreviewAttachmentOpen(att.name)}
                        className="p-1 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded"
                        title="ดูตัวอย่างเอกสาร"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Timeline & Audit Trail (The Core Requirement) */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-700" />
                    ประวัติการเดินหนังสือและ Audit Log (Document Tracking Timeline)
                  </div>
                  <span className="text-[11px] text-slate-400">ตรวจสอบความโปร่งใส</span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                  {selectedDocForDetail.history.map((log, index) => {
                    const isOverride = log.action.includes('แก้ไขเลขที่รับ');

                    return (
                      <div key={log.id} className="relative group">
                        {/* Dot */}
                        <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                          isOverride ? 'border-amber-500 bg-amber-100' :
                          index === 0 ? 'border-blue-700 bg-blue-700' : 'border-blue-400'
                        }`} />

                        <div className={`p-3 rounded-lg border text-xs ${
                          isOverride 
                            ? 'bg-amber-50/70 border-amber-300 text-amber-950' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                          <div className="flex items-center justify-between font-semibold">
                            <span className={isOverride ? 'text-amber-800 font-bold' : 'text-blue-900'}>
                              {log.action}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                          </div>

                          <p className="mt-1 text-slate-600 leading-relaxed">{log.detail}</p>

                          {isOverride && (
                            <div className="mt-2 p-2 bg-white rounded border border-amber-200 text-[11px] font-mono text-amber-900">
                              <div>เลขเดิม: <span className="line-through">{log.previousValue}</span> ➔ เลขใหม่: <span className="font-bold text-blue-900">{log.newValue}</span></div>
                            </div>
                          )}

                          <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                            <span>ผู้บันทึก: {log.actorName}</span>
                            <span className="bg-slate-200/70 px-1.5 py-0.5 rounded text-[9px]">{log.actorRole}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
              กรุณาเลือกรายการหนังสือจากด้านซ้ายเพื่อดูรายละเอียด
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: REGISTER NEW CENTRAL DOCUMENT */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm font-heading">ลงทะเบียนรับหนังสือใหม่ (สารบรรณกลาง)</h3>
              </div>
              <button onClick={() => setIsNewDocModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 flex justify-between items-center">
                <span>เลขที่รับที่จะออกอัตโนมัติ:</span>
                <span className="font-mono text-base font-bold text-blue-950">{nextRunningNumber()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภทหนังสือ *</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="incoming">หนังสือรับ (ภายนอก)</option>
                    <option value="internal">หนังสือภายใน (บันทึกข้อความ)</option>
                    <option value="outgoing">หนังสือส่ง</option>
                    <option value="order">คำสั่ง อบต.</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชั้นความเร็ว *</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="normal">ปกติ</option>
                    <option value="urgent">ด่วน</option>
                    <option value="very_urgent">ด่วนมาก</option>
                    <option value="most_urgent">ด่วนที่สุด</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลขที่หนังสือต้นฉบับ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น มท 0808.2/ว 1420 หรือ ชม 0023/123"
                  value={bookNumber}
                  onChange={(e) => setBookNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">จากหน่วยงาน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น กรมส่งเสริมการปกครองท้องถิ่น หรือ สำนักงานจังหวัดเชียงใหม่"
                  value={sourceAgency}
                  onChange={(e) => setSourceAgency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เรื่อง (ชื่อหนังสือ) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="ระบุชื่อเรื่องหนังสือฉบับเต็ม..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    ส่งถึง / เสนอถึง (เว้นว่างเพื่อกรอก)
                  </label>
                  <span className="text-[10px] text-slate-400">เว้นว่างได้ หรือระบุตามต้องการ</span>
                </div>
                <input
                  type="text"
                  placeholder="เว้นว่างไว้เพื่อกรอก (เช่น เสนอ ปลัด อบต., นายก อบต. ผ่าน ปลัด อบต., หรือ ผอ.กองช่าง)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">มอบหมาย / จ่ายให้กองงาน *</label>
                <select
                  value={destinationDeptId}
                  onChange={(e) => setDestinationDeptId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} (ผอ. {dept.headName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"
                >
                  บันทึกลงรับหนังสือ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OVERRIDE RECEIVE NUMBER (SPECIAL ADMIN/AUDIT LOG PERMISSION) */}
      {isOverrideNumberModalOpen && overrideTargetDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm font-heading">แก้ไขเลขที่รับ (Override Number)</h3>
                  <p className="text-[10px] text-amber-100">บันทึกประวัติการแก้ไขเข้า Audit Log เสมอ</p>
                </div>
              </div>
              <button onClick={() => setIsOverrideNumberModalOpen(false)} className="text-white hover:text-amber-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNumberOverride} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                <div><strong>เงื่อนไขความโปร่งใส:</strong> การแก้ไขเลขรับจะถูกบันทึกผู้แก้ไข วันเวลา และเหตุผลลงในประวัติการเดินทางของเอกสารอย่างถาวร</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลขที่รับเดิม (ปัจจุบัน)</label>
                <div className="p-2 bg-slate-100 rounded text-slate-700 font-mono font-bold">
                  {overrideTargetDoc.receiveNumber}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลขที่รับใหม่ที่ต้องการเปลี่ยนเป็น *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 0425/2569 (กรณีลงรับย้อนหลัง)"
                  value={newReceiveNumber}
                  onChange={(e) => setNewReceiveNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เหตุผลความจำเป็นในการแก้ไขเลขรับ *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="เช่น ลงรับหนังสือย้อนหลังตามคำสั่งด่วน หรือ แก้ไขข้อผิดพลาดจากการคีย์เลขสลับกัน..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOverrideNumberModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
                >
                  ยืนยันแก้ไขและบันทึก Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DISPATCH DOCUMENT TO DIVISION */}
      {isDispatchModalOpen && selectedDocForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm font-heading">จ่ายหนังสือให้สารบรรณกอง</h3>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatch} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เรื่อง</label>
                <div className="p-2.5 bg-slate-100 rounded text-slate-800 line-clamp-2">
                  {selectedDocForDetail.subject}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลือกกองงานปลายทาง *</label>
                <select
                  value={dispatchTargetDeptId}
                  onChange={(e) => setDispatchTargetDeptId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium text-slate-800"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.headName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ข้อความหรือคำสั่งสารบรรณเพิ่มเติม</label>
                <textarea
                  rows={2}
                  placeholder="เช่น มอบหมาย ผอ.กองช่าง สำรวจความเสียหายและรายงานด่วน..."
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"
                >
                  ส่งหนังสือ (จ่ายงาน)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ATTACHMENT PREVIEW */}
      {isPreviewAttachmentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-800 text-white flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-red-400" />
                ตัวอย่างเอกสาร: {isPreviewAttachmentOpen}
              </span>
              <button onClick={() => setIsPreviewAttachmentOpen(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 bg-slate-100 flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-lg bg-white p-8 rounded shadow-md border border-slate-200 space-y-4 text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                  ครุฑ
                </div>
                <h4 className="font-bold text-sm text-slate-900">หนังสือราชการภายนอก</h4>
                <p className="text-xs text-slate-600">
                  {selectedDocForDetail?.subject}
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-left text-xs text-slate-500 font-mono">
                  [จำลองการแสดงผลเอกสาร PDF ต้นฉบับ พร้อมลายมือชื่ออิเล็กทรอนิกส์]
                </div>
              </div>
              <button
                onClick={() => setIsPreviewAttachmentOpen(null)}
                className="px-4 py-2 bg-slate-700 text-white text-xs rounded-lg"
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
