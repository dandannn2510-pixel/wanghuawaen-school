// Service to manage school information and news announcements using LocalStorage
// This simulates a real database API, making it easily swappable with Supabase/Firebase.

const STORAGE_KEYS = {
  SCHOOL_INFO: 'wanghuawaen_school_info',
  NEWS: 'wanghuawaen_news',
  STAFF: 'wanghuawaen_staff',
  MESSAGES: 'wanghuawaen_messages',
  SUPABASE_CONFIG: 'wanghuawaen_supabase_config'
};

const DEFAULT_SCHOOL_INFO = {
  name: "โรงเรียนบ้านวังหัวแหวนพัฒนา",
  nameEn: "Ban Wang Hua Waen Phatthana School",
  slogan: "การศึกษาดี มีวินัย ใฝ่เรียนรู้ คู่คุณธรรม",
  region: "สำนักงานเขตพื้นที่การศึกษาประถมศึกษากำแพงเพชร เขต 2",
  directorName: "นายสุชาติ จันทร์บ้านโต้น",
  directorPosition: "ผู้อำนวยการโรงเรียนบ้านวังหัวแหวนพัฒนา",
  directorMsg: "ยินดีต้อนรับคณะครู นักเรียน ผู้ปกครอง และผู้มาเยือนทุกท่านเข้าสู่เว็บไซต์อย่างเป็นทางการของโรงเรียนบ้านวังหัวแหวนพัฒนา เรามุ่งมั่นพัฒนาคุณภาพการเรียนรู้ พัฒนาคุณธรรมจริยธรรม และส่งเสริมศักยภาพของนักเรียนในทุกมิติ เพื่อให้เป็นคนดี คนเก่ง และมีความสุขในสังคมเพื่อสอดรับกับสังคมในศตวรรษที่ 21",
  address: "หมู่ที่ 6 ตำบลวังหามแห อำเภอขาณุวรลักษบุรี จังหวัดกำแพงเพชร 62140",
  phone: "0-5578-0246",
  email: "banwanghuawaen@g.obec.go.th", // standard OBEC school email format
  googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1916.872335714618!2d99.5433991!3d16.0787341!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e0bd8766db67f5%3A0x1b4e6a8c47261182!2z4LmC4Lij4LiH4LmA4Lij4Li14Lii4LiZ4Lia4LmJ4Liy4LiZ4Lin4Lix4LiH4Lir4Lix4Lin4LmB4Lir4Lin4LiZ4Lie4Lix4LiS4LiZ4Liy!5e0!3m2!1sth!2sth!4v1783505957256!5m2!1sth!2sth",
  colors: {
    primary: "#0b2545", // Deep Royal Navy Blue
    secondary: "#e5b326" // Soft Premium Academic Gold/Yellow
  },
  logoUrl: "logo.jpg",
  heroBgUrl: "",
  stats: {
    teachers: 5,
    students: 65,
    levels: 8 // อ.2 - ป.6
  },
  vision: "มุ่งพัฒนาผู้เรียนให้มีคุณภาพตามมาตรฐานการศึกษา สร้างเสริมคุณธรรมนำความรู้ ควบคู่เทคโนโลยี ร่วมใจสืบสานวัฒนธรรมไทย ใส่ใจสิ่งแวดล้อม น้อมนำปรัชญาของเศรษฐกิจพอเพียง",
  mission: "จัดการศึกษาตั้งแต่ระดับปฐมวัยถึงประถมศึกษาอย่างทั่วถึง พัฒนาระบบการเรียนรู้ เน้นผู้เรียนเป็นสำคัญ ส่งเสริมบุคลากรให้มีคุณภาพ และบริหารจัดการโดยชุมชนมีส่วนร่วม",
  identity: "ยิ้มง่าย ไหว้สวย รวยน้ำใจ มีวินัยใฝ่การศึกษา ซึ่งเป็นจุดเน้นการหล่อหลอมพฤติกรรมพื้นฐานของเยาวชนและนักเรียนโรงเรียนบ้านวังหัวแหวนพัฒนาทุกคน"
};

