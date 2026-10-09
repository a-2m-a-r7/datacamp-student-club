import React, { useRef, useState } from 'react';
import { Certificate } from '../types';
import { Button } from './ui/Button';
import {
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  FileText,
  Printer,
  Eye,
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface CertificateViewProps {
  certificate: Certificate;
  onClose?: () => void;
}

// ─── Image Loader Helper ───
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = () => resolve(img);
      fallback.src = window.location.origin + src;
    };
    img.src = src;
  });
}

// ─── Golden Foil Notary Seal Generator ───
function drawGoldenSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.save();
  // 32-Point Notary Starburst
  const points = 32;
  const outerR = radius;
  const innerR = radius - 8;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Rich Luminous Metallic Gold Gradient
  const sealGrad = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.25, 4, cx, cy, radius);
  sealGrad.addColorStop(0, '#FEF08A'); // bright gold
  sealGrad.addColorStop(0.35, '#F59E0B'); // radiant amber
  sealGrad.addColorStop(0.75, '#D97706'); // deep gold
  sealGrad.addColorStop(1, '#78350F'); // antique bronze rim
  ctx.fillStyle = sealGrad;
  ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Concentric Embossed Gold Rings
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 15, 0, Math.PI * 2);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius - 22, 0, Math.PI * 2);
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Seal Engraved Inscriptions
  ctx.fillStyle = '#78350F';
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('★ OFFICIAL SEAL ★', cx, cy - 28);
  ctx.font = 'bold 9px monospace';
  ctx.fillText('ACADEMIC EXCELLENCE', cx, cy - 14);

  // Center Emblem Star
  ctx.font = '36px serif';
  ctx.fillStyle = '#92400E';
  ctx.fillText('★', cx, cy + 20);

  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#78350F';
  ctx.fillText('VERIFIED CREDENTIAL', cx, cy + 36);

  ctx.restore();
}

