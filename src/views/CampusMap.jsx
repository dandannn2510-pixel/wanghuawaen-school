import React, { useState } from 'react';
import { MapPin, Info, ArrowRight, Layers, Sparkles } from 'lucide-react';

export default function CampusMap({ setView }) {
  const [selectedBuilding, setSelectedBuilding] = useState('b1'); // default to Main Building b1
  const [flagpoleClickCount, setFlagpoleClickCount] = useState(0);

  const buildingsInfo = {
    b1: {
      id: 'b1',
      name: 'อาคารเรียนหลัก (อาคารวังพัฒนา)',
      type: 'อาคารเรียนสูง 2 ชั้น แบบมาตรฐาน',
      rooms: [
        'ชั้นที่ 1: ห้องเรียนชั้นอนุบาล 2 - 3, ห้องธุรการ, ห้องพักครู',
        'ชั้นที่ 2: ห้องเรียนชั้นประถมศึกษาปีที่ 1 - 6, ห้องคอมพิวเตอร์และเทคโนโลยีสารสนเทศ'
      ],
      desc: 'เป็นอาคารแกนหลักของโรงเรียนบ้านวังหัวแหวนพัฒนา ใช้สำหรับการเรียนการสอนวิชาสามัญหลัก ติดตั้งระบบสมาร์ททีวีเพื่อสื่อการสอนทางไกลและสื่อการสอนอัจฉริยะในทุกห้องเรียน',
      area: '240 ตร.ม.'
    },
    b2: {
      id: 'b2',
      name: 'อาคารอเนกประสงค์ และหอประชุม',
      type: 'อาคารโครงสร้างเปิดโล่งชั้นเดียว',
      rooms: [
        'พื้นที่หลัก: ลานจัดกิจกรรมรวมของโรงเรียน, ลานประชุมผู้ปกครอง, พื้นที่จัดนิทรรศการวิชาการ'
      ],
      desc: 'ใช้ในการจัดพิธีการต่างๆ วันสำคัญของชาติต่างๆ การทำบุญตักบาตร ประชุมใหญ่ของหมู่บ้าน และกิจกรรมกีฬาในร่มของนักเรียน',
      area: '180 ตร.ม.'
    },
    b3: {
      id: 'b3',
      name: 'โรงอาหาร และห้องสุขา',
      type: 'อาคารบริการนักเรียน',
      rooms: [
        'ส่วนโรงครัว: สถานที่จัดเตรียมอาหารกลางวันสะอาดถูกหลักอนามัย (โครงการอาหารกลางวันสพฐ.)',
        'ส่วนรับประทานอาหาร: โต๊ะเก้าอี้ไม้เป็นระเบียบสำหรับนักเรียนและบุคลากร',
        'ห้องสุขา: สุขารวมนักเรียน แยกชายหญิง ชัดเจน สะอาดและปลอดภัย'
      ],
      desc: 'สถานที่รับประทานอาหารกลางวันและพักดื่มนมของนักเรียนทุกระดับชั้น มีอ่างล้างมือสะอาดส่งเสริมสุขอนามัยที่ดีก่อนรับประทานอาหาร',
      area: '120 ตร.ม.'
    },
    b4: {
      id: 'b4',
      name: 'ลานเสาธงชาติ และสนามฟุตบอล',
      type: 'พื้นที่กิจกรรมกลางแจ้ง',
      rooms: [
        'จุดยืนหน้าเสาธง: กิจกรรมเคารพธงชาติ สวดมนต์เช้า และให้โอวาทแก่นักเรียน',
        'สนามหญ้ากีฬา: สนามฟุตบอลขนาดเล็กสำหรับชั่วโมงพลศึกษาและนันทนาการ'
      ],
      desc: 'ลานจุดศูนย์รวมหัวใจของโรงเรียนที่จัดกิจกรรมหน้าเสาธงในตอนเช้าของทุกวันเรียน เพื่อหล่อหลอมความรักชาติ ศาสนา พระมหากษัตริย์ และความมีวินัยของเยาวชน',
      area: '500 ตร.ม.'
    },
    b5: {
      id: 'b5',
      name: 'สนามเด็กเล่นสร้างสรรค์ (BBL)',
      type: 'พื้นที่เรียนรู้กลางแจ้ง',
      rooms: [
        'เครื่องเล่น: ชิงช้า, กระดานลื่น, บาร์ปีนป่ายพัฒนาการเคลื่อนไหวร่างกาย',
        'ลาน BBL: แผนภาพวาดเขียนบนพื้นคอนกรีตเพื่อพัฒนาสมอง (Brain-based Learning)'
      ],
      desc: 'ออกแบบมาเพื่อเด็กปฐมวัยโดยเฉพาะ เพื่อส่งเสริมการพัฒนากล้ามเนื้อมัดใหญ่และการเคลื่อนไหวร่างกายอย่างสนุกสนานท่ามกลางสิ่งแวดล้อมที่ร่มรื่น',
      area: '150 ตร.ม.'
    },
    b6: {
      id: 'b6',
      name: 'สวนเกษตรพอเพียง และเรือนเพาะชำ',
      type: 'แหล่งเรียนรู้นอกห้องเรียน',
      rooms: [
        'แปลงผักสวนครัว: ปลูกผักอินทรีย์สำหรับสนับสนุนโครงการอาหารกลางวันของโรงเรียน',
        'โรงเรือนเพาะเห็ดนางฟ้า: ฝึกอาชีพและการแปรรูปผลผลิตทางการเกษตรของนักเรียนชั้นประถม'
      ],
      desc: 'แหล่งฝึกปฏิบัติจริงตามแนวพระราชดำริหลักปรัชญาของเศรษฐกิจพอเพียง เพื่อให้นักเรียนเข้าใจวิถีเกษตรกรรม รู้จักการพึ่งพาตนเอง และนำผลิตผลส่งเข้าโครงการอาหารกลางวัน',
      area: '200 ตร.ม.'
    }
  };

  const handleSelectBuilding = (id) => {
    setSelectedBuilding(id);
  };

  return (
    <div className="campus-view container section-padding animate-fade-in">
      {/* Title */}
      <div className="page-header text-center mb-5">
        <span className="section-tag">CAMPUS PLAN</span>
        <h2 className="section-title">แผนผังโรงเรียน</h2>
        <div className="school-divider">
          <span className="school-divider-dot"></span>
        </div>
        <p className="section-subtitle">แผนผังแสดงตำแหน่งอาคารสถานที่ แหล่งเรียนรู้ต่างๆ ภายในบริเวณโรงเรียนบ้านวังหัวแหวนพัฒนา</p>
      </div>

      <div className="campus-layout mt-4">
        {/* Left Column: Interactive SVG Map */}
        <div className="map-column">
          <div className="map-card-wrapper">
            <div className="map-badge-header">
              <Layers size={16} />
              <span>แผนผังจำลองเชิงโต้ตอบ (คลิกเลือกอาคารเพื่อดูข้อมูล)</span>
            </div>
            
            {/* SVG Interactive Campus Map */}
            <div className="svg-container">
              <svg viewBox="0 0 800 600" className="campus-svg-blueprint">
                {/* Background Lawn Grass */}
                <rect x="0" y="0" width="800" height="600" fill="#f1f5f9" rx="16" />
                <rect x="30" y="30" width="740" height="540" fill="#e2f0d9" rx="12" stroke="#cbd5e1" strokeWidth="2" />
                
                {/* Grid Gridlines for Blueprint aesthetic */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(11, 37, 69, 0.03)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="30" y="30" width="740" height="540" fill="url(#grid)" rx="12" />

                {/* Road / Walkways inside school */}
                <path d="M 30 500 L 770 500 M 150 500 L 150 100 M 450 500 L 450 150" fill="none" stroke="#e2e8f0" strokeWidth="40" strokeLinecap="round" opacity="0.9" />
                <path d="M 30 500 L 770 500 M 150 500 L 150 100 M 450 500 L 450 150" fill="none" stroke="#cbd5e1" strokeWidth="36" strokeLinecap="round" strokeDasharray="5 5" opacity="0.6" />

                {/* Entrance gate label */}
                <text x="50" y="530" fill="var(--color-primary)" fontSize="14" fontWeight="600" fontFamily="Prompt">← ทางเข้าโรงเรียน</text>

                {/* Building 4: Football Field & Flagpole (Background area) */}
                <g 
                  className={`svg-interactive-group ${selectedBuilding === 'b4' ? 'active' : ''}`}
                  onClick={() => handleSelectBuilding('b4')}
                >
                  {/* Soccer field green circle/lines */}
                  <rect x="250" y="220" width="300" height="180" fill="#c2e0b4" rx="8" stroke="#7ab364" strokeWidth="2" />
                  <circle cx="400" cy="310" r="40" fill="none" stroke="#7ab364" strokeWidth="2" opacity="0.7" />
                  <line x1="400" y1="220" x2="400" y2="400" stroke="#7ab364" strokeWidth="2" opacity="0.7" />
                  <text x="400" y="315" textAnchor="middle" fill="#588d44" fontSize="12" fontWeight="500" fontFamily="Prompt" opacity="0.8">สนามฟุตบอล</text>
                  
                  {/* Flagpole circle */}
                  <circle cx="150" cy="270" r="18" fill="var(--color-primary)" opacity="0.1" />
                  <circle cx="150" cy="270" r="10" fill="var(--color-secondary)" />
                  <line x1="150" y1="270" x2="165" y2="285" stroke="var(--color-primary)" strokeWidth="3" />
                  <text x="150" y="250" textAnchor="middle" fill="var(--color-primary)" fontSize="13" fontWeight="600" fontFamily="Prompt">เสาธงชาติ</text>
                </g>

                {/* Building 1: Main Building */}
                <g 
                  className={`svg-interactive-group ${selectedBuilding === 'b1' ? 'active' : ''}`}
                  onClick={() => handleSelectBuilding('b1')}
                >
                  <rect x="70" y="70" width="160" height="90" fill="var(--color-primary)" rx="6" className="building-rect" />
                  <rect x="75" y="75" width="150" height="80" fill="none" stroke="var(--color-secondary)" strokeWidth="2" rx="4" />
                  <text x="150" y="120" textAnchor="middle" fill="white" fontSize="13" fontWeight="600" fontFamily="Prompt">อาคารเรียนหลัก</text>
                  <circle cx="215" cy="85" r="10" fill="var(--color-secondary)" />
                  <text x="215" y="89" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">1</text>
                </g>

                {/* Building 2: Multipurpose Hall */}
                <g 
                  className={`svg-interactive-group ${selectedBuilding === 'b2' ? 'active' : ''}`}
                  onClick={() => handleSelectBuilding('b2')}
                >
                  <rect x="580" y="70" width="140" height="90" fill="#3b5998" rx="6" className="building-rect" />
                  <rect x="585" y="75" width="130" height="80" fill="none" stroke="#fff" strokeWidth="1.5" rx="4" opacity="0.6" />
                  <text x="650" y="120" textAnchor="middle" fill="white" fontSize="13" fontWeight="600" fontFamily="Prompt">หอประชุมอเนกประสงค์</text>
                  <circle cx="705" cy="85" r="10" fill="var(--color-secondary)" />
                  <text x="705" y="89" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">2</text>
                </g>

                {/* Building 3: Canteen & Bathrooms */}
                <g 
                  className={`svg-interactive-group ${selectedBuilding === 'b3' ? 'active' : ''}`}
                  onClick={() => handleSelectBuilding('b3')}
                >
                  <rect x="580" y="380" width="140" height="80" fill="#5c3d2e" rx="6" className="building-rect" />
                  <text x="650" y="425" textAnchor="middle" fill="white" fontSize="13" fontWeight="600" fontFamily="Prompt">โรงอาหาร / สุขา</text>
                  <circle cx="705" cy="395" r="10" fill="var(--color-secondary)" />
                  <text x="705" y="399" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">3</text>
                </g>

                {/* Building 5: Playground */}
                <g 
                  className={`svg-interactive-group ${selectedBuilding === 'b5' ? 'active' : ''}`}
                  onClick={() => handleSelectBuilding('b5')}
                >
                  {/* Playground sandy patch */}
                  <rect x="70" y="360" width="140" height="110" fill="#fdf2e9" rx="10" stroke="#e07a5f" strokeWidth="2" strokeDasharray="3 3" />
                  {/* Seesaw/swing icons simplified */}
                  <line x1="100" y1="415" x2="150" y2="415" stroke="#e07a5f" strokeWidth="4" />
                  <line x1="125" y1="400" x2="125" y2="430" stroke="#8d99ae" strokeWidth="3" />
                  <text x="140" y="450" textAnchor="middle" fill="#b05b45" fontSize="12" fontWeight="600" fontFamily="Prompt">สนามเด็กเล่น BBL</text>
                  <circle cx="195" cy="375" r="10" fill="var(--color-secondary)" />
                  <text x="195" y="379" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">5</text>
                </g>

                {/* Building 6: Science Sufficiency Garden */}
                <g 
                  className={`svg-interactive-group ${selectedBuilding === 'b6' ? 'active' : ''}`}
                  onClick={() => handleSelectBuilding('b6')}
                >
                  {/* Garden green plot */}
                  <rect x="270" y="70" width="220" height="80" fill="#d8e2dc" rx="8" stroke="#9a8c98" strokeWidth="2" />
                  {/* Plant plots */}
                  <rect x="290" y="90" width="50" height="15" fill="#90a955" rx="2" />
                  <rect x="350" y="90" width="50" height="15" fill="#90a955" rx="2" />
                  <rect x="410" y="90" width="50" height="15" fill="#90a955" rx="2" />
                  <text x="380" y="130" textAnchor="middle" fill="#4f772d" fontSize="12" fontWeight="600" fontFamily="Prompt">สวนเกษตรพอเพียง</text>
                  <circle cx="475" cy="85" r="10" fill="var(--color-secondary)" />
                  <text x="475" y="89" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">6</text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Building Details Panel */}
        <aside className="details-column animate-fade-in" key={selectedBuilding}>
          {selectedBuilding ? (
            <div className="building-details-card">
              <div className="details-card-header">
                <span className="area-badge">อาคารหมายเลข {selectedBuilding.replace('b', '')}</span>
                <h3 className="building-title">{buildingsInfo[selectedBuilding].name}</h3>
                <span className="building-type"><Info size={14} /> {buildingsInfo[selectedBuilding].type}</span>
              </div>
              
              <div className="details-card-body">
                <div className="details-section">
                  <h5><Sparkles size={14} className="text-secondary" /> ลักษณะการใช้งานและรายละเอียด:</h5>
                  <p className="description-text">{buildingsInfo[selectedBuilding].desc}</p>
                </div>

                <div className="details-section mt-3">
                  <h5><Layers size={14} className="text-secondary" /> การแบ่งพื้นที่ใช้สอยภายใน:</h5>
                  <ul className="rooms-list">
                    {buildingsInfo[selectedBuilding].rooms.map((room, index) => (
                      <li key={index}>
                        <ArrowRight size={12} className="bullet-arrow" />
                        <span>{room}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="details-card-footer mt-4">
                  <div className="footer-meta-item">
                    <span className="lbl">ขนาดพื้นที่โดยประมาณ:</span>
                    <span className="val">{buildingsInfo[selectedBuilding].area}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection-card flex-center text-center">
              <div>
                <MapPin size={48} className="text-muted mb-3" style={{ margin: '0 auto' }} />
                <h4>กรุณาเลือกอาคารในแผนผัง</h4>
                <p className="text-muted">คลิกที่พื้นที่หรือสิ่งปลูกสร้างในแผนที่แผนผัง เพื่อแสดงรายละเอียดของสถานที่และอาคารเรียน</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <style>{`
        .campus-layout {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .campus-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        /* Map column container */
        .map-card-wrapper {
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .map-badge-header {
          background-color: var(--color-primary);
          color: white;
          padding: 12px 20px;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 2px solid var(--color-secondary);
        }

        .svg-container {
          padding: 20px;
          background-color: #fafbfc;
          display: flex;
          justify-content: center;
        }

        .campus-svg-blueprint {
          width: 100%;
          max-width: 700px;
          height: auto;
          display: block;
        }

        /* SVG Interactive groups */
        .svg-interactive-group {
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .svg-interactive-group:hover {
          filter: brightness(1.05) drop-shadow(0 4px 8px rgba(11, 37, 69, 0.15));
        }

        .building-rect {
          transition: var(--transition-smooth);
        }

        .svg-interactive-group:hover .building-rect {
          fill: var(--color-primary-hover);
        }

        .svg-interactive-group.active {
          filter: drop-shadow(0 4px 12px rgba(197, 160, 89, 0.4));
        }

        .svg-interactive-group.active .building-rect {
          fill: var(--color-primary) !important;
          stroke: var(--color-secondary);
          stroke-width: 2.5px;
        }

        /* Details Column card */
        .building-details-card {
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
          padding: 30px;
          border-top: 5px solid var(--color-primary);
        }

        .no-selection-card {
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          padding: 60px 30px;
          min-height: 350px;
          color: var(--color-text-muted);
        }

        .details-card-header {
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .area-badge {
          background-color: var(--color-secondary-light);
          color: var(--color-primary);
          border: 1px solid var(--color-secondary);
          padding: 4px 10px;
          font-family: var(--font-heading);
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 8px;
        }

        .building-title {
          font-size: 1.35rem;
          color: var(--color-primary);
          font-weight: 700;
          margin-bottom: 6px;
          line-height: 1.3;
        }

        .building-type {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .details-section h5 {
          font-size: 0.95rem;
          color: var(--color-primary);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .description-text {
          font-size: 0.95rem;
          color: var(--color-text-main);
          line-height: 1.6;
        }

        .rooms-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rooms-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--color-text-main);
          line-height: 1.4;
        }

        .bullet-arrow {
          color: var(--color-secondary);
          flex-shrink: 0;
          margin-top: 4px;
        }

        .details-card-footer {
          border-top: 1px dashed var(--color-border);
          padding-top: 16px;
        }

        .footer-meta-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
        }

        .footer-meta-item .lbl {
          color: var(--color-text-muted);
        }

        .footer-meta-item .val {
          font-weight: 600;
          color: var(--color-primary);
        }

        .mt-4 { margin-top: 1.5rem; }
        .mb-3 { margin-bottom: 1rem; }
      `}</style>
    </div>
  );
}