const DEFAULT_NEWS = [
  {
    id: "news-1",
    title: "การสมัครเข้าเรียนระดับชั้นอนุบาล และชั้นประถมศึกษาปีที่ 1 ประจำปีการศึกษา 2569",
    subtitle: "เปิดรับสมัครตั้งแต่วันนี้ถึง 30 เมษายน 2569 สำหรับนักเรียนในเขตพื้นที่บริการและทั่วไป",
    category: "announcement", // announcement (ประกาศสำคัญ), pr (ข่าวประชาสัมพันธ์), activity (ข่าวกิจกรรม)
    content: "โรงเรียนบ้านวังหัวแหวนพัฒนา เปิดรับสมัครนักเรียนใหม่ประจำปีการศึกษา 2569 เพื่อเข้าศึกษาในระดับชั้นอนุบาล 2, อนุบาล 3 และระดับชั้นประถมศึกษาปีที่ 1\n\n**กำหนดการรับสมัคร:**\n- รับใบสมัครและยื่นใบสมัคร: วันที่ 1 - 30 เมษายน 2569 (ไม่เว้นวันหยุดราชการ)\n- ประกาศผลการคัดเลือกและรายงานตัว: วันที่ 5 พฤษภาคม 2569\n- มอบตัวและปฐมนิเทศ: วันที่ 10 พฤษภาคม 2569\n\n**หลักฐานที่ต้องเตรียม:**\n1. สำเนาสูติบัตรของนักเรียน (ใบเกิด)\n2. สำเนาทะเบียนบ้านของนักเรียน, บิดา, และมารดา\n3. สำเนาบัตรประจำตัวประชาชนของบิดาและมารดา\n4. รูปถ่ายขนาด 1.5 นิ้ว จำนวน 4 รูป\n\nสอบถามข้อมูลเพิ่มเติมได้ที่ห้องธุรการโรงเรียน หรือติดต่อหมายเลขโทรศัพท์ 0-5578-0246 ในวันและเวลาราชการ",
    date: "2026-03-15",
    author: "งานประชาสัมพันธ์โรงเรียน",
    imageUrl: "", // Will be drawn or fallback to dynamic SVG color placeholder in UI
    isPinned: true,
    status: "published",
    views: 128,
    attachmentName: "ใบสมัครเข้าเรียน 2569.pdf",
    attachmentUrl: "https://example.com/downloads/apply-form-2026.pdf",
    galleryUrls: ""
  },
  {
    id: "news-2",
    title: "กิจกรรมไหว้ครู ประจำปีการศึกษา 2569 'นอบน้อมวันทา บูชาคุณครู'",
    subtitle: "เพื่อส่งเสริมคุณธรรมจริยธรรม ความกตัญญูกตเวทิตาต่อครูอาจารย์",
    category: "activity",
    content: "เมื่อวันพฤหัสบดีที่ผ่านมา โรงเรียนบ้านวังหัวแหวนพัฒนาได้จัดกิจกรรมวันไหว้ครู ประจำปีการศึกษา 2569 นำโดย นายสุชาติ จันทร์บ้านโต้น ผู้อำนวยการโรงเรียน คณะครู บุคลากรทางการศึกษา และนักเรียนทุกระดับชั้นเข้าร่วมพิธีอย่างพร้อมเพรียง\n\nการจัดกิจกรรมในครั้งนี้มีวัตถุประสงค์เพื่อให้นักเรียนได้แสดงออกถึงความเคารพ รัก และกตัญญูกตเวทิตาต่อผู้ประสิทธิ์ประสาทวิชาความรู้ ตลอดจนเป็นการสืบสานวัฒนธรรมและประเพณีอันดีงามของไทย\n\nภายในพิธีมีการประกวดพานไหว้ครู ซึ่งนักเรียนแต่ละระดับชั้นได้ร่วมมือร่วมใจกันสร้างสรรค์พานไหว้ครูที่มีความสวยงาม ปราณีต และแฝงไปด้วยความคิดสร้างสรรค์ตามหลักปรัชญาเศรษฐกิจพอเพียง โรงเรียนขอขอบพระคุณผู้ปกครองทุกท่านที่ให้การสนับสนุนวัสดุอุปกรณ์ในการจัดทำพานของนักเรียนในครั้งนี้",
    date: "2026-06-18",
    author: "กลุ่มงานกิจกรรมนักเรียน",
    imageUrl: "",
    isPinned: false,
    status: "published",
    views: 85,
    attachmentName: "",
    attachmentUrl: "",
    galleryUrls: ""
  },
  {
    id: "news-3",
    title: "โครงการปรับปรุงภูมิทัศน์โรงเรียนและห้องเรียนอัจฉริยะ เพื่อรองรับการเรียนรู้ยุคใหม่",
    subtitle: "การพัฒนาแหล่งเรียนรู้และห้องเรียนส่งเสริมการใช้งานเทคโนโลยีเพื่อการศึกษา",
    category: "pr",
    content: "โรงเรียนบ้านวังหัวแหวนพัฒนา ได้ดำเนินโครงการปรับปรุงภูมิทัศน์และสิ่งแวดล้อมภายในโรงเรียนเพื่อสร้างบรรยากาศที่เอื้อต่อการเรียนรู้ของนักเรียน โดยได้รับการสนับสนุนงบประมาณและทรัพยากรส่วนหนึ่งจากชุมชนตำบลวังหามแห และสมาคมผู้ปกครอง\n\n**รายละเอียดการปรับปรุง:**\n1. การปรับปรุงห้องสมุดโรงเรียนให้เป็นศูนย์การเรียนรู้เชิงสร้างสรรค์ (Creative Learning Space)\n2. การติดตั้งสมาร์ททีวีและสื่อการเรียนรู้ออนไลน์สำหรับชั้นเรียนประถมศึกษา\n3. การปรับปรุงสนามเด็กเล่นและสวนหย่อมเชิงวิทยาศาสตร์สำหรับนักเรียนระดับปฐมวัย\n\nผู้อำนวยการ นายสุชาติ จันทร์บ้านโต้น เผยว่า 'โรงเรียนบ้านวังหัวแหวนพัฒนา มุ่งเน้นการสร้างสภาพแวดล้อมที่สะอาด ปลอดภัย และทันสมัย แม้เราจะเป็นโรงเรียนขนาดเล็ก แต่คุณภาพการศึกษาและการเข้าถึงสื่อเทคโนโลยีของนักเรียนจะต้องมีความเท่าเทียม เพื่อเตรียมความพร้อมให้เด็กๆ ก้าวทันโลกปัจจุบัน'",
    date: "2026-06-25",
    author: "งานบริหารงานทั่วไป",
    imageUrl: "",
    isPinned: false,
    status: "published",
    views: 64,
    attachmentName: "",
    attachmentUrl: "",
    galleryUrls: ""
  },
  {
    id: "news-4",
    title: "ประกาศหยุดเรียนเนื่องในวันสำคัญทางพระพุทธศาสนา วันอาสาฬหบูชาและวันเข้าพรรษา",
    subtitle: "ขอเชิญชวนผู้ปกครองและนักเรียนร่วมทำบุญตักบาตรและเวียนเทียนเพื่อสืบสานประเพณี",
    category: "announcement",
    content: "เนื่องด้วยในวันสำคัญทางพระพุทธศาสนา วันอาสาฬหบูชา และวันเข้าพรรษา โรงเรียนบ้านวังหัวแหวนพัฒนา ขอประกาศหยุดเรียนตามกำหนดการดังนี้:\n\n**กำหนดวันหยุดเรียน:**\n- วันพฤหัสบดีที่ 23 กรกฎาคม 2569 ถึง วันศุกร์ที่ 24 กรกฎาคม 2569\n- เปิดเรียนตามปกติในวันจันทร์ที่ 27 กรกฎาคม 2569\n\nทั้งนี้ ทางโรงเรียนขอเชิญชวนคณะครู บุคลากร นักเรียน และผู้ปกครอง ร่วมทำบุญตักบาตร หล่อเทียนพรรษา และเวียนเทียน ณ วัดใกล้บ้านท่าน เพื่อละเว้นอบายมุขและรักษาศีล 5 ในช่วงเทศกาลเข้าพรรษาปีนี้",
    date: "2026-07-05",
    author: "กลุ่มงานบริหารวิชาการ",
    imageUrl: "",
    isPinned: false,
    status: "published",
    views: 112,
    attachmentName: "",
    attachmentUrl: "",
    galleryUrls: ""
  }
];

