import { useState, useRef, useEffect } from "react";

const KB = [
  "PROFILE KHACH LE: Thao tac nhap lieu khong thay doi. Cac truong thong tin se tu dong cap nhat 14-18h. Dam bao tinh nhat quan du lieu.",
  "PROFILE KHACH CONG TY: Can nhap: Thong tin VAT, Cho phep cong no hay khong, Han muc cong no, Thoi han thanh toan.",
  "BOOKING & FOLIO: He thong tu dong sinh 1 folio chinh theo guest khi tao reservation. User chinh sua booking tu trang thai Confirm. Tien phong ghi nhan tu dong moi dem. Tien dich vu dua vao hinh thuc ban va service date.",
  "DEPOSIT: Chi duoc them vao booking tai thoi diem Confirm. Bat buoc 100% truoc thoi diem Checkin. Journal cau hinh san theo chi nhanh va hinh thuc thanh toan.",
  "HOAN DEPOSIT: Hoan theo tung giao dich da thanh toan, KHONG ho tro dieu chinh so tien hoan. Sau Refund phai Cancel reservation de release inventory.",
  "CHECK-IN 4 buoc: 1-Chuan bi: Ops do bao cao Guest arrival report. 2-Kiem tra Deposit: phai du 100% truoc checkin. 3-Thuc hien Checkin: bam checkin luu Actual checkin. 4-Sau Checkin: Booking bi khoa, moi tac vu thuc hien tren Folio.",
  "CHECK-OUT 3 buoc: 1-Tai bao cao Guest departure report. 2-Khach xuong lam thu tuc. 3-Kiem tra balance tung folio, thu tien, add payment, dam bao balance=0.",
  "CHARGE & PAYMENT: Debit=adds vao folio balance (khach tieu dich vu). Credit=subtracts khoi folio balance (khach thanh toan). 3 buoc: Chon dich vu, Dien thong tin ngay/so luong/gia, Kiem tra Folio. Khach pay: add payment vao folio. Khach chua pay: khong can them thao tac.",
  "NIGHT AUDIT: Doanh thu 1 ngay ghi nhan la 01 Invoice. Invoice doi soat voi Deposit truoc, sau do Payment. Tien phong: 1 invoice/dem doi soat deposit. Dich vu da pay: 1 invoice + payment. Dich vu chua pay: 1 invoice chua co payment. He thong lock transaction khi chay.",
  "NO SHOW: Xac dinh no show 1 dem hay toan bo. Dung charge phi no show. Dieu chinh giam tien room sau khi xac dinh phi.",
  "ROOM MOVE: Dang Confirm: chi edit room tren booking, KHONG dung nut change room. Dang Check-in: Dung nut Change room he thong tu dong dieu chinh invoice. Upgrade: them chi phi. Downgrade: dieu chinh giam.",
  "TACH GOP FOLIO: Tach cung 1 khach: Tao folio 2, Transfer charge, Transfer nguoc ve neu can, Payment nhieu folio. Di nhom: Transfer charge qua folio booking khac.",
  "BOOKING B2B: Thong tin profile cong ty: phan loai cong no, ten, dia chi, MST, email, thoi han thanh toan, han muc. Khong no: can deposit, balance=0 checkout. Co no: nguoc lai. Folio cong ty: gan Company invoice, cong no ghi ve cong ty, xuat hoa don ve cong ty.",
  "BAO CAO FINANCE: General Ledger=doanh thu theo hang muc. Aged Receivable=tuoi no. Partner Ledger=cong no phai thu. Journal Audit=giao dich theo journal. Trial Balance=tong so du No/Co.",
].join("\n\n");

const TOPICS = [
  { id: "all", icon: "🏠", label: "Tat ca tinh nang" },
  { id: "profile", icon: "👤", label: "Profile khach" },
  { id: "booking", icon: "📅", label: "Booking & Folio" },
  { id: "deposit", icon: "💳", label: "Deposit" },
  { id: "charge", icon: "🧾", label: "Charge & Payment" },
  { id: "checkin", icon: "🔑", label: "Check-in / Check-out" },
  { id: "night", icon: "🌙", label: "Night Audit" },
  { id: "special", icon: "🔄", label: "No show / Room move" },
  { id: "b2b", icon: "🏢", label: "Booking B2B" },
  { id: "report", icon: "📊", label: "Bao cao Finance" },
];

