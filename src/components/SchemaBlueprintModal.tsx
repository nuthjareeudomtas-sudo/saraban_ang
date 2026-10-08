import React, { useState } from 'react';
import { 
  FileText, 
  Wrench, 
  FileCheck, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Database, 
  Copy, 
  Check, 
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaBlueprintModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'workflows' | 'code_samples'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlFullSchema = `-- ============================================================================
-- โครงสร้างฐานข้อมูลระบบสารสนเทศและการบริหารจัดการ อบต. (SAO Intranet & E-Service)
-- รองรับ PostgreSQL / Cloud SQL / MySQL 8.0+
-- ============================================================================

-- 1. ตารางหน่วยงาน/กอง/ฝ่าย
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name_th VARCHAR(150) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    head_user_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางผู้ใช้งาน (เฉพาะเจ้าหน้าที่ภายใน - ปิดรับสมัครภายนอก)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    prefix VARCHAR(20) DEFAULT 'นาย',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(150) NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id),
    role VARCHAR(50) NOT NULL, -- 'staff','central_registry','technician','dept_head','hr_admin','executive','super_admin'
    email VARCHAR(150),
    phone VARCHAR(50),
    is_first_login BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางกำหนดสิทธิ์เข้าใช้ระบบย่อยรายบุคคล (Granular Module RBAC)
CREATE TABLE user_modules (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL, -- 'central_registry','repair_dispatch','permit_review','leave_approve','hr_quota','cms_admin'
    can_read BOOLEAN DEFAULT TRUE,
    can_write BOOLEAN DEFAULT FALSE,
    can_approve BOOLEAN DEFAULT FALSE,
    can_admin BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, module_key)
);

-- 4. ตารางระบบสารบรรณอิเล็กทรอนิกส์ (E-Documents)
CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    doc_type VARCHAR(30) NOT NULL, -- 'incoming', 'outgoing', 'internal', 'order'
    book_number VARCHAR(100) NOT NULL, -- เลขที่หนังสือจากภายนอก
    receive_number VARCHAR(50) NOT NULL, -- เลขที่รับสารบรรณกลาง (เช่น 0428/2569)
    fiscal_year INT NOT NULL, -- ปีงบประมาณ
    subject TEXT NOT NULL,
    source_agency VARCHAR(255) NOT NULL,
    destination_dept_id VARCHAR(50) REFERENCES departments(id),
    urgency VARCHAR(20) DEFAULT 'normal', -- 'normal', 'urgent', 'very_urgent', 'most_urgent'
    secret_level VARCHAR(20) DEFAULT 'normal', -- 'normal', 'confidential', 'secret', 'top_secret'
    registered_by_id VARCHAR(50) REFERENCES users(id),
    current_status VARCHAR(50) NOT NULL, -- 'central_received', 'dispatched_to_dept', 'dept_received', 'head_reviewing', 'endorsed', 'archived'
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ตารางประวัติและ Audit Log สารบรรณ (บันทึกการแก้ไขเลขรับและการเดินหนังสือ)
CREATE TABLE document_logs (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'REGISTRATION', 'NUMBER_OVERRIDE', 'DISPATCH', 'DEPT_RECEIVE', 'ENDORSE'
    actor_user_id VARCHAR(50) REFERENCES users(id),
    previous_value TEXT, -- ใช้เก็บเลขเดิมกรณี override
    new_value TEXT,      -- ใช้เก็บเลขใหม่
    reason_note TEXT,    -- บันทึกเหตุผลความจำเป็น
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ตารางระบบแจ้งซ่อม (รองรับทั้งประชาชน Public และ เจ้าหน้าที่ Internal)
CREATE TABLE repair_requests (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL UNIQUE, -- เช่น 'RP-2569-0012' สำหรับสืบค้น
    channel VARCHAR(20) NOT NULL, -- 'public' (ประชาชนไม่ต้องล็อกอิน), 'internal' (เจ้าหน้าที่)
    citizen_name VARCHAR(150),
    citizen_phone VARCHAR(50),
    internal_user_id VARCHAR(50) REFERENCES users(id),
    category VARCHAR(50) NOT NULL, -- 'street', 'electricity', 'water', 'drainage', 'office_equipment', 'building'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location_text TEXT NOT NULL,
    village_moo VARCHAR(50),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    urgency VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
    assigned_technician_id VARCHAR(50) REFERENCES users(id),
    assigned_dept_id VARCHAR(50) REFERENCES departments(id),
    technician_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. รูปภาพก่อนและหลังซ่อม (Before/After Proof Images)
CREATE TABLE repair_images (
    id SERIAL PRIMARY KEY,
    repair_id VARCHAR(50) NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    image_type VARCHAR(20) NOT NULL, -- 'before', 'after'
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. บันทึกวัสดุและอะไหล่ที่ช่างใช้ในการซ่อมแซม
CREATE TABLE repair_materials (
    id SERIAL PRIMARY KEY,
    repair_id VARCHAR(50) NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ระบบขอใบอนุญาตออนไลน์ - แม่แบบประเภทใบอนุญาต (Dynamic Permit Types)
CREATE TABLE permit_types (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE, -- เช่น 'B-01', 'L-02'
    name_th VARCHAR(255) NOT NULL,
    description TEXT,
    responsible_dept_id VARCHAR(50) REFERENCES departments(id),
    processing_days INT DEFAULT 7,
    fee_amount DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_user_id VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. ฟีลด์แบบฟอร์มที่ Admin ปรับแต่งได้เอง (Dynamic Form Builder Fields)
CREATE TABLE permit_fields (
    id VARCHAR(50) PRIMARY KEY,
    permit_type_id VARCHAR(50) NOT NULL REFERENCES permit_types(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(30) NOT NULL, -- 'text', 'number', 'textarea', 'select', 'radio', 'checkbox'
    options_json JSONB, -- เก็บตัวเลือกเช่น ["บ้านตึก", "บ้านไม้"]
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

-- 11. รายการยื่นคำขอใบอนุญาตของประชาชน (Permit Requests)
CREATE TABLE permit_requests (
    id VARCHAR(50) PRIMARY KEY,
    application_no VARCHAR(50) NOT NULL UNIQUE, -- 'PM-2569-0045'
    permit_type_id VARCHAR(50) NOT NULL REFERENCES permit_types(id),
    citizen_name VARCHAR(150) NOT NULL,
    citizen_id_card VARCHAR(20) NOT NULL,
    citizen_phone VARCHAR(50) NOT NULL,
    citizen_address TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'submitted', -- 'submitted', 'step1_reviewed', 'approved', 'rejected'
    step1_reviewer_id VARCHAR(50) REFERENCES users(id), -- หัวหน้ากอง
    step1_comment TEXT,
    step1_reviewed_at TIMESTAMP WITH TIME ZONE,
    step2_reviewer_id VARCHAR(50) REFERENCES users(id), -- ปลัด / นายก
    step2_comment TEXT,
    step2_approved_at TIMESTAMP WITH TIME ZONE,
    electronic_license_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. ข้อมูลคำตอบตามฟีลด์ Dynamic ที่ประชาชนกรอก (Permit Field Values)
CREATE TABLE permit_values (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL REFERENCES permit_requests(id) ON DELETE CASCADE,
    field_id VARCHAR(50) NOT NULL REFERENCES permit_fields(id),
    field_value TEXT
);

-- 13. ตารางโควตาวันลาเริ่มต้นรายบุคคล (Leave Quotas - บริหารโดย HR Admin)
CREATE TABLE leave_quotas (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fiscal_year INT NOT NULL,
    leave_type VARCHAR(30) NOT NULL, -- 'vacation', 'sick', 'personal', 'maternity'
    initial_quota INT NOT NULL,
    used_days INT DEFAULT 0,
    remaining_days INT NOT NULL,
    updated_by_hr_id VARCHAR(50) REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fiscal_year, leave_type)
);

-- 14. ตารางบันทึกการขอลาออนไลน์ (Leave Requests)
CREATE TABLE leave_requests (
    id VARCHAR(50) PRIMARY KEY,
    request_no VARCHAR(50) NOT NULL UNIQUE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    leave_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL,
    reason TEXT NOT NULL,
    contact_address TEXT,
    contact_phone VARCHAR(50),
    status VARCHAR(30) DEFAULT 'pending', -- 'pending' (ยังไม่ตัดโควตา), 'head_approved', 'approved' (ตัดโควตาแล้ว), 'rejected'
    head_reviewer_id VARCHAR(50) REFERENCES users(id),
    head_comment TEXT,
    head_reviewed_at TIMESTAMP WITH TIME ZONE,
    executive_reviewer_id VARCHAR(50) REFERENCES users(id),
    executive_comment TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. ตารางปฏิทินกิจกรรม อบต. (Activities)
CREATE TABLE activities (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type VARCHAR(30) NOT NULL, -- 'meeting', 'community', 'holiday', 'training'
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    department_id VARCHAR(50) REFERENCES departments(id),
    created_by_user_id VARCHAR(50) REFERENCES users(id)
);

-- 16. ตารางบันทึกการจัดเวรประจำวัน (Duty Rosters & Contacts)
CREATE TABLE duty_rosters (
    id VARCHAR(50) PRIMARY KEY,
    duty_date DATE NOT NULL,
    shift_type VARCHAR(50) NOT NULL, -- 'day_guard', 'night_guard', 'emergency_standby', 'complaint_receiver'
    officer_id VARCHAR(50) NOT NULL REFERENCES users(id),
    officer_phone VARCHAR(50) NOT NULL,
    backup_phone VARCHAR(50),
    notes TEXT,
    assigned_by_user_id VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. ตารางการตั้งค่าระบบและ CMS อบต.
CREATE TABLE site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    updated_by VARCHAR(50) REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">พิมพ์เขียวระบบและโครงสร้างฐานข้อมูล (System Blueprint & Schema)</h2>
              <p className="text-xs text-blue-100">
                สถาปัตยกรรม 5 ระบบหลัก, Workflows, ตารางฐานข้อมูล และตัวอย่างโค้ดสำหรับ อบต.
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50 text-sm font-medium">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-blue-700 text-blue-900 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            ภาพรวมสถาปัตยกรรม (Architecture)
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'workflows'
                ? 'border-blue-700 text-blue-900 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            ผังขั้นตอนการทำงาน (Workflows)
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-blue-700 text-blue-900 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            โครงสร้าง SQL Schema (17 Tables)
          </button>
          <button
            onClick={() => setActiveTab('code_samples')}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'code_samples'
                ? 'border-blue-700 text-blue-900 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            ตัวอย่างโค้ด (HTML / Tailwind)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: ARCHITECTURE OVERVIEW */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">ความปลอดภัย & RBAC</div>
                  <h4 className="font-bold text-slate-900 mb-2">Centralized Auth</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ปิดรับสมัครภายนอก Super Admin เป็นผู้สร้างบัญชีเจ้าหน้าที่ กำหนดรหัสผ่านเริ่มต้น และบังคับเปลี่ยนรหัสเมื่อเข้าสู่ระบบครั้งแรก
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">การแบ่งแยกช่องทาง</div>
                  <h4 className="font-bold text-slate-900 mb-2">Dual Portal Segregation</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    หน้าแรกเป็น Public Portal ประชาชนแจ้งซ่อม/ขออนุญาตโดยไม่ต้องมีบัญชีเจ้าหน้าที่ ขณะที่ Intranet เจ้าหน้าที่แยกสิทธิ์ตามบทบาทและกองงาน
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">ความยืดหยุ่นสูง</div>
                  <h4 className="font-bold text-slate-900 mb-2">Dynamic Form Builder</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Admin สามารถสร้างประเภทใบอนุญาตใหม่ เพิ่มฟีลด์แบบฟอร์ม และกำหนดเอกสารแนบได้เองทันทีโดยไม่ต้องแก้ไขซอร์สโค้ด
                  </p>
                </div>
              </div>

              {/* 5 Core Modules Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-100/70 font-semibold text-sm text-slate-800">
                  โครงสร้าง 5 ระบบหลักของ อบต.
                </div>
                <div className="divide-y divide-slate-100 text-sm">
                  <div className="p-4 flex items-start gap-4">
                    <div className="p-2 rounded bg-blue-50 text-blue-700 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">1. ระบบสารบรรณอิเล็กทรอนิกส์ (E-Document Tracking)</div>
                      <div className="text-xs text-slate-600 mt-1">
                        สารบรรณกลาง (สำนักปลัด) เป็นสิทธิ์เดียวที่ลงทะเบียนรับ-ส่ง รันเลขอัตโนมัติตามปีงบประมาณ มีฟังก์ชัน Override เลขรับพร้อมบันทึก Audit Log เสมอ และติดตามสถานะแบบ Timeline ไปยังกองช่าง/กองคลัง
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-4">
                    <div className="p-2 rounded bg-amber-50 text-amber-700 shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">2. ระบบแจ้งซ่อม (Repair Management System)</div>
                      <div className="text-xs text-slate-600 mt-1">
                        แยก Public (สาธารณูปโภค ไฟฟ้า/ถนน/ประปา/ท่อระบายน้ำ + ปักหมุด GPS + ค้นหาด้วย Ticket ID) และ Internal (ครุภัณฑ์สำนักงาน/แอร์/คอมพิวเตอร์) พร้อมระบบแจ้งเตือน Line และ Executive Dashboard & Heatmap
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-4">
                    <div className="p-2 rounded bg-emerald-50 text-emerald-700 shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">3. ระบบขอใบอนุญาตออนไลน์ (E-License & Permit System)</div>
                      <div className="text-xs text-slate-600 mt-1">
                        ขออนุญาตก่อสร้าง (อ.1), ขุดดิน/ถมดิน, กิจการที่เป็นอันตรายต่อสุขภาพ มี 2-Step Approval (ขั้น 1 หัวหน้ากองเห็นชอบ, ขั้น 2 ปลัด/นายก อบต. อนุมัติออกใบอนุญาต) พร้อม Dynamic Form Builder ให้ Admin ปรับแต่ง
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-4">
                    <div className="p-2 rounded bg-indigo-50 text-indigo-700 shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">4. ระบบกิจกรรมและปฏิทินปฏิบัติงาน (Activities & Duty Roster Calendar)</div>
                      <div className="text-xs text-slate-600 mt-1">
                        ปฏิทินวาระงานและเวรยามประจำวันเด่นชัดบนหน้าแรก มี Tooltip แสดงชื่อและเบอร์โทรติดต่อผู้เข้าเวรทันทีเมื่อเลื่อนเมาส์ชี้ จำกัดสิทธิ์จัดตารางเวรเฉพาะสำนักปลัด/ฝ่ายบุคลากร
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-4">
                    <div className="p-2 rounded bg-purple-50 text-purple-700 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">5. ระบบการลาออนไลน์ (Leave Management & Quota Deduction)</div>
                      <div className="text-xs text-slate-600 mt-1">
                        HR กำหนดโควตาเริ่มต้นต่อปีงบประมาณ ล็อกสิทธิ์ความเป็นส่วนตัวเห็นเฉพาะตนเอง และใช้หลักการตัดยอดวันลาเมื่อสถานะได้รับการอนุมัติสิ้นสุด (Approved) จากผู้บริหารเท่านั้น (คำขอที่ Pending จะยังไม่ถูกหักยอด)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW DIAGRAMS */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              {/* Workflow 1: E-Document */}
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    1. แผนผังขั้นตอนงานสารบรรณอิเล็กทรอนิกส์ (E-Document Workflow)
                  </h4>
                  <span className="text-xs text-blue-700 font-medium">สำนักปลัด & กองงาน</span>
                </div>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`[หนังสือจากภายนอก / ส่วนราชการ / ประชาชน]
         │
         ▼
[1. สารบรรณกลาง (สำนักปลัด)] ─────────► [ระบบรันเลขรับอัตโนมัติ 0428/2569]
         │                                       │
         │ (กรณีพิเศษ: ลงรับย้อนหลัง/แก้ไข)        │
         ├───────────────────────────────────────┴──► บันทึก Audit Log ลงตาราง document_logs
         │                                            (เก็บเลขเดิม, เลขใหม่, ผู้แก้ไข, เหตุผล)
         ▼
[2. จ่ายหนังสือให้สารบรรณกอง] ──► (เช่น กองช่าง, กองคลัง, กองสาธารณสุขฯ)
         │
         ▼
[3. สารบรรณกองลงรับ] ────────► บันทึกเลขรับประจำกอง (เช่น ชย 0112/2569)
         │
         ▼
[4. เสนอหัวหน้ากอง/ผอ.กอง] ──► หัวหน้ากองพิจารณาลงความเห็น / มอบหมายเจ้าหน้าที่ผู้รับผิดชอบ
         │
         ▼
[5. ปิดงาน / เกษียณหนังสือ] ──► อัปเดตสถานะเป็น "endorsed / archived" เจ้าหน้าที่ทุกฝ่ายติดตามดูได้`}
                </div>
              </div>

              {/* Workflow 2: Repair System */}
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    2. แผนผังระบบแจ้งซ่อมแซม 2 ช่องทาง และ Line Notify & Dashboard
                  </h4>
                  <span className="text-xs text-amber-700 font-medium">Public & Staff Flow</span>
                </div>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`[ประชาชน (Public Portal)]                     [เจ้าหน้าที่ อบต. (Internal Portal)]
(แจ้งไฟฟ้า/ถนน/ประปา/ท่อระบายน้ำ)               (แจ้งซ่อมแอร์/คอมพิวเตอร์/ครุภัณฑ์)
  • ไม่ต้องเข้าสู่ระบบ                            • ล็อกอินเข้าระบบ Intranet
  • ปักหมุดแผนที่ GPS                             • เลือกรหัสครุภัณฑ์ / ห้องทำงาน
         │                                                      │
         └───────────────────────┬──────────────────────────────┘
                                 ▼
                     [ออกรหัส Ticket ID (RP-2569-xxxx)]
                                 │
                                 ▼
                  [ระบบส่งแจ้งเตือนอัตโนมัติ Line Notify] ──► แจ้งเตือนเข้าไลน์กลุ่มช่าง
                                 │                            (ประเภทงาน, พิกัด, ลิงก์ดูรูป)
                                 ▼
                    [ช่าง / ผู้รับผิดชอบรับงาน] ─────────────► ปรับสถานะเป็น "กำลังดำเนินการ"
                                 │
                                 ▼
                       [ช่างเข้าซ่อมแซมหน้างาน]
                                 │
                                 ▼
              [บันทึกปิดงาน: ถ่ายรูปหลังซ่อม + บันทึกวัสดุ] ──► ปรับสถานะเป็น "ซ่อมเสร็จสิ้น"
                                 │
         ┌───────────────────────┴──────────────────────────────┐
         ▼                                                      ▼
[ประชาชนค้นหาและดูรูป Before/After ผ่าน Ticket ID]     [Executive Dashboard สรุปสถิติ & Heatmap]
                                                       (KPI อัตราความสำเร็จ, เวลาเฉลี่ย, จุดเกิดเหตุซ้ำซาก)`}
                </div>
              </div>

              {/* Workflow 3: Leave Management */}
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    3. แผนผังระบบการลาออนไลน์ และจุดตัดคำนวณโควตา (Deduction Logic)
                  </h4>
                  <span className="text-xs text-purple-700 font-medium">Leave Logic</span>
                </div>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`[ฝ่ายบุคลากร (HR Admin)] ──► กำหนดโควตาเริ่มต้นรายบุคคล (leave_quotas) เช่น พักผ่อน 10 วัน, ป่วย 30 วัน
                                 │
                                 ▼
[เจ้าหน้าที่ยื่นคำขอลา] ─────► ตรวจสอบโควตาคงเหลือส่วนตัว (เห็นเฉพาะตนเอง & HR)
         │
         ▼
[สถานะ: รอดำเนินการ (Pending)] ──► **ยังไม่มีการหักวันลาออกจากโควตาคงเหลือ**
         │
         ▼
[ขั้นที่ 1: หัวหน้าฝ่าย/กอง] ────► เห็นชอบ / เสนอความเห็น
         │
         ▼
[ขั้นที่ 2: ปลัด/นายก อบต.] ─────► พิจารณาขั้นสุดท้าย
         │
         ├────────────────────────────────────────┬─────────────────────────────────────┐
         ▼                                        ▼                                     ▼
    [อนุมัติ (Approved)]                   [ไม่อนุมัติ (Rejected)]                 [ยกเลิกคำขอ]
         │                                        │                                     │
         ▼                                        ▼                                     ▼
**ระบบทำการตัดวันลาออกจากโควตาคงเหลือ**      โควตาคงเหลือไม่ถูกหัก                 โควตาคงเหลือไม่ถูกหัก
(remaining_days = remaining_days - days)   (คงค่าเดิมไว้)                        (คงค่าเดิมไว้)`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SQL SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900">PostgreSQL DDL Database Schema</h4>
                  <p className="text-xs text-slate-500">
                    ครอบคลุมทั้ง 17 ตาราง: users, roles, user_modules, documents, document_logs, repair_requests, repair_images, repair_materials, permit_types, permit_fields, permit_requests, permit_values, leave_quotas, leave_requests, activities, duty_rosters, site_settings
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('sql', sqlFullSchema)}
                  className="px-4 py-2 bg-[#0F2C59] text-white text-xs font-medium rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'sql' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      คัดลอกแล้ว!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      คัดลอก SQL ทั้งหมด
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[500px]">
                <pre>{sqlFullSchema}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: CODE SAMPLES */}
          {activeTab === 'code_samples' && (
            <div className="space-y-6">
              {/* Sample 1: Repair Form */}
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900">ตัวอย่างโค้ด: ฟอร์มแจ้งซ่อมสาธารณูปโภคของประชาชน (HTML + Tailwind CSS)</h4>
                  <button
                    onClick={() => handleCopy('code_repair', `<!-- แบบฟอร์มแจ้งซ่อมสาธารณูปโภคสำหรับประชาชน -->
<div class="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
  <h2 class="text-xl font-bold text-slate-900 mb-4">แจ้งเรื่องซ่อมแซมสาธารณูปโภค</h2>
  
  <form class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล ผู้แจ้ง *</label>
        <input type="text" required placeholder="เช่น นายสมหมาย มั่นคง" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
        <input type="tel" required placeholder="เช่น 081-234-5678" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">ประเภทความชำรุด *</label>
      <select class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none">
        <option>ไฟฟ้าสาธารณะ (ไฟกิ่ง)</option>
        <option>ถนนชำรุด / หลุมบ่อ</option>
        <option>ระบบประปาหมู่บ้าน / ท่อแตก</option>
        <option>ทางระบายน้ำอุดตัน</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">รายละเอียดอาการชำรุด *</label>
      <textarea rows="3" placeholder="ระบุอาการชำรุดและจุดสังเกต..." class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">ระดับความเร่งด่วน</label>
      <div class="flex gap-4 text-sm">
        <label class="flex items-center gap-1.5"><input type="radio" name="urgency" value="normal" checked /> ปกติ</label>
        <label class="flex items-center gap-1.5"><input type="radio" name="urgency" value="urgent" /> ด่วน</label>
        <label class="flex items-center gap-1.5"><input type="radio" name="urgency" value="most_urgent" /> ด่วนที่สุด (อันตราย)</label>
      </div>
    </div>

    <button type="submit" class="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition-colors">
      ส่งข้อมูลแจ้งซ่อมแซม
    </button>
  </form>
</div>`)}
                    className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    คัดลอกโค้ด
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`<!-- ตัวอย่างโครงสร้าง HTML/Tailwind CSS สำหรับฟอร์มแจ้งซ่อมประชาชน -->
<div class="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
  <h2 class="text-xl font-bold text-slate-900 mb-4">แจ้งเรื่องซ่อมแซมสาธารณูปโภค</h2>
  
  <form class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล ผู้แจ้ง *</label>
        <input type="text" required placeholder="เช่น นายสมหมาย มั่นคง" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
        <input type="tel" required placeholder="เช่น 081-234-5678" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
      </div>
    </div>
    ...
  </form>
</div>`}</pre>
                </div>
              </div>

              {/* Sample 2: Calendar Hover Tooltip */}
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900">ตัวอย่างโค้ด: ช่องปฏิทินเวรยามพร้อม Tooltip (Tailwind CSS group-hover)</h4>
                  <button
                    onClick={() => handleCopy('code_tooltip', `<!-- ช่องปฏิทินพร้อม Tooltip แสดงข้อมูลผู้เข้าเวรด้วย group-hover -->
<div class="relative group p-2 min-h-[90px] border border-slate-200 rounded-lg bg-white hover:bg-blue-50/50 transition-colors cursor-pointer">
  <!-- วันที่ในปฏิทิน -->
  <div class="font-bold text-sm text-slate-800">7 ต.ค.</div>
  
  <!-- ป้ายเวรยาม -->
  <div class="mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded truncate font-medium">
    เวรยาม: นายสมชาย (081-456-xxxx)
  </div>

  <!-- หน้าต่าง Tooltip แสดงเมื่อ Hover -->
  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-64 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-xs pointer-events-none">
    <div class="font-bold text-amber-400 text-sm mb-1">เวรยามประจำวัน (กลางวัน)</div>
    <div class="text-slate-200">ผู้ปฏิบัติหน้าที่: นายสมชาย วงศ์สุข</div>
    <div class="text-slate-300">ตำแหน่ง: เจ้าพนักงานธุรการ</div>
    <div class="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between">
      <span class="text-slate-400">โทรติดต่อด่วน:</span>
      <span class="font-mono text-emerald-400 font-bold">081-456-7890</span>
    </div>
    <!-- สามเหลี่ยมชี้ด้านล่าง -->
    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
  </div>
</div>`)}
                    className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    คัดลอกโค้ด
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`<!-- ช่องปฏิทินพร้อม Tooltip แสดงข้อมูลผู้เข้าเวรด้วย Tailwind CSS group-hover -->
<div class="relative group p-2 min-h-[90px] border border-slate-200 rounded-lg bg-white hover:bg-blue-50/50 transition-colors cursor-pointer">
  <!-- วันที่ในปฏิทิน -->
  <div class="font-bold text-sm text-slate-800">7 ต.ค.</div>
  
  <!-- ป้ายเวรยาม -->
  <div class="mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded truncate font-medium">
    เวรยาม: นายสมชาย (081-456-xxxx)
  </div>

  <!-- หน้าต่าง Tooltip แสดงเมื่อ Hover (group-hover:block) -->
  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-64 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-xs pointer-events-none">
    <div class="font-bold text-amber-400 text-sm mb-1">เวรยามประจำวัน (กลางวัน)</div>
    <div class="text-slate-200">ผู้ปฏิบัติหน้าที่: นายสมชาย วงศ์สุข</div>
    <div class="text-slate-300">ตำแหน่ง: เจ้าพนักงานธุรการ</div>
    <div class="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between">
      <span class="text-slate-400">โทรติดต่อด่วน:</span>
      <span class="font-mono text-emerald-400 font-bold">081-456-7890</span>
    </div>
    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
  </div>
</div>`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>ระบบสารสนเทศ อบต. ดอนแก้ว - มาตรฐานระเบียบงานสารบรรณและการบริหารงานภาครัฐ</div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