const DEFAULT_STAFF = {
  director: {
    name: "นายสุชาติ จันทร์บ้านโต้น",
    position: "ผู้อำนวยการโรงเรียนบ้านวังหัวแหวนพัฒนา",
    qualification: "ครุศาสตรมหาบัณฑิต (ค.ม.) สาขาการบริหารการศึกษา",
    email: "suchart.chan@g.obec.go.th",
    motto: "บริหารงานอย่างมีระบบ พัฒนาการเรียนรู้สู่สากล น้อมนำหลักปรัชญาเศรษฐกิจพอเพียง",
    imageUrl: ""
  },
  teachers: [
    {
      id: "teacher-1",
      name: "นางพรพิมล อารีราษฎร์",
      position: "ครู วิทยฐานะชำนาญการพิเศษ",
      duty: "ครูประจำชั้นประถมศึกษาปีที่ 5 - 6",
      qualification: "ศึกษาศาสตรบัณฑิต (ศษ.บ.) สาขาประถมศึกษา",
      email: "pornpimon.a@g.obec.go.th",
      subject: "กลุ่มสาระการเรียนรู้ภาษาไทย และคณิตศาสตร์",
      gender: "female",
      imageUrl: ""
    },
    {
      id: "teacher-2",
      name: "นายเทวฤทธิ์ มะลิวรรณ",
      position: "ครู วิทยฐานะชำนาญการ",
      duty: "ครูประจำชั้นประถมศึกษาปีที่ 3 - 4",
      qualification: "ครุศาสตรบัณฑิต (ค.บ.) สาขาคอมพิวเตอร์ศึกษา",
      email: "tewarit.m@g.obec.go.th",
      subject: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
      gender: "male",
      imageUrl: ""
    },
    {
      id: "teacher-3",
      name: "นางสาวศิริลักษณ์ ดีพร้อม",
      position: "ครูผู้ช่วย",
      duty: "ครูประจำชั้นประถมศึกษาปีที่ 1 - 2",
      qualification: "ครุศาสตรบัณฑิต (ค.บ.) สาขาภาษาอังกฤษ",
      email: "sirilak.d@g.obec.go.th",
      subject: "กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ (ภาษาอังกฤษ)",
      gender: "female",
      imageUrl: ""
    },
    {
      id: "teacher-4",
      name: "นางสาวณิชนันทน์ แก้ววิเศษ",
      position: "ครูอัตราจ้าง",
      duty: "ครูประจำชั้นปฐมวัย (อนุบาล 2 - 3)",
      qualification: "ครุศาสตรบัณฑิต (ค.บ.) สาขาการศึกษาปฐมวัย",
      email: "nichanan.k@g.obec.go.th",
      subject: "กลุ่มกิจกรรมพัฒนาผู้เรียนและระดับปฐมวัย",
      gender: "female",
      imageUrl: ""
    }
  ]
};