const HOMEWORK = [
  { id: "bai1", label: "Bai 1 - Tao Moi Dat Phong", tag: "DIRECT", steps: 9, time: "5 phut",
    scenario: "Khach walk-in dat 01 phong, 2 nguoi lon, LOS=1D. Source=Walkin, Via=OPS.",
    buocs: ["Bao gia phong - Management dashboard, chon phong, chon ngay CI/CO","Chon loai phong & tao reservation - Click Create Booking","Khai bao so luong khach: 02 Adults","Nhap thong tin Booker + Guest","Nhap thong tin thong ke: Source=Walkin, Via=OPS","Confirm Booking - Click Save goc trai","Ghi nhan Reservation ID, tong tien, so dem","Special Request - VD: LCO Late Check Out","In Reg Card truoc check-in"] },
  { id: "bai2", label: "Bai 2 - Quan Ly Folio & Dat Coc", tag: "DIRECT", steps: 7, time: "5 phut",
    scenario: "Khach thanh toan tien coc truoc bang BANK. Deposit = 3,000,000 VND.",
    buocs: ["Chon loai phong & tao reservation","Khai bao so luong khach: 02 Adults","Nhap thong tin Booker + Guest","Nhap thong tin thong ke: Source=Walkin, Via=OPS","Confirm Booking","Ghi nhan Reservation ID","Ghi nhan Deposit: nhan nut Deposit, nhap 3,000,000 VND, chon Journal & Deposit type"] },
  { id: "bai3", label: "Bai 3 - Check-in & Nhan Phong", tag: "DIRECT", steps: 9, time: "5 phut",
    scenario: "Dung reservation tu Bai 1. Khach den lam thu tuc check-in, khai bao thong tin, phan phong.",
    buocs: ["Nhap thong tin ID khach chinh: Email/SDT, ID Passport/CCCD, Address","Add Sharer - link profiles khach phu","Them yeu cau Extra Bed trong muc Service","Ghi nhan Deposit hien tai - vao tab Deposit detail","Assign Room - phan phong phu hop","Move Room cung Room Type - ghi nhan Room No & Reason moi","Check-in","In Reg Card - ghi nhan so khach, loai phong","Checkin folio - ghi nhan RC, kiem tra Deposit trong folio"] },
  { id: "bai4", label: "Bai 4 - Hoan Coc & Cancel", tag: "DIRECT", steps: 11, time: "10 phut",
    scenario: "Khach dat 01 phong LOS=1D. Source=Internal reservation, Via=BOD. Khach lien he huy phong, hoan deposit.",
    buocs: ["Chon loai phong & tao reservation","Khai bao so luong khach: 02 Adults","Nhap thong tin Booker + Guest","Nhap thong tin thong ke: Source=Internal reservation, Via=BOD","Confirm Booking","Ghi nhan Reservation ID","Ghi nhan Deposit","Khach lien he huy phong - kiem tra policy huy","Refund deposit - nhan Refund, chon deposit, xac nhan","Cancel reservation","Kiem tra trang thai phong trong sau cancel"] },
  { id: "bai5", label: "Bai 5 - No Show", tag: "DIRECT", steps: 10, time: "10 phut",
    scenario: "Khach dat 01 phong LOS=1D, da deposit. Ngay checkin khach no show, xu ly thu phi.",
    buocs: ["Chon loai phong & tao reservation","Khai bao so luong khach: 02 Adults","Nhap thong tin Booker + Guest","Nhap thong tin thong ke: Source=Walkin, Via=OPS","Confirm Booking","Ghi nhan Reservation ID","Ghi nhan Deposit","Ngay checkin - kiem tra trang thai reservation","Xu ly no show - Mark no show full, nhap no show fee, xac nhan","Kiem tra trang thai reservation va no show fee"] },
  { id: "bai6", label: "Bai 6 - Dich Vu Trong Luu Tru", tag: "DIRECT", steps: 10, time: "10 phut",
    scenario: "Post minibar Coke x2, tao Folio 2 cho khach phu, split 50% transfer, thanh toan Visa.",
    buocs: ["Post Minibar Folio 1: Coke x2","Tao Folio 2 - Name = Khach phu","Split & Transfer 50% charge Minibar sang Folio 2","Thanh toan Folio 2 bang Visa - ghi nhan Receipt No","Ghi nhan Balance Folio 2","Kiem tra tong Balance tat ca folio","In Billing Folio truoc check-out","Ghi nhan so du Folio 1","Thanh toan Folio 1 bang Bank - ghi nhan Receipt No","Kiem tra tong Balance = 0"] },
  { id: "bai7", label: "Bai 7 - Payment & Check-out", tag: "DIRECT", steps: 7, time: "5 phut",
    scenario: "Khach chuan bi tra phong. Tat ca folio phai Balance=0 truoc Check-out.",
    buocs: ["Post LCO - ghi nhan tien phong, minibar, phi LCO","Ghi nhan Balance tung Folio (1,2,3,4) + Total Balance","Transfer Charge Folio 2 sang Folio 1","Post Payment Folio 1 - ghi nhan Receipt No","Kiem tra Balance = 0 tat ca folio","Thuc hien Check-out - ghi nhan Date/Time CO","Kiem tra trang thai phong sau CO"] },
  { id: "bai8", label: "Bai 8 - Tao Moi Dat Phong B2B", tag: "B2B", steps: 9, time: "10 phut",
    scenario: "Cong ty dat 01 phong, 2 nguoi lon, co BF, LOS=1D. Source=B2B Corp, Via=Agent.",
    buocs: ["Bao gia phong cho cong ty - chon goi gia mong muon","Chon loai phong & tao reservation - chon BF, Create Booking","Khai bao so luong khach: 02 Adults","Nhap Booker Company + Guest Information","Nhap thong tin: Source=B2B Corp, Via=Agent, Company VAT","Confirm Booking","Ghi nhan Reservation ID","Special Request: CONG TY THANH TOAN, OPS KHONG THU","Tai confirmation gui cho cong ty"] },
  { id: "bai9", label: "Bai 9 - Check-in B2B", tag: "B2B", steps: 7, time: "5 phut",
    scenario: "Dung reservation tu Bai 8. Cong ty duoc phep cong no nen khong can deposit.",
    buocs: ["Nhap thong tin ID khach chinh: Email/SDT, ID, Address","Add Sharer - link profiles khach phu","Kiem tra Deposit - cong ty cong no khong can deposit","Check-in","Checkin folio - ghi nhan RC va BF, Billing to = [Cong ty]","Chay Night audit","Ghi nhan Journal dem dau: txn codes tien phong va BF"] },
  { id: "bai10", label: "Bai 10 - Dich Vu Khach Tu Chi Tra", tag: "B2B", steps: 8, time: "5 phut",
    scenario: "Post minibar Coke x2, tao Folio 2 cho khach tu chi tra, thanh toan Visa.",
    buocs: ["Kiem tra folio cong ty tra - Billing to = [Company]","Tao Folio 2 cho dich vu khach tu tra - Billing to = [Guest]","Post Minibar Folio 1: Coke x2","Thanh toan Folio 2 bang Visa - ghi nhan Receipt No","Ghi nhan Balance Folio 2","Kiem tra tong Balance (Folio 1 + Folio 2)","Thuc hien Check-out - xac nhan Folio Balance > 0","Kiem tra trang thai phong sau CO"] },
  { id: "bai11", label: "Bai 11 - Checkout & Ghi Nhan Cong No", tag: "B2B", steps: 6, time: "10 phut",
    scenario: "Kiem tra so du cong no, in Journal Report, ghi nhan Balance AR.",
    buocs: ["Ghi nhan Balance Folio 1 va Folio 2","Thuc hien Check-out - xac nhan Folio Balance > 0","Kiem tra trang thai phong sau CO","Kiem tra han muc cong no moi trong profile cong ty","Kiem tra Invoice va Sales - ghi nhan Folio No & Invoice No","Kiem tra Aged Receivable - Accounting, Report, tim cong ty"] },
  { id: "bai12", label: "Bai 12 - Thanh Toan Cong No", tag: "B2B", steps: 7, time: "10 phut",
    scenario: "Post payment thanh toan hoa don cong no, ghi nhan Balance AR moi.",
    buocs: ["Tim profile cong ty can thanh toan","Kiem tra han muc cong no","Tim Invoice can thanh toan - Invoice = unpaid","Thuc hien Post payment - chon invoice, nhap gia tri, chon Journal","Kiem tra trang thai invoice = Paid","Kiem tra han muc cong no moi duoc update","Kiem tra Aged Receivable"] },
  { id: "bai14", label: "Bai 14 - Night Audit", tag: "NIGHT AUDIT", steps: 17, time: "30 phut",
    scenario: "Tao moi reservation, thuc hien day du quy trinh, chay night audit va ghi nhan doanh thu.",
    buocs: ["Chon loai phong & tao reservation LOS=1D","Khai bao so luong khach: 02 Adults","Nhap thong tin Booker + Guest","Nhap thong tin: Source=Walkin, Via=OPS","Confirm Booking","Ghi nhan Reservation ID","Ghi nhan Deposit","Check-in","Checkin folio - ghi nhan RC, kiem tra Deposit","Post Minibar Folio 1: Aqua x2","Thanh toan Folio 1 bang Bank","Kiem tra tong Balance","Chay Night Audit - neu co loi xu ly va chay tiep","Ghi nhan Journal dem dau: txn codes tien phong va minibar","Download report zip","Kiem tra Balance = 0","Thuc hien Check-out - ghi nhan Date/Time CO"] },
  { id: "bai15", label: "Bai 15 - Bao Cao Finance", tag: "FINANCE", steps: 6, time: "30 phut",
    scenario: "Kiem tra cac bao cao Finance tren he thong.",
    buocs: ["Kiem tra so du no tu FO","Bao cao General Ledger - ghi nhan doanh thu theo hang muc","Bao cao Aged Receivable - ghi nhan thong tin tuoi no","Bao cao Partner Ledger - ghi nhan so cong no phai thu","Bao cao Journal Audit - ghi nhan cac giao dich chinh","Bao cao Trial Balance - ghi nhan tong so du Debit/Credit"] },
];