// ─── Direct High-Resolution Canvas Renderer (Instant, Zero-Hang, 300 DPI) ───
async function generateCertificateCanvas(
  cert: Certificate,
  qrCanvasElement?: HTMLCanvasElement | null
): Promise<HTMLCanvasElement> {
  // Ensure web fonts are completely ready before rasterizing
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  // Preload real official logo images
  const [dcLogo, univLogo] = await Promise.all([
    loadImg('/logos/datacamp-mark.png'),
    loadImg('/logos/innovation-university-mark.png'),
  ]);

  const canvas = document.createElement('canvas');
  // High-Resolution A4 Landscape at ~200-300 DPI (2400 x 1697)
  canvas.width = 2400;
  canvas.height = 1697;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const W = canvas.width;
  const H = canvas.height;

  // 1. Deep Obsidian / Royal Navy Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#030712');
  bgGrad.addColorStop(0.3, '#070f1e');
  bgGrad.addColorStop(0.7, '#081326');
  bgGrad.addColorStop(1, '#030712');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Center Ambient Luminescence
  const radialGlow = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 920);
  radialGlow.addColorStop(0, 'rgba(3, 239, 98, 0.09)');
  radialGlow.addColorStop(0.45, 'rgba(147, 51, 234, 0.05)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, W, H);

  // 3. Subtle Security Geometric Grid
  ctx.strokeStyle = 'rgba(0, 255, 204, 0.025)';
  ctx.lineWidth = 1;
  const step = 60;
  for (let x = 60; x < W - 60; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x, H - 60);
    ctx.stroke();
  }
  for (let y = 60; y < H - 60; y += step) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(W - 60, y);
    ctx.stroke();
  }

  // 4. Triple Regal Border Frame (Outer Gold + Royal Emerald + Inner Filigree)
  // Outer Gold Border Line
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  // Middle Rich Emerald Border
  ctx.strokeStyle = '#03EF62';
  ctx.lineWidth = 6;
  ctx.strokeRect(66, 66, W - 132, H - 132);

  // Inner Metallic Gold Accent
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 80, W - 160, H - 160);

  // Guilloché Security Guideline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(94, 94, W - 188, H - 188);

  // Four Corner Rosettes / Ornaments
  const cornerSize = 70;
  const drawCornerOrnament = (cx: number, cy: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, flipY);
    ctx.strokeStyle = '#03EF62';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, cornerSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.stroke();

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, cornerSize - 10);
    ctx.lineTo(10, 10);
    ctx.lineTo(cornerSize - 10, 10);
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', 26, 32);
    ctx.restore();
  };

  drawCornerOrnament(94, 94, 1, 1);
  drawCornerOrnament(W - 94, 94, -1, 1);
  drawCornerOrnament(94, H - 94, 1, -1);
  drawCornerOrnament(W - 94, H - 94, -1, -1);

  // 5. Dual Institutional Header: Left (DataCamp) & Right (Innovation University)
  const logoCardY = 125;
  const logoCardSize = 88;

  // Left: DataCamp Official Emblem Card
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(140, logoCardY, logoCardSize, logoCardSize, 18);
  ctx.fill();
  ctx.strokeStyle = '#03EF62';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(3, 239, 98, 0.45)';
  ctx.shadowBlur = 16;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Real DataCamp Logo Draw
  if (dcLogo && dcLogo.complete && dcLogo.naturalWidth > 0) {
    ctx.drawImage(dcLogo, 140 + 10, logoCardY + 10, logoCardSize - 20, logoCardSize - 20);
  }

  ctx.textAlign = 'left';
  ctx.font = 'bold 30px "Cinzel", "Orbitron", "Space Grotesk", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('DATACAMP', 248, 160);
  ctx.fillStyle = '#03EF62';
  ctx.fillText('STUDENT CLUB', 430, 160);
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('OFFICIAL UNIVERSITY CHAPTER', 248, 188);

  // Center Badge: OFFICIAL CREDENTIAL
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(3, 239, 98, 0.1)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 210, 138, 420, 44, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(3, 239, 98, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 15px "Cinzel", "Space Grotesk", sans-serif';
  ctx.fillStyle = '#03EF62';
  ctx.fillText('★  OFFICIAL ACADEMIC CREDENTIAL  ★', W / 2, 165);
  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('JOINT ACCREDITATION & REGISTRY SYSTEM', W / 2, 202);

  // Right: Innovation University Emblem Card
  ctx.fillStyle = '#45287c';
  ctx.beginPath();
  ctx.roundRect(W - 140 - logoCardSize, logoCardY, logoCardSize, logoCardSize, 18);
  ctx.fill();
  ctx.strokeStyle = '#C084FC';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(147, 51, 234, 0.45)';
  ctx.shadowBlur = 16;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Real Innovation University Logo Draw
  if (univLogo && univLogo.complete && univLogo.naturalWidth > 0) {
    ctx.drawImage(univLogo, W - 140 - logoCardSize + 10, logoCardY + 10, logoCardSize - 20, logoCardSize - 20);
  }

  ctx.textAlign = 'right';
  ctx.font = 'bold 28px "Cinzel", "Orbitron", "Space Grotesk", sans-serif';
  ctx.fillStyle = '#E9D5FF';
  ctx.fillText('INNOVATION UNIVERSITY', W - 248, 160);
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('ACADEMIC ACCREDITATION PARTNER', W - 248, 188);

  // 6. Header Separator Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, 236);
  ctx.lineTo(W - 140, 236);
  ctx.stroke();

  // 7. Certificate Main Title (Calculated Without ANY Overlap)
  ctx.textAlign = 'center';
  ctx.font = '600 18px "Cinzel", "Space Grotesk", serif';
  ctx.fillStyle = '#F59E0B';
  ctx.letterSpacing = '6px';
  ctx.fillText('—  DIPLOMA OF EXCELLENCE  —', W / 2, 305);
  ctx.letterSpacing = '0px';

  // Measure and render "CERTIFICATE OF ACHIEVEMENT" seamlessly side-by-side
  const titlePart1 = 'CERTIFICATE OF ';
  const titlePart2 = 'ACHIEVEMENT';
  ctx.font = 'bold 68px "Cinzel", "Playfair Display", Georgia, serif';
  const w1 = ctx.measureText(titlePart1).width;
  ctx.font = 'bold 68px "Cinzel", "Playfair Display", Georgia, serif';
  const w2 = ctx.measureText(titlePart2).width;
  const totalTitleW = w1 + w2;
  const titleStartX = (W - totalTitleW) / 2;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
  ctx.shadowBlur = 14;
  ctx.fillText(titlePart1, titleStartX, 385);

  ctx.fillStyle = '#03EF62';
  ctx.shadowColor = 'rgba(3, 239, 98, 0.65)';
  ctx.shadowBlur = 22;
  ctx.fillText(titlePart2, titleStartX + w1, 385);
  ctx.shadowBlur = 0; // reset

  // Title Subtitle
  ctx.textAlign = 'center';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.letterSpacing = '4px';
  ctx.fillText('VERIFIED ACADEMIC & TECHNICAL ACCREDITATION', W / 2, 430);
  ctx.letterSpacing = '0px';

  // Decorative Golden Divider with Center Diamond Jewels
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 250, 460);
  ctx.lineTo(W / 2 - 40, 460);
  ctx.moveTo(W / 2 + 40, 460);
  ctx.lineTo(W / 2 + 250, 460);
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.font = '16px serif';
  ctx.fillText('◆   ✦   ◆', W / 2, 466);

  // 8. Recipient Preamble
  ctx.font = '600 17px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.letterSpacing = '3px';
  ctx.fillText('THIS CREDENTIAL IS PROUDLY CONFERRED UPON', W / 2, 535);
  ctx.letterSpacing = '0px';

  // 9. Recipient Name (Huge, Prominent, Regal Masterpiece)
  const recipientName = cert.userFullName.trim().toUpperCase();
  let nameFontSize = 105;
  ctx.font = `bold ${nameFontSize}px "Playfair Display", "Cinzel", Georgia, serif`;
  let nameMetrics = ctx.measureText(recipientName);
  while (nameMetrics.width > 1650 && nameFontSize > 60) {
    nameFontSize -= 5;
    ctx.font = `bold ${nameFontSize}px "Playfair Display", "Cinzel", Georgia, serif`;
    nameMetrics = ctx.measureText(recipientName);
  }
  const nameW = nameMetrics.width;

  // Draw side decorative wings for the name
  const wingY = 630;
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  // Left wing
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameW / 2 - 160, wingY);
  ctx.lineTo(W / 2 - nameW / 2 - 35, wingY);
  ctx.stroke();
  ctx.fillStyle = '#F59E0B';
  ctx.font = '24px serif';
  ctx.fillText('✦', W / 2 - nameW / 2 - 18, wingY + 8);

  // Right wing
  ctx.beginPath();
  ctx.moveTo(W / 2 + nameW / 2 + 35, wingY);
  ctx.lineTo(W / 2 + nameW / 2 + 160, wingY);
  ctx.stroke();
  ctx.fillText('✦', W / 2 + nameW / 2 + 18, wingY + 8);

  // Recipient Name with Silver/White Glow (Explicitly applying font!)
  ctx.font = `bold ${nameFontSize}px "Playfair Display", "Cinzel", Georgia, serif`;
  const nameGrad = ctx.createLinearGradient(W / 2 - nameW / 2, 0, W / 2 + nameW / 2, 0);
  nameGrad.addColorStop(0, '#FFFFFF');
  nameGrad.addColorStop(0.5, '#F8FAFC');
  nameGrad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = nameGrad;
  ctx.shadowColor = 'rgba(3, 239, 98, 0.45)';
  ctx.shadowBlur = 28;
  ctx.fillText(recipientName, W / 2, 650);
  ctx.shadowBlur = 0;

  // Thin underline divider with center diamond
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - Math.max(nameW / 2 + 60, 360), 690);
  ctx.lineTo(W / 2 - 30, 690);
  ctx.moveTo(W / 2 + 30, 690);
  ctx.lineTo(W / 2 + Math.max(nameW / 2 + 60, 360), 690);
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(W / 2, 690, 6, 0, Math.PI * 2);
  ctx.fill();

  // 10. Conferred Statement
  ctx.font = '500 24px "Inter", "JetBrains Mono", sans-serif';
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText(
    'for successfully completing the curriculum, rigorous coding assessments, and practical challenges in',
    W / 2,
    760
  );

  // 11. Program / Course Title in Luxury Glass Container
  const courseTitle = cert.courseTitle || cert.eventTitle || 'Advanced DataCamp Technical Program';
  ctx.font = 'bold 50px "Cinzel", "Space Grotesk", sans-serif';
  const titleMetrics = ctx.measureText(courseTitle);
  const titleBoxW = Math.max(titleMetrics.width + 160, 820);

  // Container Glow & Background
  ctx.fillStyle = 'rgba(3, 239, 98, 0.08)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - titleBoxW / 2, 805, titleBoxW, 96, 26);
  ctx.fill();
  ctx.strokeStyle = '#03EF62';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(3, 239, 98, 0.45)';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Title Text
  ctx.fillStyle = '#03EF62';
  ctx.shadowColor = 'rgba(3, 239, 98, 0.5)';
  ctx.shadowBlur = 14;
  ctx.fillText(courseTitle, W / 2, 870);
  ctx.shadowBlur = 0;

  // Academic Partnership Subtitle
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#C084FC';
  ctx.fillText('Under the Academic Accreditation & Partnership of Innovation University', W / 2, 945);

  // 12. Bottom Security & Signatures Section
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, 1240);
  ctx.lineTo(W - 140, 1240);
  ctx.stroke();

  // Column 1: Left Signature (Club President Ammar Ahmed)
  ctx.textAlign = 'center';
  ctx.font = 'italic 58px "Alex Brush", "Playfair Display", cursive, serif';
  ctx.fillStyle = '#F8FAFC';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
  ctx.shadowBlur = 8;
  ctx.fillText('Ammar Ahmed', 420, 1335);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(260, 1365);
  ctx.lineTo(580, 1365);
  ctx.stroke();

  ctx.font = 'bold 20px "Cinzel", "Space Grotesk", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('AMMAR AHMED', 420, 1402);
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#03EF62';
  ctx.fillText('CLUB PRESIDENT • DATACAMP CHAPTER', 420, 1428);

  // Column 2: Center-Left Golden Foil Notary Seal
  drawGoldenSeal(ctx, 880, 1375, 80);

  // Column 3: Center-Right QR Verification Box
  const qrX = 1370;
  const qrY = 1285;
  const qrSize = 165;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 18);
  ctx.fill();
  ctx.strokeStyle = '#03EF62';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(3, 239, 98, 0.35)';
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (qrCanvasElement) {
    try {
      ctx.drawImage(qrCanvasElement, qrX, qrY, qrSize, qrSize);
    } catch {
      ctx.fillStyle = '#0B132B';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
    }
  }

  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#03EF62';
  ctx.fillText(`ID: ${cert.verificationCode}`, qrX + qrSize / 2, 1495);
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('SCAN TO VERIFY', qrX + qrSize / 2, 1515);

  // Column 4: Right Signature (Innovation University Academic Council)
  const issueDateStr = cert.issuedAt && typeof (cert.issuedAt as any).toDate === 'function'
    ? (cert.issuedAt as any).toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(String(cert.issuedAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  ctx.textAlign = 'center';
  ctx.font = 'italic 58px "Alex Brush", "Playfair Display", cursive, serif';
  ctx.fillStyle = '#E9D5FF';
  ctx.shadowColor = 'rgba(192, 132, 252, 0.4)';
  ctx.shadowBlur = 8;
  ctx.fillText('Academic Council', 1980, 1335);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(1820, 1365);
  ctx.lineTo(2140, 1365);
  ctx.stroke();

  ctx.font = 'bold 20px "Cinzel", "Space Grotesk", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('ACADEMIC COUNCIL', 1980, 1402);
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#C084FC';
  ctx.fillText(`INNOVATION UNIVERSITY • ${issueDateStr}`, 1980, 1428);

  // 13. Bottom Registry Hash Bar
  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
  ctx.fillText(
    `OFFICIALLY RECOGNIZED CREDENTIAL • SHA-256 REGISTRY: ${cert.verificationCode}-EIU2026 • DIGITAL VERIFICATION: ${window.location.origin.toUpperCase()}/VERIFY-CERTIFICATE`,
    W / 2,
    1620
  );

  return canvas;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ certificate, onClose }) => {
  const { isArabic } = useLanguage();
  const certRef = useRef<HTMLDivElement>(null);
  const hiddenQrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);

  const verificationUrl = `${window.location.origin}/verify-certificate/${certificate.verificationCode}`;

  const issueDateObj = certificate.issuedAt && typeof (certificate.issuedAt as any).toDate === 'function'
    ? (certificate.issuedAt as any).toDate()
    : new Date(String(certificate.issuedAt));

  const formattedDate = issueDateObj.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 1. Instant Full-Resolution Preview in a New Browser Tab (Easy Opening)
  const handlePreviewFullSize = async () => {
    if (downloading) return;
    setDownloading(true);
    const toastId = toast.loading(isArabic ? 'جاري فتح المعاينة المباشرة للشهادة...' : 'Opening instant full-resolution preview...');

    try {
      const qrCanvas = hiddenQrCanvasRef.current;
      const canvas = await generateCertificateCanvas(certificate, qrCanvas);

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.dismiss(toastId);
          toast.error(isArabic ? 'فشل إنشاء المعاينة' : 'Failed to generate preview');
          setDownloading(false);
          return;
        }

        const previewUrl = URL.createObjectURL(blob);
        const win = window.open(previewUrl, '_blank');
        if (!win) {
          const a = document.createElement('a');
          a.href = previewUrl;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        toast.dismiss(toastId);
        toast.success(isArabic ? 'تم فتح الشهادة بدقة عالية في تبويب جديد!' : 'Certificate opened in high-resolution new tab!');
        setDownloading(false);

        // Keep preview blob active for 2 minutes
        setTimeout(() => {
          URL.revokeObjectURL(previewUrl);
        }, 120000);
      }, 'image/png');
    } catch (err) {
      console.error('Preview failed:', err);
      toast.dismiss(toastId);
      toast.error(isArabic ? 'فشل فتح المعاينة' : 'Failed to open preview');
      setDownloading(false);
    }
  };

  // 2. Instant Export as Official Vector-Crisp PDF via Standard Browser Download
  const handleDownloadPDF = async () => {
    if (downloading) return;
    setDownloading(true);
    const toastId = toast.loading(isArabic ? 'جاري تجهيز وتنزيل ملف PDF...' : 'Generating official PDF credential...');

    try {
      const qrCanvas = hiddenQrCanvasRef.current;
      const canvas = await generateCertificateCanvas(certificate, qrCanvas);

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4', // 297mm x 210mm
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');

      // Standard Browser Download (Triggered in Downloads folder & bar)
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const fileName = `DataCamp-Certificate-${certificate.verificationCode}.pdf`;

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss(toastId);
      toast.success(isArabic ? 'تم تنزيل ملف PDF بنجاح في مجلد التنزيلات!' : 'PDF certificate downloaded to your Downloads folder!', {
        duration: 8000,
        action: {
          label: isArabic ? 'فتح الملف' : 'Open PDF',
          onClick: () => {
            window.open(blobUrl, '_blank');
          },
        },
      });

      // Keep blob URL alive for 2 minutes so "Open PDF" works
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 120000);
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.dismiss(toastId);
      toast.error(isArabic ? 'فشل تصدير الشهادة كـ PDF' : 'Failed to export PDF certificate');
    } finally {
      setDownloading(false);
    }
  };

  // 3. Instant Export as High-Res PNG via Standard Browser Download
  const handleDownloadPNG = async () => {
    if (downloading) return;
    setDownloading(true);
    const toastId = toast.loading(isArabic ? 'جاري تجهيز وتنزيل صورة الشهادة...' : 'Generating high-resolution PNG credential...');

    try {
      const qrCanvas = hiddenQrCanvasRef.current;
      const canvas = await generateCertificateCanvas(certificate, qrCanvas);

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.dismiss(toastId);
          toast.error(isArabic ? 'فشل استخراج ملف الصورة' : 'Failed to extract image blob');
          setDownloading(false);
          return;
        }

        // Standard Browser Download (Triggered in Downloads folder & bar)
        const blobUrl = URL.createObjectURL(blob);
        const fileName = `DataCamp-Certificate-${certificate.verificationCode}.png`;
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.dismiss(toastId);
        toast.success(isArabic ? 'تم تنزيل صورة الشهادة (PNG) في مجلد التنزيلات!' : 'Certificate PNG downloaded to your Downloads folder!', {
          duration: 8000,
          action: {
            label: isArabic ? 'فتح الصورة' : 'Open Image',
            onClick: () => {
              window.open(blobUrl, '_blank');
            },
          },
        });

        // Keep blob URL alive for 2 minutes so "Open Image" works
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 120000);
        setDownloading(false);
      }, 'image/png');
    } catch (err) {
      console.error('PNG export failed:', err);
      toast.dismiss(toastId);
      toast.error(isArabic ? 'فشل تصدير الشهادة كصورة' : 'Failed to export certificate image');
      setDownloading(false);
    }
  };

  // 4. Native Print Document with Specialized Royal CSS
  const handlePrint = () => {
    window.print();
  };

  const handleShareLinkedIn = () => {
    const certTitle = encodeURIComponent(certificate.courseTitle || certificate.eventTitle || 'DataCamp Technical Program');
    const orgName = encodeURIComponent('DataCamp Student Club & Innovation University');
    const issueDate = issueDateObj;
    const certUrl = encodeURIComponent(verificationUrl);

    const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certTitle}&organizationName=${orgName}&issueYear=${issueDate.getFullYear()}&issueMonth=${issueDate.getMonth() + 1}&certUrl=${certUrl}&certId=${certificate.verificationCode}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast.success(isArabic ? 'تم نسخ رابط التحقق إلى الحافظة' : 'Verification URL copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Hidden QR Canvas used for crisp embedding into Canvas Export */}
      <div className="hidden" aria-hidden="true">
        <QRCodeCanvas
          ref={hiddenQrCanvasRef}
          value={verificationUrl}
          size={300}
          level="H"
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>

      {/* Embedded Print CSS for Museum-Grade A4 Landscape Printout */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #030712 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside, header, nav, footer, .print\\:hidden, [class*="LanguageSwitcher"], [class*="AIMentor"] {
            display: none !important;
          }
          #printable-certificate {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 28px 42px !important;
            box-sizing: border-box !important;
            border: 3px solid #03EF62 !important;
            background: #040814 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Controls Bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-dark-navy/80 p-4 rounded-xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            {isArabic ? 'الاعتماد الموثق: ' : 'Verified Credential: '}
            <strong className="text-white font-mono">{certificate.verificationCode}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="text-xs font-cyber border-white/20 hover:border-primary text-foreground"
          >
            <Share2 className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'مشاركة الرابط' : 'SHARE LINK'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareLinkedIn}
            className="text-xs font-cyber border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
            LINKEDIN
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="text-xs font-cyber border-white/20 hover:border-primary text-foreground"
          >
            <Printer className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'طباعة رسمية' : 'PRINT DOCUMENT'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePreviewFullSize}
            disabled={downloading}
            className="text-xs font-cyber border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'معاينة وفتح' : 'PREVIEW & OPEN'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="text-xs font-cyber border-primary/40 text-primary hover:bg-primary/10"
          >
            <Download className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'تنزيل صورة PNG' : 'PNG IMAGE'}
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="text-xs font-cyber bg-primary hover:bg-primary/90 text-dark-navy font-bold shadow-[0_0_20px_rgba(3,239,98,0.35)]"
          >
            <FileText className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
            {downloading ? (isArabic ? 'جاري التحميل...' : 'EXPORTING...') : (isArabic ? 'تنزيل PDF' : 'DOWNLOAD PDF')}
          </Button>
        </div>
      </div>

      {/* On-Screen & Printable Certificate Frame */}
      <div
        id="printable-certificate"
        ref={certRef}
        className="relative mx-auto w-full max-w-4xl p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-[#030712] via-[#071124] to-[#030712] border-2 border-primary/50 shadow-[0_0_50px_rgba(3,239,98,0.18)] overflow-hidden text-center"
      >
        {/* Subtle Decorative Golden Outer Frame */}
        <div className="absolute inset-2 border border-amber-500/30 rounded-xl pointer-events-none" />
        <div className="absolute inset-3 border border-primary/20 rounded-lg pointer-events-none" />

        {/* Ornate Corner Rosettes */}
        <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary pointer-events-none flex items-start justify-start p-1 text-[10px] text-amber-400">✦</div>
        <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary pointer-events-none flex items-start justify-end p-1 text-[10px] text-amber-400">✦</div>
        <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary pointer-events-none flex items-end justify-start p-1 text-[10px] text-amber-400">✦</div>
        <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary pointer-events-none flex items-end justify-end p-1 text-[10px] text-amber-400">✦</div>

        {/* Dual-Branded Header: DataCamp × Innovation University */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          {/* 1. Left Emblem: Real Official DataCamp Logo */}
          <div className="flex items-center gap-3 text-left">
            <div className="h-14 w-14 rounded-2xl bg-white border border-[#03EF62]/60 flex items-center justify-center shadow-[0_0_20px_rgba(3,239,98,0.3)] shrink-0 p-1.5 overflow-hidden">
              <img src="/logos/datacamp-mark.png" alt="DataCamp" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-serif-luxury font-black text-base text-white tracking-wider">
                DATACAMP <span className="text-[#03EF62] neon-text">STUDENT CLUB</span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                OFFICIAL UNIVERSITY CHAPTER
              </div>
            </div>
          </div>

          {/* 2. Center: Certificate Type Title */}
          <div className="text-center hidden sm:block">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-serif-luxury tracking-widest uppercase">
              <Award className="w-4 h-4 text-neon-green" /> OFFICIAL CREDENTIAL
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              JOINT ACADEMIC ACCREDITATION
            </div>
          </div>

          {/* 3. Right Emblem: Real Official Innovation University Logo */}
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="font-serif-luxury font-black text-base uppercase text-purple-200 tracking-wider">
                INNOVATION UNIVERSITY
              </div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                ACADEMIC ACCREDITATION PARTNER
              </div>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-[#45287c] border border-purple-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)] shrink-0 p-1.5 overflow-hidden">
              <img src="/logos/innovation-university-mark.png" alt="Innovation University" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="space-y-1 relative z-10">
          <p className="text-[12px] font-serif-luxury tracking-[0.3em] text-amber-400 uppercase font-bold">
            — DIPLOMA OF EXCELLENCE —
          </p>
          <h2 className="text-3xl sm:text-5xl font-serif-luxury font-black tracking-wide text-white uppercase">
            CERTIFICATE OF <span className="text-primary neon-text">ACHIEVEMENT</span>
          </h2>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-mono">
            VERIFIED ACADEMIC & TECHNICAL ACCREDITATION
          </p>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center justify-center gap-4">
          <div className="h-px w-28 bg-gradient-to-r from-transparent to-amber-500/60" />
          <span className="text-amber-400 text-sm">◆ ✦ ◆</span>
          <div className="h-px w-28 bg-gradient-to-l from-transparent to-amber-500/60" />
        </div>

        {/* Recipient Details */}
        <div className="space-y-4 relative z-10 my-4">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            THIS CREDENTIAL IS PROUDLY CONFERRED UPON
          </p>

          <div className="flex items-center justify-center gap-4 my-3">
            <span className="text-amber-400 text-3xl hidden sm:inline">✦</span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-serif-luxury text-white tracking-wide uppercase drop-shadow-[0_4px_25px_rgba(3,239,98,0.35)]">
              {certificate.userFullName}
            </h1>
            <span className="text-amber-400 text-3xl hidden sm:inline">✦</span>
          </div>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
            for successfully completing the curriculum, rigorous coding assessments, and practical challenges in
          </p>

          <div className="inline-block px-8 py-3 rounded-2xl bg-white/5 border border-primary/40 backdrop-blur-md shadow-[0_0_20px_rgba(3,239,98,0.15)]">
            <span className="text-lg sm:text-2xl font-bold font-serif-luxury text-primary neon-text tracking-wide">
              {certificate.courseTitle || certificate.eventTitle || 'Advanced DataCamp Technical Program'}
            </span>
          </div>

          <p className="text-[11px] font-mono text-purple-300/80">
            Under the Academic Partnership with Innovation University
          </p>
        </div>

        {/* Signatures & Seal Section */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 items-center gap-4 relative z-10">
          {/* 1. Signature 1: Club President */}
          <div className="text-center space-y-1">
            <div className="font-script text-3xl sm:text-4xl text-slate-100 font-bold border-b border-white/20 pb-1 max-w-[150px] mx-auto tracking-wide">
              Ammar Ahmed
            </div>
            <div className="text-[11px] font-serif-luxury text-white uppercase font-bold">AMMAR AHMED</div>
            <div className="text-[9px] font-mono text-primary font-semibold">CLUB PRESIDENT • DATACAMP</div>
          </div>

          {/* 2. Official Golden Foil Seal */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center border-2 border-amber-300/70">
              <div className="w-full h-full rounded-full border border-amber-900/60 flex flex-col items-center justify-center text-amber-950 p-1 text-center">
                <span className="text-[6px] font-mono font-bold tracking-tighter uppercase leading-none">OFFICIAL SEAL</span>
                <span className="text-base leading-none my-0.5">★</span>
                <span className="text-[6px] font-mono font-bold tracking-tighter uppercase leading-none">EXCELLENCE</span>
              </div>
            </div>
            <span className="text-[8px] font-mono text-amber-400 mt-1 uppercase tracking-widest font-bold">NOTARY SEAL</span>
          </div>

          {/* 3. QR Verification Seal */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="p-1.5 rounded-xl bg-white border border-primary/40 shadow-[0_0_15px_rgba(0,255,204,0.25)]">
              <QRCodeSVG
                value={verificationUrl}
                size={65}
                level="M"
              />
            </div>
            <span className="text-[10px] font-mono text-primary font-bold">
              ID: {certificate.verificationCode}
            </span>
          </div>

          {/* 4. Signature 2: University Academic Board */}
          <div className="text-center space-y-1">
            <div className="font-script text-3xl sm:text-4xl text-purple-300 font-bold border-b border-white/20 pb-1 max-w-[150px] mx-auto tracking-wide">
              Academic Council
            </div>
            <div className="text-[11px] font-serif-luxury text-purple-200 uppercase font-bold">ACADEMIC COUNCIL</div>
            <div className="text-[9px] font-mono text-muted-foreground">{formattedDate}</div>
          </div>
        </div>

        {/* Bottom Hash */}
        <div className="mt-6 text-[9px] font-mono text-muted-foreground/60 tracking-wider">
          OFFICIALLY RECOGNIZED CREDENTIAL • SHA-256 REGISTRY HASH: {certificate.verificationCode}-EIU2026
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
