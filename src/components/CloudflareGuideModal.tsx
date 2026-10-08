import React, { useState } from 'react';
import { 
  Cloud, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  Globe, 
  ArrowRight,
  Server,
  Download,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: '1. อัปโหลดโค้ดขึ้น GitHub (ฟรี)',
      desc: 'เก็บไฟล์ระบบไว้บนคลังเก็บข้อมูลออนไลน์',
    },
    {
      id: 2,
      title: '2. สมัครและเชื่อมต่อ Cloudflare Pages',
      desc: 'ใช้บริการฟรีระดับโลก ไม่จำกัดจำนวนคนเข้าใช้งาน',
    },
    {
      id: 3,
      title: '3. ตั้งค่า Build เพียง 2 ช่อง',
      desc: 'ระบบสร้างเว็บไซต์อัตโนมัติใน 1 นาที',
    },
    {
      id: 4,
      title: '4. ผูกโดเมน อบต. (angkeaw.go.th)',
      desc: 'พร้อมระบบกุญแจเขียว HTTPS ปลอดภัยสูงสุด',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-pink-200 w-full max-w-3xl overflow-hidden my-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#9D174D] via-[#BE185D] to-[#831843] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <Cloud className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-heading tracking-tight flex items-center gap-2">
                <span>คู่มือการนำระบบขึ้นใช้งานจริงบน Cloudflare Pages</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-300/40 px-2 py-0.5 rounded-full font-mono">
                  ฟรี 100%
                </span>
              </h3>
              <p className="text-xs text-pink-100/90">
                สำหรับผู้ดูแลระบบหรือเจ้าหน้าที่ที่ไม่มีความรู้ด้านเซิร์ฟเวอร์ ทำตามได้ทีละขั้นตอน
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="bg-pink-50 border-b border-pink-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-pink-900 shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#BE185D]" />
            <span className="font-medium">
              ทำไมแนะนำ <strong>Cloudflare Pages</strong>: โหลดเร็วทั่วโลก, รองรับประชาชนเข้าใช้งานพร้อมกันหลักหมื่นคน, มี SSL ฟรี, ป้องกันเว็บล่ม 100%
            </span>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 bg-slate-50 p-2 gap-1.5 shrink-0 text-xs">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-start gap-2 ${
                activeStep === s.id
                  ? 'bg-white border border-[#BE185D] text-[#9D174D] shadow-xs font-bold ring-1 ring-[#BE185D]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                activeStep === s.id
                  ? 'bg-[#BE185D] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {s.id}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{s.title.split('. ')[1]}</div>
                <div className="text-[10px] text-slate-400 truncate hidden sm:block">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed flex-1">
          {/* STEP 1 */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-heading">
                <div className="w-6 h-6 rounded-lg bg-pink-100 text-[#9D174D] flex items-center justify-center">1</div>
                <span>การเตรียมโค้ดขึ้น GitHub (ที่เก็บโค้ดออนไลน์ฟรีและปลอดภัย)</span>
              </div>
              
              <p>
                GitHub ทำหน้าที่เป็นที่จัดเก็บโค้ดเว็บไซต์ของ อบต.อ่างแก้ว โดยปลอดภัยและเปิดให้ใช้งานได้ฟรีตลอดชีพ เมื่อโค้ดถูกเก็บที่นี่ ทุกครั้งที่มีการแก้ไข Cloudflare จะอัปเดตเว็บไซต์จริงให้อัตโนมัติทันที
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ขั้นตอนปฏิบัติ:</span>
                </div>
                <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                  <li>
                    สมัครบัญชีฟรีที่ <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#BE185D] underline font-medium inline-flex items-center gap-1">github.com <ExternalLink className="w-3 h-3" /></a> (ใช้อีเมลราชการหรือ Gmail ของ อบต.)
                  </li>
                  <li>
                    คลิกปุ่มสีเขียว <strong>"New"</strong> เพื่อสร้าง Repository ใหม่ ตั้งชื่อเช่น <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">angkeaw-sao-portal</code>
                  </li>
                  <li>
                    เลือกการตั้งค่าเป็น <strong>Private</strong> (ส่วนตัว เฉพาะเจ้าหน้าที่ อบต.) หรือ Public
                  </li>
                  <li>
                    อัปโหลดโฟลเดอร์โปรเจกต์นี้ขึ้นไป หรือใช้คำสั่ง <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">git push</code> ตามปกติ
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>ไม่ต้องกลัวว่าข้อมูลจะหาย:</strong> โค้ดทั้งหมดสร้างด้วย Vite + React SPA ไฟล์ที่คอมไพล์แล้วจะเป็น HTML, CSS และ JavaScript ล้วนๆ ซึ่ง Cloudflare สามารถเสิร์ฟให้ประชาชนได้เร็วระดับเสี้ยววินาที!
                </span>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-heading">
                <div className="w-6 h-6 rounded-lg bg-pink-100 text-[#9D174D] flex items-center justify-center">2</div>
                <span>การเชื่อมต่อระบบกับ Cloudflare Pages (ฟรี 100%)</span>
              </div>

              <p>
                Cloudflare เป็นเครือข่ายคลาวด์ชั้นนำระดับโลก มีสาขาเซิร์ฟเวอร์ในประเทศไทย (กรุงเทพฯ) ทำให้ประชาชนในตำบลอ่างแก้วเข้าเว็บได้รวดเร็วทันใจ
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <ol className="list-decimal pl-5 space-y-2.5 text-slate-600">
                  <li>
                    สมัครบัญชีฟรีที่ <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noreferrer" className="text-[#BE185D] underline font-medium inline-flex items-center gap-1">dash.cloudflare.com <ExternalLink className="w-3 h-3" /></a>
                  </li>
                  <li>
                    ในแถบเมนูด้านซ้าย เลือกเมนู <strong>"Workers & Pages"</strong> ➔ คลิก <strong>"Overview"</strong>
                  </li>
                  <li>
                    คลิกปุ่ม <strong>"Create application"</strong> ด้านบนขวา
                  </li>
                  <li>
                    คลิกแท็บ <strong>"Pages"</strong> ➔ เลือก <strong>"Connect to Git"</strong>
                  </li>
                  <li>
                    เลือกบัญชี GitHub ของ อบต. และเลือกคลังเก็บข้อมูล <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">angkeaw-sao-portal</code> ที่สร้างไว้ในข้อ 1
                  </li>
                  <li>
                    คลิกปุ่ม <strong>"Begin setup"</strong>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-heading">
                <div className="w-6 h-6 rounded-lg bg-pink-100 text-[#9D174D] flex items-center justify-center">3</div>
                <span>การตั้งค่า Build Settings (กรอกเพียง 2 ค่าเท่านั้น)</span>
              </div>

              <p>
                ในหน้าการตั้งค่า Cloudflare Pages ให้ตรวจสอบหรือกรอกข้อมูลตามตารางนี้เท่านั้น:
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">หัวข้อการตั้งค่า</th>
                      <th className="p-3">ค่าที่ต้องกรอก / เลือก</th>
                      <th className="p-3 text-right">คัดลอก</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-sans font-medium text-slate-800">Framework preset</td>
                      <td className="p-3 text-[#9D174D] font-bold">Vite</td>
                      <td className="p-3 text-right">
                        <span className="text-[10px] text-slate-400 font-sans">เลือกใน Dropdown</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-sans font-medium text-slate-800">Build command</td>
                      <td className="p-3 text-blue-700 font-bold">npm run build</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleCopy('npm run build', 'build_cmd')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 inline-flex items-center gap-1 font-sans text-[11px]"
                        >
                          {copiedText === 'build_cmd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedText === 'build_cmd' ? 'คัดลอกแล้ว' : 'คัดลอก'}
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-sans font-medium text-slate-800">Build output directory</td>
                      <td className="p-3 text-emerald-700 font-bold">dist</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleCopy('dist', 'dist_cmd')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 inline-flex items-center gap-1 font-sans text-[11px]"
                        >
                          {copiedText === 'dist_cmd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedText === 'dist_cmd' ? 'คัดลอกแล้ว' : 'คัดลอก'}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-slate-600">
                จากนั้นกดปุ่ม <strong>"Save and Deploy"</strong> ระบบจะใช้เวลาประมาณ 45-60 วินาที และจะแสดงข้อความ <strong>"Success! Your site is deployed!"</strong> พร้อมมอบลิงก์เว็บไซต์ชั่วคราว เช่น <code className="bg-pink-100 text-[#9D174D] px-1.5 py-0.5 rounded font-mono">angkeaw-sao.pages.dev</code>
              </p>
            </div>
          )}

          {/* STEP 4 */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-heading">
                <div className="w-6 h-6 rounded-lg bg-pink-100 text-[#9D174D] flex items-center justify-center">4</div>
                <span>การผูกชื่อโดเมนทางการของ อบต. (Custom Domain)</span>
              </div>

              <p>
                เพื่อให้ประชาชนและหน่วยงานราชการเข้าใช้งานผ่านชื่อทางการ เช่น <code className="font-bold text-[#9D174D]">www.angkeaw.go.th</code>
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                  <li>
                    ในหน้าโครงการของ Cloudflare Pages คลิกที่แท็บ <strong>"Custom domains"</strong>
                  </li>
                  <li>
                    คลิกปุ่ม <strong>"Set up a custom domain"</strong>
                  </li>
                  <li>
                    พิมพ์ชื่อโดเมนของ อบต. เช่น <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">www.angkeaw.go.th</code> หรือ <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">angkeaw.go.th</code>
                  </li>
                  <li>
                    Cloudflare จะตรวจสอบและออกใบรับรองความปลอดภัย <strong>SSL/TLS Certificate ฟรีตลอดอายุการใช้งาน</strong> (เว็บขึ้นรูปกุญแจเขียวอัตโนมัติ)
                  </li>
                </ol>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>คำแนะนำเพิ่มเติมสำหรับผู้ดูแลระบบ:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
                  <li>ไม่ต้องเสียค่าเช่า Web Hosting รายปี ประหยัดงบประมาณ อบต. ได้ปีละหลายพันถึงหลายหมื่นบาท</li>
                  <li>มีระบบสำรองข้อมูลในเมนู Super Admin ของระบบนี้ สามารถกด Export ข้อมูลออกเป็น JSON ได้ตลอดเวลา</li>
                  <li>หาก อบต. มีเจ้าหน้าที่ใหม่ สามารถเพิ่มบัญชีผ่านระบบ Super Admin ได้ทันทีโดยไม่ต้องแก้ไขโค้ด</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500">
            ขั้นตอนที่ {activeStep} จาก 4
          </div>
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors"
              >
                ย้อนกลับ
              </button>
            )}
            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-5 py-2 bg-[#BE185D] hover:bg-[#9D174D] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>ขั้นตอนถัดไป</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#9D174D] hover:bg-[#831843] text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                เข้าใจแล้ว / ปิดหน้าต่าง
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