const QUICK = [
  { icon: "🔑", text: "Quy trinh check-in tren NewPMS nhu the nao?" },
  { icon: "💳", text: "Deposit can thu 100% truoc khi nao?" },
  { icon: "❌", text: "Xu ly no show toan phan nhu the nao?" },
  { icon: "🌙", text: "Night audit ghi nhan doanh thu nhu the nao?" },
  { icon: "🏢", text: "Folio B2B khac folio khach le nhu the nao?" },
  { icon: "🔄", text: "Tach gop folio split transfer lam the nao?" },
];


const MEDIA = {
  profile: {
    images: [
      {
        url: "/images/profile_le.jpg",
        caption: "Form nhap thong tin Profile khach le tren NewPMS Odoo 18"
      }
    ],
    videos: []
  },
  profile_cty: {
    images: [
      {
        url: "/images/profile_cty.jpg",
        caption: "Profile khach cong ty - Tab Accounting: Customer Payment Terms, Total Receivable, Account Receivable, Deposit Account"
      }
    ],
    videos: []
  },
  booking: {
    images: [
      {
        url: "/images/booking_details.jpg",
        caption: "Booking Details - Danh sach Room Booking va Advance Service Lines (tien phong + dich vu kem theo)"
      },
      {
        url: "/images/folio_header.jpg",
        caption: "Folio - Le Vo Long (1): thong tin Folio chinh - Reservation, Status Checkin, Booker, Guest, tab Services & Billings"
      },
      {
        url: "/images/folio_services.jpg",
        caption: "Folio - Advance Service Lines: chi tiet cac dich vu phat sinh (charge, mo ta, service start/end, subtotal)"
      }
    ],
    videos: []
  },
  deposit: {
    images: [
      {
        url: "/images/deposit_popup.jpg",
        caption: "Deposit popup: nhap Amount, chon Journal theo chi nhanh, Payment Date, Types - chi duoc add khi booking Confirm"
      },
      {
        url: "/images/deposit_details.jpg",
        caption: "Deposit Details tab: lich su giao dich deposit - so phieu POCB, Journal OCB, Payment Method, Amount, State Paid"
      }
    ],
    videos: []
  },
  deposit_refund: {
    images: [
      {
        url: "/images/deposit_refund.jpg",
        caption: "Refund Deposit popup: chon so phieu deposit POCB, hien thi Guest, Amount, Deposit Account - bam Confirm de hoan"
      }
    ],
    videos: []
  },
  noshow: {
    images: [
      {
        url: "/images/noshow_full.jpg",
        caption: "No Show popup - Fully No Show: Mark Booking Fully No Show, nhap No-Show Fee, Confirm"
      },
      {
        url: "/images/noshow_partial.jpg",
        caption: "No Show popup - Partial No Show: Mark Booking Partial No Show, No-Show Fee, Guest Arrival Date (ngay khach thuc su den)"
      }
    ],
    videos: []
  },
  charge: {
    images: [
      {
        url: "/images/debit_credit.jpg",
        caption: "Debit vs Credit: Debit=1,000,000d (adds to balance, khach no khach san), Credit=1,000,000d (subtracts, khach tra tien/dieu chinh)"
      }
    ],
    videos: []
  },
  charge2: {
    images: [
      {
        url: "/images/charge_services.jpg",
        caption: "Advance Service Lines tren Folio: Charge, Description, Quantity, Unit Price, Service Start/End, Taxes, Subtotal"
      }
    ],
    videos: []
  }
};