// Helper to initialize local storage if it's empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO)) {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(DEFAULT_SCHOOL_INFO));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
  }
};

initializeStorage();

export const dbService = {
  // --- Supabase Cloud Sync Operations ---
  getSupabaseConfig() {
    const envUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rsukgfvutcagkpcfatfw.supabase.co';
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdWtnZnZ1dGNhZ2twY2ZhdGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NzQwODEsImV4cCI6MjA5OTA1MDA4MX0.YoIDvfwtSM-jO32vbRvsmV7mRzNd3UEB0epIAeAxyZ0';
    if (envUrl && envKey) {
      return { url: envUrl, key: envKey, source: 'env' };
    }
    const local = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.url && parsed.key) {
          return { url: parsed.url, key: parsed.key, source: 'local' };
        }
      } catch (e) {
        console.error("Error parsing local Supabase config:", e);
      }
    }
    return null;
  },

  saveSupabaseConfig(url, key) {
    if (!url || !key) {
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_CONFIG);
    } else {
      // Clean URL: remove trailing slashes and /rest/v1 suffix if present
      let cleanUrl = url.trim().replace(/\/+$/, "");
      if (cleanUrl.endsWith('/rest/v1')) {
        cleanUrl = cleanUrl.substring(0, cleanUrl.length - 8);
      }
      cleanUrl = cleanUrl.replace(/\/+$/, "");
      localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify({ url: cleanUrl, key: key.trim() }));
    }
  },

  async syncFromCloud() {
    const config = this.getSupabaseConfig();
    if (!config) return null;

    try {
      const res = await fetch(`${config.url}/rest/v1/school_portal_data?select=*`, {
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`
        }
      });
      if (!res.ok) {
        throw new Error(`Supabase REST query failed: ${res.statusText}`);
      }
      const data = await res.json();
      
      let hasChanges = false;
      data.forEach(item => {
        if (item.key && item.value !== undefined) {
          let storageKey = '';
          if (item.key === 'school_info') storageKey = STORAGE_KEYS.SCHOOL_INFO;
          else if (item.key === 'news') storageKey = STORAGE_KEYS.NEWS;
          else if (item.key === 'staff') storageKey = STORAGE_KEYS.STAFF;
          else if (item.key === 'messages') storageKey = STORAGE_KEYS.MESSAGES;

          if (storageKey) {
            const oldValue = localStorage.getItem(storageKey);
            const newValueStr = JSON.stringify(item.value);
            if (oldValue !== newValueStr) {
              localStorage.setItem(storageKey, newValueStr);
              hasChanges = true;
            }
          }
        }
      });

      if (hasChanges) {
        console.log('Database synced from cloud successfully with changes.');
        window.dispatchEvent(new Event('school_db_updated'));
      } else {
        console.log('Database synced from cloud. No changes.');
      }
      return true;
    } catch (e) {
      console.error('Failed to sync database from cloud:', e);
      return false;
    }
  },

  async syncToCloud(storageKey, value) {
    const config = this.getSupabaseConfig();
    if (!config) return { success: true, message: 'Local storage only' };

    let cloudKey = '';
    if (storageKey === STORAGE_KEYS.SCHOOL_INFO) cloudKey = 'school_info';
    else if (storageKey === STORAGE_KEYS.NEWS) cloudKey = 'news';
    else if (storageKey === STORAGE_KEYS.STAFF) cloudKey = 'staff';
    else if (storageKey === STORAGE_KEYS.MESSAGES) cloudKey = 'messages';

    if (!cloudKey) return { success: true };

    try {
      const res = await fetch(`${config.url}/rest/v1/school_portal_data`, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: cloudKey,
          value: value,
          updated_at: new Date().toISOString()
        })
      });
      if (!res.ok) {
        let details = '';
        try {
          const jsonErr = await res.json();
          details = jsonErr.message || jsonErr.error || JSON.stringify(jsonErr);
        } catch (_) {
          details = await res.text();
        }

        let errorMsg = `Supabase (HTTP ${res.status} ${res.statusText})`;
        if (res.status === 503 || res.status === 502) {
          errorMsg = `Supabase Paused/Offline (HTTP ${res.status}): ฐานข้อมูลคลาวด์ถูกสั่งหยุดพักเนื่องจากไม่มีความเคลื่อนไหว (กรุณากด Restore Project ที่ Supabase Dashboard)`;
        } else if (res.status === 413) {
          errorMsg = `Payload Too Large (HTTP 413): ข้อมูลและรูปภาพข่าวมีขนาดใหญ่เกินขีดจำกัดคลาวด์ กรุณาลดขนาดรูปภาพ`;
        } else if (details) {
          errorMsg += `: ${details.substring(0, 150)}`;
        }

        console.error(`Supabase cloud sync failed for key ${cloudKey}:`, errorMsg);
        return { success: false, error: errorMsg };
      } else {
        console.log(`Supabase cloud sync success for key: ${cloudKey}`);
        return { success: true };
      }
    } catch (e) {
      const errorMsg = `ไม่สามารถติดต่อคลาวด์ได้ (${e.message || 'Network Failure'})`;
      console.error(`Supabase cloud sync connection error for key ${cloudKey}:`, e);
      return { success: false, error: errorMsg };
    }
  },

  safeSetItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
        throw new Error('หน่วยความจำเบราว์เซอร์เต็ม (LocalStorage Quota Exceeded) เนื่องจากไฟล์รูปภาพมีขนาดใหญ่เกินไป กรุณาลดขนาดหรือลบรูปภาพออกบางส่วน');
      }
      throw e;
    }
  },

  // --- School Info Operations ---
  getSchoolInfo() {
    initializeStorage();
    try {
      const info = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO));
      let needSave = false;
      if (info) {
        if (!info.stats || !info.vision) {
          info.stats = info.stats || DEFAULT_SCHOOL_INFO.stats;
          info.vision = info.vision || DEFAULT_SCHOOL_INFO.vision;
          info.mission = info.mission || DEFAULT_SCHOOL_INFO.mission;
          info.identity = info.identity || DEFAULT_SCHOOL_INFO.identity;
          needSave = true;
        }
        if (info.logoUrl === undefined || info.logoUrl === "") {
          info.logoUrl = "logo.jpg";
          needSave = true;
        }
        if (info.heroBgUrl === undefined) {
          info.heroBgUrl = "";
          needSave = true;
        }
        if (info.colors && (info.colors.secondary === '#c5a059' || info.colors.secondary === '#fbbf24')) {
          info.colors.secondary = '#e5b326';
          needSave = true;
        }
      }
      if (needSave) {
        this.safeSetItem(STORAGE_KEYS.SCHOOL_INFO, info);
      }
      return info;
    } catch (e) {
      console.error("Error parsing school info:", e);
      return DEFAULT_SCHOOL_INFO;
    }
  },

  async updateSchoolInfo(info) {
    initializeStorage();
    this.safeSetItem(STORAGE_KEYS.SCHOOL_INFO, info);
    updateCSSVariables(info.colors);
    const cloudRes = await this.syncToCloud(STORAGE_KEYS.SCHOOL_INFO, info);
    if (cloudRes && !cloudRes.success) {
      throw new Error(`บันทึกในเครื่องสำเร็จ แต่ส่งข้อมูลไปคลาวด์ไม่ผ่าน: ${cloudRes.error}`);
    }
    return info;
  },

  // --- News Announcement CRUD Operations ---
  getNews() {
    initializeStorage();
    try {
      const news = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS)) || [];
      const sanitized = news.map(item => ({
        views: 0,
        status: 'published',
        isPinned: false,
        attachmentName: '',
        attachmentUrl: '',
        galleryUrls: '',
        ...item
      }));
      return sanitized.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date) - new Date(a.date);
      });
    } catch (e) {
      console.error("Error parsing news list:", e);
      return DEFAULT_NEWS;
    }
  },

  getNewsById(id) {
    const news = this.getNews();
    return news.find(n => n.id === id);
  },

  async createNews(newsItem) {
    const news = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS)) || [];
    const newItem = {
      views: 0,
      status: 'published',
      isPinned: false,
      attachmentName: '',
      attachmentUrl: '',
      galleryUrls: '',
      ...newsItem,
      id: `news-${Date.now()}`,
      date: newsItem.date || new Date().toISOString().split('T')[0]
    };
    news.push(newItem);
    this.safeSetItem(STORAGE_KEYS.NEWS, news);
    const cloudRes = await this.syncToCloud(STORAGE_KEYS.NEWS, news);
    if (cloudRes && !cloudRes.success) {
      throw new Error(`บันทึกในเครื่องสำเร็จ แต่ส่งขึ้นคลาวด์ไม่ผ่าน: ${cloudRes.error}`);
    }
    return newItem;
  },

  async updateNews(id, updatedItem) {
    const news = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS)) || [];
    const index = news.findIndex(n => n.id === id);
    if (index !== -1) {
      news[index] = { ...news[index], ...updatedItem, id };
      this.safeSetItem(STORAGE_KEYS.NEWS, news);
      const cloudRes = await this.syncToCloud(STORAGE_KEYS.NEWS, news);
      if (cloudRes && !cloudRes.success) {
        throw new Error(`บันทึกในเครื่องสำเร็จ แต่ส่งขึ้นคลาวด์ไม่ผ่าน: ${cloudRes.error}`);
      }
      return news[index];
    }
    throw new Error(`ไม่พบข่าวรหัส ${id} ในระบบ`);
  },

  async deleteNews(id) {
    const news = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS)) || [];
    const filteredNews = news.filter(n => n.id !== id);
    this.safeSetItem(STORAGE_KEYS.NEWS, filteredNews);
    const cloudRes = await this.syncToCloud(STORAGE_KEYS.NEWS, filteredNews);
    if (cloudRes && !cloudRes.success) {
      throw new Error(`ลบในเครื่องสำเร็จ แต่ส่งคำสั่งไปยังคลาวด์ไม่ผ่าน: ${cloudRes.error}`);
    }
    return true;
  },

  async incrementNewsViews(id) {
    try {
      const news = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS)) || [];
      const index = news.findIndex(n => n.id === id);
      if (index !== -1) {
        news[index].views = (news[index].views || 0) + 1;
        this.safeSetItem(STORAGE_KEYS.NEWS, news);
        this.syncToCloud(STORAGE_KEYS.NEWS, news);
        return news[index];
      }
    } catch (e) {
      console.error("Error incrementing views:", e);
    }
    return null;
  },

  // --- Staff Directory Operations ---
  getStaff() {
    initializeStorage();
    try {
      const staff = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF));
      if (!staff || !staff.director || !staff.teachers) {
        return DEFAULT_STAFF;
      }
      return staff;
    } catch (e) {
      console.error("Error parsing staff data:", e);
      return DEFAULT_STAFF;
    }
  },

  async updateDirector(directorInfo) {
    const staff = this.getStaff();
    staff.director = { ...staff.director, ...directorInfo };
    this.safeSetItem(STORAGE_KEYS.STAFF, staff);
    const cloudRes = await this.syncToCloud(STORAGE_KEYS.STAFF, staff);
    if (cloudRes && !cloudRes.success) {
      throw new Error(`บันทึกในเครื่องสำเร็จ แต่ส่งขึ้นคลาวด์ไม่ผ่าน: ${cloudRes.error}`);
    }
    return staff.director;
  },

  async createTeacher(teacherInfo) {
    const staff = this.getStaff();
    const newTeacher = {
      ...teacherInfo,
      id: `teacher-${Date.now()}`
    };
    staff.teachers.push(newTeacher);
    this.safeSetItem(STORAGE_KEYS.STAFF, staff);
    const cloudRes = await this.syncToCloud(STORAGE_KEYS.STAFF, staff);
    if (cloudRes && !cloudRes.success) {
      throw new Error(`บันทึกในเครื่องสำเร็จ แต่ส่งขึ้นคลาวด์ไม่ผ่าน: ${cloudRes.error}`);
    }
    return newTeacher;
  },

  async updateTeacher(id, updatedTeacherInfo) {
    const staff = this.getStaff();
    const index = staff.teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      staff.teachers[index] = { ...staff.teachers[index], ...updatedTeacherInfo, id };
      this.safeSetItem(STORAGE_KEYS.STAFF, staff);
      const cloudRes = await this.syncToCloud(STORAGE_KEYS.STAFF, staff);
      if (cloudRes && !cloudRes.success) {
        throw new Error(`บันทึกในเครื่องสำเร็จ แต่ส่งขึ้นคลาวด์ไม่ผ่าน: ${cloudRes.error}`);
      }
      return staff.teachers[index];
    }
    throw new Error(`ไม่พบบุคลากรรหัส ${id} ในระบบ`);
  },

  async deleteTeacher(id) {
    const staff = this.getStaff();
    staff.teachers = staff.teachers.filter(t => t.id !== id);
    this.safeSetItem(STORAGE_KEYS.STAFF, staff);
    const cloudRes = await this.syncToCloud(STORAGE_KEYS.STAFF, staff);
    if (cloudRes && !cloudRes.success) {
      throw new Error(`ลบในเครื่องสำเร็จ แต่ส่งคำสั่งไปยังคลาวด์ไม่ผ่าน: ${cloudRes.error}`);
    }
    return true;
  },

  async saveTeachersOrder(teachersList) {
    const staff = this.getStaff();
    staff.teachers = teachersList;
    this.safeSetItem(STORAGE_KEYS.STAFF, staff);
    const cloudRes = await this.syncToCloud(STORAGE_KEYS.STAFF, staff);
    if (cloudRes && !cloudRes.success) {
      throw new Error(`ปรับลำดับในเครื่องสำเร็จ แต่ส่งข้อมูลไปคลาวด์ไม่ผ่าน: ${cloudRes.error}`);
    }
    return true;
  },

  // --- Contact Messages Operations ---
  getMessages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async saveMessage(message) {
    const existingMsgs = this.getMessages();
    const newMsg = {
      ...message,
      id: `msg-${Date.now()}`,
      date: new Date().toISOString()
    };
    existingMsgs.push(newMsg);
    this.safeSetItem(STORAGE_KEYS.MESSAGES, existingMsgs);
    this.syncToCloud(STORAGE_KEYS.MESSAGES, existingMsgs);
    return newMsg;
  },

  async clearMessages() {
    this.safeSetItem(STORAGE_KEYS.MESSAGES, []);
    await this.syncToCloud(STORAGE_KEYS.MESSAGES, []);
  }
};

// Apply colors from theme to document root (Locked to premium school colors)
export const updateCSSVariables = () => {
  const primaryColor = "#0b2545"; // Deep Royal Navy Blue
  const secondaryColor = "#e5b326"; // Soft Gold/Yellow

  document.documentElement.style.setProperty('--color-primary', primaryColor);
  document.documentElement.style.setProperty('--color-secondary', secondaryColor);
  
  // Auto-calculate hover or lighter variants for background effects
  document.documentElement.style.setProperty('--color-primary-light', primaryColor + '1a'); // 10% opacity
  document.documentElement.style.setProperty('--color-primary-medium', primaryColor + '33'); // 20% opacity
  document.documentElement.style.setProperty('--color-primary-hover', adjustColorBrightness(primaryColor, 15));
};

// Helper function to adjust brightness of colors for hover effects
function adjustColorBrightness(hex, percent) {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  R = Math.round(R).toString(16).padStart(2, '0');
  G = Math.round(G).toString(16).padStart(2, '0');
  B = Math.round(B).toString(16).padStart(2, '0');

  return `#${R}${G}${B}`;
}
