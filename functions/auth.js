export async function onRequestPost(context) {
  try {
    // 1. รับข้อมูลชื่อผู้ใช้และรหัสผ่านจากหน้าบ้าน (Frontend)
    const { username, password } = await context.request.json();
    
    // 2. ไปดึงรหัสผ่านที่ถูกต้องจาก Cloudflare KV (USER_DB) มาตรวจสอบ
    const storedPassword = await context.env.USER_DB.get(username);

    // 3. ตรวจสอบเงื่อนไข
    if (storedPassword && storedPassword === password) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "เข้าสู่ระบบสำเร็จ" 
      }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูลหลังบ้าน" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