function TypingDots() {
  return (
    <div style={{ display:"flex", gap:4, padding:"14px 16px", background:"#151d33", border:"1px solid #2a3a5e", borderRadius:"4px 14px 14px 14px" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#64748b", animation:"bounce 1.2s infinite", animationDelay:`${i*0.2}s` }} />
      ))}
    </div>
  );
}

function MediaMsg({ images, text }) {
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", maxWidth:700, width:"100%" }}>
      <div style={{ width:28, height:28, flexShrink:0, background:"linear-gradient(135deg,#3b82f6,#22d3ee)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2 }}>📸</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:10, color:"#64748b", fontFamily:"monospace", marginBottom:4 }}>AI · NewPMS · Hinh anh minh hoa</div>
        <div style={{ background:"#151d33", border:"1px solid #2a3a5e", borderRadius:"4px 14px 14px 14px", padding:"13px 15px" }}>
          {images.map((img, i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <img src={img.url} alt={img.caption} style={{ width:"100%", borderRadius:8, border:"1px solid #2a3a5e", display:"block" }} />
              <div style={{ fontSize:11, color:"#64748b", marginTop:5, fontStyle:"italic" }}>{img.caption}</div>
            </div>
          ))}
          <div style={{ fontSize:13, lineHeight:1.7, color:"#e2e8f0", marginTop:8, borderTop:"1px solid #2a3a5e", paddingTop:10, whiteSpace:"pre-line" }}>{text}</div>
        </div>
      </div>
    </div>
  );
}


function AiMsg({ html }) {
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", maxWidth:700, width:"100%" }}>
      <div style={{ width:28, height:28, flexShrink:0, background:"linear-gradient(135deg,#3b82f6,#22d3ee)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2 }}>⚡</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:10, color:"#64748b", fontFamily:"monospace", marginBottom:4 }}>AI · NewPMS</div>
        <div style={{ background:"#151d33", border:"1px solid #2a3a5e", borderRadius:"4px 14px 14px 14px", padding:"13px 15px", fontSize:13.5, lineHeight:1.7, color:"#e2e8f0" }}
          dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

function fmt(text) {
  let h = text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#60a5fa">$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:#1a2440;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#22d3ee">$1</code>');
  h = h.replace(/^(\d+)\.\s+(.+)$/gm, (_,n,c) =>
    `<div style="display:flex;gap:10px;padding:7px 10px;background:rgba(59,130,246,0.06);border-left:2px solid #3b82f6;border-radius:0 6px 6px 0;margin-bottom:5px"><span style="font-family:monospace;font-size:11px;color:#60a5fa;min-width:18px">${n}.</span><span style="font-size:13px">${c}</span></div>`
  );
  const lines = h.split('\n');
  const out = []; let inL = false;
  for (const l of lines) {
    if (l.match(/^[-•]\s+/)) { if(!inL){out.push('<ul style="padding-left:18px;margin:6px 0">');inL=true;} out.push(`<li style="margin-bottom:4px">${l.replace(/^[-•]\s+/,'')}</li>`); }
    else { if(inL){out.push('</ul>');inL=false;} out.push(l); }
  }
  if(inL) out.push('</ul>');
  h = out.join('\n');
  h = h.replace(/⚠[^\n]+/g, m => `<div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.25);border-radius:8px;padding:9px 12px;margin-top:8px;font-size:12.5px;color:#fdba74">${m}</div>`);
  h = h.replace(/📄[^\n]+/g, m => `<span style="display:inline-block;font-family:monospace;font-size:10px;padding:2px 7px;border-radius:4px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);color:#60a5fa;margin-top:10px">${m}</span>`);
  return h.replace(/\n/g,'<br>');
}

export default function TechHub() {
  const [topic, setTopic] = useState("all");
  const [shownMedia, setShownMedia] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");
    setMsgs(prev => [...prev, { role:"user", text:q }]);
    setLoading(true);
    const topicHint = topic !== "all" ? `\nUser dang xem chu de: ${topic}.` : "";
    const system = `Ban la tro ly AI ho tro training NewPMS Odoo 18 cho team Van hanh cua mvillage.\n\nKnowledge base:\n${KB}\n${topicHint}\n\nHuong dan: Tra loi tieng Viet, ngan gon, thuc te. Dung **bold** cho diem quan trong. Dung so thu tu cho quy trinh. Dung dau - cho danh sach. Them ⚠ Luu y: ... cho canh bao. Ket thuc bang 📄 Nguon: Training NewPMS Odoo 18.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages:[{role:"user",content:q}] })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Xin loi, khong the tra loi luc nay.";
      setMsgs(prev => [...prev, { role:"assistant", text:reply }]);
    } catch {
      setMsgs(prev => [...prev, { role:"assistant", text:"❌ Khong the ket noi. Vui long thu lai." }]);
    }
    setLoading(false);
  };

  const doHW = (hw) => {
    const q = "Toi muon thuc hanh " + hw.label + " (" + hw.steps + " buoc, " + hw.time + ").\nScenario: " + hw.scenario + "\nHay giai thich chi tiet tung buoc:\n" + hw.buocs.map((b,i) => (i+1)+". "+b).join("\n");
    send(q);
  };

  const handleKey = (e) => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} };

  const BtnStyle = (active) => ({ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 8px", borderRadius:7, border: active?"1px solid rgba(59,130,246,0.3)":"1px solid transparent", background: active?"rgba(59,130,246,0.1)":"transparent", color: active?"#60a5fa":"#94a3b8", fontSize:12, cursor:"pointer", textAlign:"left", marginBottom:1, transition:"all 0.15s" });

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#0a0e1a", color:"#e2e8f0", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .msg-anim{animation:fadeUp 0.3s ease} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#2a3a5e;border-radius:2px} .hbtn:hover{background:#1a2440!important;color:#e2e8f0!important} .pcrd:hover{background:#1a2440!important;border-color:#3b82f6!important;transform:translateY(-1px)}`}</style>

      {/* Header */}
      <div style={{ height:56, background:"rgba(10,14,26,0.95)", borderBottom:"1px solid #2a3a5e", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#3b82f6,#22d3ee)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>⚡</div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>Tech Hub</div>
            <div style={{ fontSize:9, color:"#22d3ee", letterSpacing:"1.5px", fontFamily:"monospace" }}>NEWPMS · ODOO 18</div>
          </div>
        </div>
        <div style={{ fontSize:10, padding:"3px 9px", borderRadius:4, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", color:"#10b981", fontFamily:"monospace" }}>● PILOT v0.1</div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* Sidebar */}
        <div style={{ width:220, flexShrink:0, borderRight:"1px solid #2a3a5e", background:"#0f1525", display:"flex", flexDirection:"column", overflowY:"auto", padding:"14px 0" }}>
          <div style={{ padding:"0 10px 12px" }}>
            <div style={{ fontSize:9, color:"#475569", letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"monospace", padding:"0 6px", marginBottom:6 }}>Chu de</div>
            {TOPICS.map(t => (
              <button key={t.id} className="hbtn" onClick={() => {
                setTopic(t.id); setShownMedia(false);
                if ((t.id === "profile" || t.id === "booking" || t.id === "deposit" || t.id === "charge" || t.id === "checkin" || t.id === "special") && !shownMedia) {
                  setShownMedia(true);
                  const allImgs = [
                    ...(MEDIA.profile ? MEDIA.profile.images : []),
                    ...(MEDIA.profile_cty ? MEDIA.profile_cty.images : [])
                  ];
                  setMsgs(prev => [...prev,
                    {
                      role: "media",
                      images: MEDIA.profile ? MEDIA.profile.images : [],
                      text: "PROFILE KHACH LE\n\nCac truong thong tin chinh:\n- Profile Name, Status, Sign Up Date\n- Mobile, CMND/CCCD/HC, Email\n- Identity Proof (upload file)\n- Address, Birthday, Gender, Occupation, Source\n- Booking Progress, Night Progress\n\nLuu y: Thao tac nhap lieu khong thay doi. Dam bao tinh nhat quan du lieu."
                    },
                    {
                      role: "media",
                      images: MEDIA.profile_cty ? MEDIA.profile_cty.images : [],
                      text: "PROFILE KHACH CONG TY (tab Accounting)\n\nCac thong tin can nhap:\n- Thong tin cong ty: ten, dia chi, MST, email\n- Ma khach ghi nhan cong no (Account Receivable)\n- Cho phep cong no hay khong\n- Han muc cong no (Total Receivable)\n- Thoi han thanh toan (Customer Payment Terms: 7 Days)\n- Deposit Account\n\nLuu y: Lien he ke toan de lay thong tin ma KH AR va han muc no truoc khi tao."
                    }
                    ,...(t.id === "booking" && MEDIA.booking ? [
                      {
                        role: "media",
                        images: [MEDIA.booking.images[0]],
                        text: "BOOKING DETAILS\n\nCau truc Booking tren NewPMS:\n- Booking Details: thong tin room booking chinh (guest, room type, room number, service start/end, price)\n- Rate Plan: goi gia ap dung\n- Add-on Services: dich vu kem theo\n- Deposit Details: thong tin dat coc\n- Guest in room: danh sach khach\n\nAdvance Service Lines: cac dich vu da ban kem theo booking (BF, minibar...) voi service start/end date rieng."
                      },
                      {
                        role: "media",
                        images: [MEDIA.booking.images[1], MEDIA.booking.images[2]],
                        text: "FOLIO\n\nMoi reservation tu dong sinh 1 Folio chinh theo main guest.\n\nCac action tren Folio sau checkin:\n- Payment: ghi nhan thanh toan\n- Print Bill: in hoa don\n- Change Room: chuyen phong\n- Transfer: chuyen charge sang folio khac\n- Cancel: huy folio\n\nCau truc Folio:\n- Services tab: Room Booking + Advance Service Lines + Promotion\n- Billings tab: lich su payment va invoice\n\nLuu y: Sau Checkin, booking bi khoa - moi thao tac phai thuc hien tren Folio."
                      }
                    ] : []),
                    ...(t.id === "deposit" && MEDIA.deposit ? [
                      {
                        role: "media",
                        images: [MEDIA.deposit.images[0]],
                        text: "DEPOSIT - POPUP NHAP LIEU\n\nCac truong can dien:\n- Amount: so tien dat coc\n- Journal: chon dung ngan hang/chi nhanh (Bank, OCB theo chi nhanh cu the)\n- Payment Date: ngay giao dich\n- Types: hinh thuc deposit\n\nLuu y quan trong:\n- Chi duoc add deposit khi booking o trang thai CONFIRM\n- Bat buoc 100% truoc thoi diem Checkin\n- Phai chon dung Journal theo chi nhanh va hinh thuc thanh toan"
                      },
                      {
                        role: "media",
                        images: [MEDIA.deposit.images[1]],
                        text: "DEPOSIT DETAILS TAB\n\nQuan ly tat ca giao dich deposit cua booking:\n- So phieu: POCB[chi nhanh]/[nam]/[so thu tu]\n- Journal: OCB theo chi nhanh cu the\n- Payment Method: Manual Payment\n- Customer: ten khach\n- Amount + State: Paid/Unpaid\n\nHe thong con co trang quan ly tat ca giao dich deposit cua toan he thong (khong phan biet booking) - dung de doi soat toan bo."
                      }
                    ] : []),
                    ...(t.id === "deposit" && MEDIA.deposit ? [
                      {
                        role: "media",
                        images: [MEDIA.deposit.images[0]],
                        text: "DEPOSIT - POPUP NHAP LIEU\n\nCac truong can dien:\n- Amount: so tien dat coc\n- Journal: chon dung ngan hang/chi nhanh (OCB theo chi nhanh)\n- Payment Date: ngay giao dich\n- Types: hinh thuc deposit\n\nLuu y:\n- Chi duoc add deposit khi booking CONFIRM\n- Bat buoc 100% truoc Checkin\n- Chon dung Journal theo chi nhanh va hinh thuc thanh toan"
                      },
                      {
                        role: "media",
                        images: [MEDIA.deposit.images[1]],
                        text: "DEPOSIT DETAILS TAB\n\nQuyen ly tat ca giao dich deposit cua booking:\n- So phieu: POCB[chi nhanh]/[nam]/[so]\n- Journal: OCB theo chi nhanh\n- Payment Method: Manual Payment\n- Customer, Amount, State (Paid)\n\nNgoai ra he thong con co trang quan ly deposit toan he thong de doi soat tat ca giao dich."
                      },
                      {
                        role: "media",
                        images: MEDIA.deposit_refund ? MEDIA.deposit_refund.images : [],
                        text: "HOAN DEPOSIT (Refund Deposit)\n\nPopup Refund Deposit hien thi:\n- Deposit: chon so phieu POCB can hoan\n- Guest: ten khach\n- Amount: so tien se hoan\n- Deposit Account: tai khoan deposit tuong ung\n\nNguyen tac:\n- Hoan theo TUNG giao dich da thanh toan, KHONG ho tro dieu chinh so tien hoan\n- He thong tu xu ly viec hoan tien, user chi can chon phieu va bam Confirm\n\nQuy trinh sau Refund:\n1. Bam Refund Deposit -> chon giao dich -> Confirm\n2. Bat buoc Cancel reservation de release inventory phong"
                      }
                    ] : []),
                    ...(t.id === "charge" && MEDIA.charge ? [
                      {
                        role: "media",
                        images: [MEDIA.charge.images[0]],
                        text: "CHARGE & PAYMENT - DEBIT va CREDIT\n\nDEBIT (Post a Charge):\n- Giao dich CONG them vao folio balance\n- Khach tieu dung dich vu, no khach san\n- Vi du: dat an nha hang, minibar, dich vu phat sinh\n\nCREDIT (Post a Payment):\n- Giao dich TRU khoi folio balance\n- Khach thanh toan hoac dieu chinh folio\n- Vi du: khach tra tien mat, the, chuyen khoan"
                      },
                      {
                        role: "media",
                        images: MEDIA.charge2 ? MEDIA.charge2.images : [],
                        text: "CACH GHI NHAN DICH VU PHAT SINH (Charge len Booking)\n\nAdvance Service Lines tren Folio hien thi:\n- Charge: ten dich vu (BF, Late Checkout, Minibar...)\n- Description, Category, Quantity\n- Unit Price: gia goc truoc thue\n- Service Start / Service End: ngay su dung thuc te\n- Number of nights, Taxes, Disc.%, Subtotal\n\n3 buoc thuc hien:\n1. Chon dich vu can charge\n2. Dien ngay su dung, so luong, dieu chinh gia neu can\n3. Kiem tra Folio - xac nhan line service va balance thay doi\n\nLuu y: Khach pay ngay -> add payment vao folio. Khach chua pay -> khong can them thao tac."
                      }
                    ] : []),
                    ...(t.id === "checkin" ? [
                      {
                        role: "media",
                        images: [],
                        text: "QUY TRINH CHECK-IN (4 buoc)\n\n1. CHUAN BI (Arrival Day)\n- Ops do bao cao Guest Arrival Report\n- Nam so luong khach va booking se checkin trong ngay\n\n2. KIEM TRA DEPOSIT\n- Kiem tra so tien deposit da du chua\n- Neu chua du: yeu cau hoan tat thu deposit truoc khi checkin\n- Deposit bat buoc 100% truoc Checkin\n\n3. THUC HIEN CHECKIN\n- Bam nut Checkin tren he thong\n- He thong luu Actual Checkin\n- Thoi gian luu tru chinh thuc bat dau ghi nhan\n\n4. SAU CHECKIN\n- Booking bi KHOA thao tac\n- Moi tac vu sau do (phat sinh, thanh toan) thuc hien tren FOLIO\n\nQUY TRINH CHECK-OUT (3 buoc)\n\n1. Ops tai bao cao Guest Departure Report\n2. Khach xuong lam thu tuc checkout\n3. Kiem tra balance tung folio -> thu tien -> add payment -> dam bao tat ca folio Balance = 0 truoc khi checkout"
                      }
                    ] : []),
                    ...(t.id === "special" && MEDIA.noshow ? [
                      {
                        role: "media",
                        images: [MEDIA.noshow.images[0]],
                        text: "NO SHOW - FULLY NO SHOW (Toan bo hanh trinh)\n\nXu ly:\n- Ops add charge no-show full tren he thong\n- Chon: Mark Booking Fully No Show\n- Nhap No-Show Fee\n- Bam Confirm\n\nSau do chay Night Audit:\n- Ghi nhan revenue tu charge no-show\n- Doi soat toan bo charge no-show voi deposit"
                      },
                      {
                        role: "media",
                        images: [MEDIA.noshow.images[1]],
                        text: "NO SHOW - PARTIAL NO SHOW (Mot phan hanh trinh)\n\nThiet lap thong tin:\n- Chon: Mark Booking Partial No Show\n- Nhap No-Show Fee\n- Nhap Guest Arrival Date (ngay khach thuc su den)\n\nHe thong tu dong tach booking thanh 2 phan:\n\n(1) Booking No Show:\n- Chua charge no-show\n- Chua phan deposit tuong ung\n\n(2) Booking goc (phan con lai):\n- Giu lai cac dem khach se luu tru\n- Giu lai phan deposit con lai\n\nLuu y: Ops can dieu chinh giam tien room cho phu hop sau khi xac dinh phi no show."
                      }
                    ] : [])
                  ]);
                }
              }} style={BtnStyle(topic===t.id)}>
                <span style={{ fontSize:13 }}>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <div style={{ height:1, background:"#2a3a5e", margin:"0 10px 12px" }} />
          <div style={{ padding:"0 10px" }}>
            <div style={{ fontSize:9, color:"#475569", letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"monospace", padding:"0 6px", marginBottom:6 }}>Homework</div>
            {["DIRECT","B2B","NIGHT AUDIT","FINANCE"].map(grp => (
              <div key={grp}>
                <div style={{ fontSize:9, color:"#334155", letterSpacing:"1px", padding:"4px 8px 2px", fontFamily:"monospace" }}>{grp}</div>
                {HOMEWORK.filter(h => h.tag===grp).map(h => (
                  <button key={h.id} className="hbtn" onClick={() => doHW(h)} style={{ ...BtnStyle(false), fontSize:11.5, lineHeight:1.4, alignItems:"flex-start" }}>
                    <span style={{ fontSize:11, marginTop:1, flexShrink:0 }}>📝</span>
                    <span>{h.label.replace(/Bai \d+ - /,"")}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
            {msgs.length === 0 && (
              <div style={{ maxWidth:640, margin:"20px auto 0", textAlign:"center" }}>
                <div style={{ width:60, height:60, background:"linear-gradient(135deg,rgba(59,130,246,0.2),rgba(34,211,238,0.2))", border:"1px solid rgba(59,130,246,0.3)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 14px" }}>⚡</div>
                <h2 style={{ fontSize:20, fontWeight:600, color:"#fff", marginBottom:8 }}>Xin chao!</h2>
                <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6, marginBottom:20 }}>Tro ly AI ho tro training NewPMS Odoo 18.<br/>Hoi toi bat cu dieu gi ve quy trinh van hanh.</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {QUICK.map(q => (
                    <div key={q.text} className="pcrd" onClick={() => send(q.text)} style={{ background:"#151d33", border:"1px solid #2a3a5e", borderRadius:10, padding:"11px 13px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"flex-start", gap:9, transition:"all 0.15s" }}>
                      <span style={{ fontSize:15, flexShrink:0 }}>{q.icon}</span>
                      <span style={{ fontSize:12, color:"#94a3b8", lineHeight:1.5 }}>{q.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m,i) => (
              <div key={i} className="msg-anim" style={{ maxWidth:700, width:"100%", margin:"0 auto", display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                {m.role==="user"
                  ? <div style={{ background:"#1d4ed8", borderRadius:"14px 14px 4px 14px", padding:"10px 14px", maxWidth:"75%", fontSize:13.5, lineHeight:1.6, color:"#fff" }}>{m.text}</div>
                  : m.role==="media"
                  ? <MediaMsg images={m.images} text={m.text} />
                  : <AiMsg html={fmt(m.text)} />
                }
              </div>
            ))}
            {loading && (
              <div className="msg-anim" style={{ maxWidth:700, width:"100%", margin:"0 auto" }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ width:28, height:28, flexShrink:0, background:"linear-gradient(135deg,#3b82f6,#22d3ee)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>⚡</div>
                  <div>
                    <div style={{ fontSize:10, color:"#64748b", fontFamily:"monospace", marginBottom:4 }}>AI · dang soan...</div>
                    <TypingDots />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ borderTop:"1px solid #2a3a5e", background:"#0f1525", padding:"14px 24px" }}>
            <div style={{ maxWidth:700, margin:"0 auto", display:"flex", alignItems:"flex-end", gap:10, background:"#151d33", border:`1px solid ${input?"#3b82f6":"#2a3a5e"}`, borderRadius:13, padding:"9px 13px", transition:"border-color 0.2s" }}>
              <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} placeholder="Hoi ve quy trinh, tinh nang NewPMS..." rows={1}
                style={{ flex:1, background:"none", border:"none", outline:"none", fontFamily:"inherit", fontSize:13.5, color:"#e2e8f0", resize:"none", minHeight:22, maxHeight:100, lineHeight:1.5 }} />
              <button onClick={()=>send()} disabled={!input.trim()||loading}
                style={{ width:32, height:32, flexShrink:0, background:input.trim()&&!loading?"#3b82f6":"#2a3a5e", border:"none", borderRadius:8, cursor:input.trim()&&!loading?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"white", transition:"all 0.15s" }}>
                ➤
              </button>
            </div>
            <div style={{ maxWidth:700, margin:"5px auto 0", fontSize:10, color:"#475569", fontFamily:"monospace", textAlign:"center" }}>Enter de gui · Shift+Enter xuong dong</div>
          </div>
        </div>
      </div>
    </div>
  );
}
