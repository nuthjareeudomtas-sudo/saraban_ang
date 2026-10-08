import React, { useState } from 'react';
import { 
  User, 
  Department, 
  SiteSettings, 
  RoleCode 
} from '../../types';
import { SaoEmblem } from '../SaoEmblem';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Settings2, 
  Lock, 
  Key, 
  ShieldAlert, 
  Check, 
  X, 
  Building2, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles, 
  Save, 
  Trash2,
  RotateCcw,
  Upload,
  Globe,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';

interface Props {
  users: User[];
  departments: Department[];
  currentUser: User;
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  siteSettings: SiteSettings;
  onUpdateSettings: (s: SiteSettings) => void;
}

export const AdminModule: React.FC<Props> = ({
  users,
  departments,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  siteSettings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'cms'>('users');

  // New User Provisioning State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newPrefix, setNewPrefix] = useState('นาย');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newDeptId, setNewDeptId] = useState(departments[0]?.id || '');
  const [newUsername, setNewUsername] = useState('');
  const [newDefaultPassword, setNewDefaultPassword] = useState('DonKaew@2569');
  const [newRole, setNewRole] = useState<RoleCode>('staff');
  const [newPhone, setNewPhone] = useState('081-000-0000');
  const [newEmail, setNewEmail] = useState('');

  // Selected User for Permissions Matrix
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<User>(users[0] || currentUser);

  // CMS Settings State (Super Admin can edit organization and system section titles)
  const [cmsSaoName, setCmsSaoName] = useState(siteSettings.saoName);
  const [cmsSubdistrict, setCmsSubdistrict] = useState(siteSettings.subdistrict || 'อ่างแก้ว');
  const [cmsDistrict, setCmsDistrict] = useState(siteSettings.district || 'โพธิ์ทอง');
  const [cmsProvince, setCmsProvince] = useState(siteSettings.province || 'อ่างทอง');
  const [cmsZipcode, setCmsZipcode] = useState(siteSettings.zipcode || '14120');
  const [cmsFiscalYear, setCmsFiscalYear] = useState(siteSettings.fiscalYear);
  const [cmsAddress, setCmsAddress] = useState(siteSettings.address);
  const [cmsPhone, setCmsPhone] = useState(siteSettings.phone);
  const [cmsHotline, setCmsHotline] = useState(siteSettings.emergencyHotline);
  const [cmsEmail, setCmsEmail] = useState(siteSettings.email || 'saraban@angkeaw.go.th');
  const [cmsWebsite, setCmsWebsite] = useState(siteSettings.website || 'www.angkeaw.go.th');
  const [cmsLogoUrl, setCmsLogoUrl] = useState(siteSettings.logoUrl || '');
  
  // Section Titles & Headings (Requirement: แอดมินหลักสามารถแก้ไขหัวข้อต่างๆในระบบได้เอง)
  const [cmsEdocTitle, setCmsEdocTitle] = useState(siteSettings.edocTitle || 'ระบบสารบรรณอิเล็กทรอนิกส์ (E-Document)');
  const [cmsRepairTitle, setCmsRepairTitle] = useState(siteSettings.repairTitle || 'ระบบแจ้งซ่อมแซมสาธารณูปโภค (E-Repair)');
  const [cmsPermitTitle, setCmsPermitTitle] = useState(siteSettings.permitTitle || 'ระบบขอรับใบอนุญาตออนไลน์ (E-License)');
  const [cmsLeaveTitle, setCmsLeaveTitle] = useState(siteSettings.leaveTitle || 'ระบบยื่นและอนุมัติใบลาออนไลน์ (E-Leave)');
  const [cmsCalendarTitle, setCmsCalendarTitle] = useState(siteSettings.calendarTitle || 'ปฏิทินวาระงาน & ตารางเวรปฏิบัติหน้าที่ (Calendar & Duty)');
  const [cmsPublicPortalSlogan, setCmsPublicPortalSlogan] = useState(siteSettings.publicPortalSlogan || 'มุ่งมั่นพัฒนา บริการก้าวหน้า โปร่งใส ตรวจสอบได้ เพื่อประชาชนตำบลอ่างแก้ว');
  const [cmsAnnouncement, setCmsAnnouncement] = useState(siteSettings.announcementText);
  const [cmsSavedSuccess, setCmsSavedSuccess] = useState(false);

  // Handle Add User (Super Admin only account provisioning)
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find(d => d.id === newDeptId);
    const newId = `usr_${Date.now()}`;

    const newUser: User = {
      id: newId,
      username: newUsername,
      prefix: newPrefix,
      firstName: newFirstName,
      lastName: newLastName,
      position: newPosition,
      departmentId: newDeptId,
      departmentName: dept?.name || 'สำนักปลัด อบต.',
      role: newRole,
      email: newEmail || `${newUsername}@angkeaw.go.th`,
      phone: newPhone,
      isFirstLogin: true, // Forces password change on first login!
      status: 'active',
      modules: {
        centralRegistry: newRole === 'central_registry' || newRole === 'super_admin',
        deptRegistry: true,
        repairDispatch: newRole === 'technician' || newRole === 'super_admin',
        permitReview: newRole === 'dept_head' || newRole === 'super_admin',
        permitApprove: newRole === 'executive' || newRole === 'super_admin',
        leaveReview: newRole === 'dept_head' || newRole === 'super_admin',
        leaveApprove: newRole === 'executive' || newRole === 'super_admin',
        hrManagement: newRole === 'hr_admin' || newRole === 'super_admin',
        cmsAdmin: newRole === 'super_admin',
      },
    };

    onAddUser(newUser);
    setIsAddUserModalOpen(false);
    // Reset form
    setNewFirstName('');
    setNewLastName('');
    setNewPosition('');
    setNewUsername('');
    alert(`สร้างบัญชีผู้ใช้ใหม่สำหรับ "${newUser.prefix}${newUser.firstName}" เรียบร้อยแล้ว (รหัสผ่านเริ่มต้น: ${newDefaultPassword}) ระบบจะบังคับให้เปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก`);
  };

  // Toggle Module Permission
  const handleToggleModule = (moduleKey: keyof User['modules']) => {
    const updated: User = {
      ...selectedUserForPerms,
      modules: {
        ...selectedUserForPerms.modules,
        [moduleKey]: !selectedUserForPerms.modules[moduleKey],
      },
    };
    setSelectedUserForPerms(updated);
    onUpdateUser(updated);
  };

  // Toggle User Status (Active / Suspended)
  const handleToggleUserStatus = (u: User) => {
    const updated: User = {
      ...u,
      status: u.status === 'active' ? 'suspended' : 'active',
    };
    onUpdateUser(updated);
  };

  // Save CMS Settings (Persisting full organization & headings)
  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...siteSettings,
      saoName: cmsSaoName,
      subdistrict: cmsSubdistrict,
      district: cmsDistrict,
      province: cmsProvince,
      zipcode: cmsZipcode,
      fiscalYear: cmsFiscalYear,
      address: cmsAddress,
      phone: cmsPhone,
      emergencyHotline: cmsHotline,
      email: cmsEmail,
      website: cmsWebsite,
      logoUrl: cmsLogoUrl,
      edocTitle: cmsEdocTitle,
      repairTitle: cmsRepairTitle,
      permitTitle: cmsPermitTitle,
      leaveTitle: cmsLeaveTitle,
      calendarTitle: cmsCalendarTitle,
      publicPortalSlogan: cmsPublicPortalSlogan,
      announcementText: cmsAnnouncement,
    };
    onUpdateSettings(updated);
    setCmsSavedSuccess(true);
    setTimeout(() => setCmsSavedSuccess(false), 2500);
  };

  // Reset to Default Ang Keaw Pho Thong Ang Thong
  const handleResetToDefaultAngKeaw = () => {
    if (!window.confirm('คุณต้องการรีเซ็ตข้อมูล อบต. และหัวข้อระบบกลับสู่ค่าเริ่มต้น อบต.อ่างแก้ว อ.โพธิ์ทอง จ.อ่างทอง หรือไม่?')) return;
    setCmsSaoName('องค์การบริหารส่วนตำบลอ่างแก้ว');
    setCmsSubdistrict('อ่างแก้ว');
    setCmsDistrict('โพธิ์ทอง');
    setCmsProvince('อ่างทอง');
    setCmsZipcode('14120');
    setCmsFiscalYear(2569);
    setCmsAddress('เลขที่ 99 หมู่ที่ 2 ตำบลอ่างแก้ว อำเภอโพธิ์ทอง จังหวัดอ่างทอง 14120');
    setCmsPhone('035-691-234');
    setCmsHotline('035-691-199 (กู้ชีพ-กู้ภัย อบต.อ่างแก้ว 24 ชม.)');
    setCmsEmail('saraban@angkeaw.go.th');
    setCmsWebsite('www.angkeaw.go.th');
    setCmsLogoUrl('');
    setCmsEdocTitle('ระบบสารบรรณอิเล็กทรอนิกส์ (E-Document)');
    setCmsRepairTitle('ระบบแจ้งซ่อมแซมสาธารณูปโภค (E-Repair)');
    setCmsPermitTitle('ระบบขอรับใบอนุญาตออนไลน์ (E-License)');
    setCmsLeaveTitle('ระบบยื่นและอนุมัติใบลาออนไลน์ (E-Leave)');
    setCmsCalendarTitle('ปฏิทินวาระงาน & ตารางเวรปฏิบัติหน้าที่ (Calendar & Duty)');
    setCmsPublicPortalSlogan('มุ่งมั่นพัฒนา บริการก้าวหน้า โปร่งใส ตรวจสอบได้ เพื่อประชาชนตำบลอ่างแก้ว');
    setCmsAnnouncement('ยินดีต้อนรับสู่ระบบสารสนเทศและบริการอิเล็กทรอนิกส์ องค์การบริหารส่วนตำบลอ่างแก้ว อ.โพธิ์ทอง จ.อ่างทอง | บริการประชาชนโปร่งใส รวดเร็ว ด้วยใจเพื่อชุมชน');
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              ระบบจัดการผู้ใช้ สิทธิ์การเข้าถึง และการตั้งค่าเว็บไซต์ (Super Admin Dashboard)
            </h2>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">
              สิทธิ์ผู้ดูแลระบบสูงสุด
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ความปลอดภัยขั้นสูง: ปิดรับสมัครภายนอก, สร้างบัญชีโดย Admin, Granular RBAC รายบุคคล, และ CMS ปรับแต่งหัวข้อ อบต.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ เพิ่มบัญชีเจ้าหน้าที่ใหม่ (Provision Account)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl p-1 gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'users'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>รายชื่อเจ้าหน้าที่และบัญชีผู้ใช้ ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'permissions'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>กำหนดสิทธิ์เข้าใช้ระบบย่อยรายบุคคล (Granular Module RBAC)</span>
        </button>
        <button
          onClick={() => setActiveTab('cms')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'cms'
              ? 'bg-[#0F2C59] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>ตั้งค่าหัวข้อเว็บไซต์และข่าวประชาสัมพันธ์ (CMS Settings)</span>
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">บัญชีเจ้าหน้าที่ อบต. ในระบบ</span>
            <span className="text-slate-500">ปิดระบบลงทะเบียนภายนอก บัญชีต้องได้รับการสร้างโดย Admin เท่านั้น</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">ชื่อผู้ใช้ (Username)</th>
                  <th className="p-3.5">ชื่อ - นามสกุล</th>
                  <th className="p-3.5">ตำแหน่ง / สังกัด</th>
                  <th className="p-3.5">บทบาทหลัก</th>
                  <th className="p-3.5">เบอร์ติดต่อ</th>
                  <th className="p-3.5">สถานะบัญชี</th>
                  <th className="p-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {u.username}
                      {u.isFirstLogin && (
                        <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-800 px-1 rounded">
                          เข้าครั้งแรก
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {u.prefix}{u.firstName} {u.lastName}
                    </td>
                    <td className="p-3.5 text-slate-600 whitespace-nowrap">
                      <div>{u.position}</div>
                      <div className="text-[10px] text-slate-400">{u.departmentName}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium font-mono">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {u.phone}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status === 'active' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => {
                          setSelectedUserForPerms(u);
                          setActiveTab('permissions');
                        }}
                        className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded border border-blue-200 text-xs font-medium"
                      >
                        สิทธิ์ระบบย่อย
                      </button>
                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2 py-1 rounded text-xs font-medium border ${
                            u.status === 'active' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'ระงับ' : 'เปิด'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GRANULAR RBAC PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* User selector list (4 cols) */}
          <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase mb-2">เลือกเจ้าหน้าที่เพื่อกำหนดสิทธิ์</div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserForPerms(u)}
                  className={`w-full p-2.5 text-left rounded-lg text-xs flex items-center justify-between transition-colors ${
                    selectedUserForPerms.id === u.id
                      ? 'bg-[#0F2C59] text-white font-semibold'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate">
                    <div>{u.prefix}{u.firstName} {u.lastName}</div>
                    <div className={`text-[10px] truncate ${selectedUserForPerms.id === u.id ? 'text-blue-200' : 'text-slate-400'}`}>
                      {u.position}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1 rounded bg-black/20 shrink-0 ml-1">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Module Permission Toggles (8 cols) */}
          <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-heading">
                กำหนดสิทธิ์เข้าใช้ระบบย่อย: {selectedUserForPerms.prefix}{selectedUserForPerms.firstName} {selectedUserForPerms.lastName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedUserForPerms.position} · {selectedUserForPerms.departmentName} (Username: {selectedUserForPerms.username})
              </p>
            </div>

            {/* Matrix of Granular Toggles */}
            <div className="space-y-3">
              {[
                {
                  key: 'centralRegistry',
                  label: 'ระบบสารบรรณกลาง (สำนักปลัด)',
                  desc: 'สิทธิ์ในการลงทะเบียนรับหนังสือ ออกเลขที่รับอัตโนมัติ และจ่ายหนังสือให้กองงาน',
                  color: 'text-blue-800',
                },
                {
                  key: 'deptRegistry',
                  label: 'ระบบสารบรรณกองงาน',
                  desc: 'สิทธิ์ในการลงรับหนังสือเข้าสู่กอง และเสนอหัวหน้ากองงาน',
                  color: 'text-indigo-800',
                },
                {
                  key: 'repairDispatch',
                  label: 'ระบบจัดการงานช่าง / รับแจ้งซ่อม',
                  desc: 'สิทธิ์ในการรับจ่ายงานช่าง อัปเดตสถานะ กำหนดวัสดุอุปกรณ์ และอัปโหลดภาพหลังซ่อม',
                  color: 'text-amber-800',
                },
                {
                  key: 'permitReview',
                  label: 'ผู้พิจารณาคำขอใบอนุญาต (ขั้นที่ 1 หัวหน้ากอง)',
                  desc: 'สิทธิ์ในการตรวจสอบเอกสารหลักฐาน และลงความเห็นชอบคำขอใบอนุญาตของประชาชน',
                  color: 'text-emerald-800',
                },
                {
                  key: 'permitApprove',
                  label: 'ผู้อนุมัติออกใบอนุญาต (ขั้นที่ 2 ผู้บริหาร/ปลัด/นายก)',
                  desc: 'สิทธิ์ในการลงนามอนุมัติและออกเลขที่ใบอนุญาตอิเล็กทรอนิกส์',
                  color: 'text-purple-800',
                },
                {
                  key: 'leaveReview',
                  label: 'ผู้ตรวจสอบและเห็นชอบใบลา (หัวหน้าฝ่าย/ผอ.กอง)',
                  desc: 'สิทธิ์ในการลงความเห็นชอบการลาของผู้ใต้บังคับบัญชา',
                  color: 'text-blue-800',
                },
                {
                  key: 'leaveApprove',
                  label: 'ผู้อนุมัติการลาขั้นสุดท้าย (ปลัด / นายก อบต.)',
                  desc: 'สิทธิ์ในการอนุมัติใบลา ซึ่งจะทำให้ระบบตัดยอดวันลาออกจากโควตาคงเหลือ',
                  color: 'text-emerald-800',
                },
                {
                  key: 'hrManagement',
                  label: 'ฝ่ายบุคลากร (HR Admin Quota & Duty Roster)',
                  desc: 'สิทธิ์ในการกำหนดโควตาวันลาเริ่มต้นรายบุคคล และจัดการตารางเวรยามประจำวัน',
                  color: 'text-amber-800',
                },
                {
                  key: 'cmsAdmin',
                  label: 'ผู้ดูแลระบบและตั้งค่า CMS (Super Admin)',
                  desc: 'สิทธิ์ในการปรับแต่งชื่อ อบต. สร้างแบบฟอร์มใบอนุญาต และจัดการสิทธิ์สมาชิก',
                  color: 'text-red-800',
                },
              ].map((mod) => {
                const isEnabled = !!selectedUserForPerms.modules[mod.key as keyof User['modules']];

                return (
                  <div
                    key={mod.key}
                    onClick={() => handleToggleModule(mod.key as any)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isEnabled ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50/50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div>
                      <div className={`font-bold text-xs ${mod.color}`}>{mod.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</div>
                    </div>
                    <div>
                      {isEnabled ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                          <span>เปิดใช้งาน</span>
                          <ToggleRight className="w-6 h-6 text-blue-700" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span>ปิดใช้งาน</span>
                          <ToggleLeft className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CMS & ORGANIZATION SETTINGS (SUPER ADMIN CUSTOMIZER) */}
      {activeTab === 'cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-xs max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-heading flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-[#BE185D]" />
                <span>การตั้งค่าข้อมูล อบต., ตราสัญลักษณ์ และหัวข้อระบบ (CMS & Organization Customizer)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                แอดมินหลักสามารถแก้ไขชื่อ อบต., อำเภอ, จังหวัด, ข้อมูลติดต่อ, ตราสัญลักษณ์ รวมถึงเปลี่ยนหัวข้อโมดูลต่างๆ ในระบบได้เองอย่างอิสระ
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetToDefaultAngKeaw}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-pink-100 text-[#9D174D] border border-pink-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
              title="คืนค่าเริ่มต้น อบต.อ่างแก้ว อ.โพธิ์ทอง จ.อ่างทอง"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าเริ่มต้น อบต.อ่างแก้ว</span>
            </button>
          </div>

          {cmsSavedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>บันทึกการตั้งค่าข้อมูล อบต. และหัวข้อระบบทั้งหมดเรียบร้อยแล้ว ข้อมูลมีผลทั่วทั้งเว็บไซต์ทันที!</span>
            </div>
          )}

          <form onSubmit={handleSaveCMS} className="space-y-6 text-xs">
            {/* SECTION 1: EMBLEM & BRANDING */}
            <div className="p-4 bg-gradient-to-br from-pink-50/60 to-slate-50 rounded-2xl border border-pink-200 space-y-4">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#BE185D]" />
                <span>1. ตราสัญลักษณ์ อบต. (Official Emblem)</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Live Emblem Preview */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="p-3 bg-white rounded-2xl border-2 border-pink-300 shadow-md flex items-center justify-center">
                    <SaoEmblem logoUrl={cmsLogoUrl} size="lg" />
                  </div>
                  <span className="text-[10px] text-pink-700 font-bold font-mono">
                    {cmsLogoUrl ? 'ตราสัญลักษณ์กำหนดเอง' : 'ตราทางการ (Vector ลายไทย)'}
                  </span>
                </div>

                {/* Emblem Settings Input */}
                <div className="space-y-2 flex-1 w-full">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ลิงก์ URL ตรา อบต. (หรือเว้นว่างไว้เพื่อใช้ตราทางการลายกนกบัวทิพย์)
                    </label>
                    <input
                      type="url"
                      placeholder="เช่น https://example.com/logo-angkeaw.png (เว้นว่างไว้ได้)"
                      value={cmsLogoUrl}
                      onChange={(e) => setCmsLogoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono text-xs focus:ring-2 focus:ring-[#BE185D] bg-white"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCmsLogoUrl('')}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-[#9D174D] text-[11px]"
                    >
                      ใช้ตราสัญลักษณ์ทางการ (ค่าเริ่มต้น)
                    </button>
                    <span className="text-[10px] text-slate-400">
                      * ตราจะแสดงผลบน Header, หน้าบริการประชาชน, และหัวกระดาษใบอนุญาต
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: BASIC ORGANIZATION DETAILS (PHO THONG, ANG THONG) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#BE185D]" />
                <span>2. ข้อมูลองค์กรและการปกครองท้องถิ่น</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อองค์กร / องค์การบริหารส่วนตำบล *</label>
                  <input
                    type="text"
                    required
                    value={cmsSaoName}
                    onChange={(e) => setCmsSaoName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-[#BE185D] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีงบประมาณปัจจุบัน (พ.ศ.) *</label>
                  <input
                    type="number"
                    required
                    value={cmsFiscalYear}
                    onChange={(e) => setCmsFiscalYear(parseInt(e.target.value, 10) || 2569)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono font-bold focus:ring-2 focus:ring-[#BE185D] bg-white"
                  />
                </div>
              </div>

              {/* Subdistrict, District, Province, Zipcode (โพธิ์ทอง อ่างทอง) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำบล *</label>
                  <input
                    type="text"
                    required
                    value={cmsSubdistrict}
                    onChange={(e) => setCmsSubdistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อำเภอ *</label>
                  <input
                    type="text"
                    required
                    value={cmsDistrict}
                    onChange={(e) => setCmsDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จังหวัด *</label>
                  <input
                    type="text"
                    required
                    value={cmsProvince}
                    onChange={(e) => setCmsProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัสไปรษณีย์ *</label>
                  <input
                    type="text"
                    required
                    value={cmsZipcode}
                    onChange={(e) => setCmsZipcode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-mono font-bold focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>ที่ตั้งสำนักงาน อบต. ฉบับเต็ม *</span>
                </label>
                <input
                  type="text"
                  required
                  value={cmsAddress}
                  onChange={(e) => setCmsAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white focus:ring-2 focus:ring-[#BE185D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#BE185D]" />
                    <span>เบอร์โทรศัพท์สำนักงาน *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cmsPhone}
                    onChange={(e) => setCmsPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono bg-white focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    <span>สายด่วนฉุกเฉินและกู้ชีพ 24 ชม. *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cmsHotline}
                    onChange={(e) => setCmsHotline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono bg-white focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>อีเมลราชการ</span>
                  </label>
                  <input
                    type="email"
                    value={cmsEmail}
                    onChange={(e) => setCmsEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>เว็บไซต์ อบต.</span>
                  </label>
                  <input
                    type="text"
                    value={cmsWebsite}
                    onChange={(e) => setCmsWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: SYSTEM SECTION HEADINGS & TITLES (Requirement: แก้ไขหัวข้อต่างๆ ในระบบได้เอง) */}
            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-200 space-y-4">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#BE185D]" />
                <span>3. ปรับแต่งหัวข้อและชื่อระบบงานต่างๆ (System Headings Customizer)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อหัวข้อ: ระบบงานสารบรรณ
                  </label>
                  <input
                    type="text"
                    value={cmsEdocTitle}
                    onChange={(e) => setCmsEdocTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อหัวข้อ: ระบบแจ้งซ่อมแซมสาธารณูปโภค
                  </label>
                  <input
                    type="text"
                    value={cmsRepairTitle}
                    onChange={(e) => setCmsRepairTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อหัวข้อ: ระบบขอรับใบอนุญาตออนไลน์
                  </label>
                  <input
                    type="text"
                    value={cmsPermitTitle}
                    onChange={(e) => setCmsPermitTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อหัวข้อ: ระบบการลาออนไลน์
                  </label>
                  <input
                    type="text"
                    value={cmsLeaveTitle}
                    onChange={(e) => setCmsLeaveTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อหัวข้อ: ระบบปฏิทินวาระงานและเวรยาม
                  </label>
                  <input
                    type="text"
                    value={cmsCalendarTitle}
                    onChange={(e) => setCmsCalendarTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    คำขวัญ / สโลแกนหน้าบริการประชาชน
                  </label>
                  <input
                    type="text"
                    value={cmsPublicPortalSlogan}
                    onChange={(e) => setCmsPublicPortalSlogan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium focus:ring-2 focus:ring-[#BE185D]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: ANNOUNCEMENT TICKER */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ข้อความแถบประชาสัมพันธ์บนหน้าแรก (Announcement Ticker) *
              </label>
              <textarea
                rows={2}
                required
                value={cmsAnnouncement}
                onChange={(e) => setCmsAnnouncement(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#BE185D]"
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
              <span className="text-slate-500 text-[11px]">
                * เมื่อบันทึกแล้ว ข้อมูลจะอัปเดตและบันทึกค้างไว้ในระบบทันที
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#BE185D] to-[#9D174D] hover:from-[#9D174D] hover:to-[#831843] text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกการตั้งค่าทั้งหมดทันที</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: PROVISION NEW USER ACCOUNT */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6">
            <div className="px-5 py-4 bg-[#0F2C59] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm font-heading">เพิ่มบัญชีเจ้าหน้าที่ใหม่ (Admin Account Provisioning)</h3>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">คำนำหน้า</label>
                  <select
                    value={newPrefix}
                    onChange={(e) => setNewPrefix(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น กิตติพงษ์"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น สถิตมั่น"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่ง *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น เจ้าพนักงานธุรการ หรือ นายช่าง"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">กอง / สำนัก *</label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น kittipong.s"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัสผ่านเริ่มต้น (Default Password) *</label>
                  <input
                    type="text"
                    required
                    value={newDefaultPassword}
                    onChange={(e) => setNewDefaultPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">บทบาทหลัก (Role) *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="staff">เจ้าหน้าที่ทั่วไป (Staff)</option>
                    <option value="central_registry">สารบรรณกลาง สำนักปลัด</option>
                    <option value="technician">ช่าง / ผู้ซ่อมบำรุง (กองช่าง)</option>
                    <option value="dept_head">ผอ.กอง / หัวหน้าฝ่าย</option>
                    <option value="hr_admin">ฝ่ายบุคลากร (HR Admin)</option>
                    <option value="executive">ผู้บริหาร (ปลัด / นายก อบต.)</option>
                    <option value="super_admin">ผู้ดูแลระบบสูงสุด (Super Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                🔒 <strong>นโยบายความปลอดภัย:</strong> บัญชีจะถูกตั้งค่าสถานะ <code>isFirstLogin = true</code> เพื่อบังคับให้เจ้าหน้าที่เปลี่ยนรหัสผ่านใหม่ด้วยตนเองเมื่อเข้าสู่ระบบครั้งแรก
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"
                >
                  สร้างบัญชีเจ้าหน้าที่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
