import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { certificateService } from '../services/certificateService';
import { Certificate } from '../types';
import { CertificateView } from '../components/CertificateView';
import { Button } from '../components/ui/Button';
import {
  Award,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export const Certificates = () => {
  const { code } = useParams<{ code?: string }>();
  const { profile } = useAuth();
  const { isArabic, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'my_certs' | 'verify'>(code ? 'verify' : 'my_certs');
  const [userCerts, setUserCerts] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  // Verification state
  const [searchCode, setSearchCode] = useState(code || '');
  const [verifiedCert, setVerifiedCert] = useState<Certificate | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const certs = await certificateService.getUserCertificates(profile?.uid || 'demo-user');
        setUserCerts(certs);
        if (certs.length > 0 && !code) {
          setSelectedCert(certs[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile, code]);

  useEffect(() => {
    if (code) {
      handleVerify(code);
    }
  }, [code]);

  const handleVerify = async (codeToVerify?: string) => {
    const target = (codeToVerify || searchCode).trim();
    if (!target) {
      toast.error(isArabic ? 'يرجى إدخال رمز التحقق' : 'Please enter a verification code');
      return;
    }

    setVerifying(true);
    setHasSearched(true);
    try {
      const result = await certificateService.verifyCertificate(target);
      setVerifiedCert(result);
      if (result) {
        toast.success(isArabic ? 'تم التحقق من صحة الشهادة بنجاح!' : 'Certificate verified successfully!');
      } else {
        toast.error(isArabic ? 'الشهادة غير موجودة أو الرمز غير صحيح' : 'Certificate not found or invalid');
      }
    } catch {
      toast.error(isArabic ? 'حدث خطأ أثناء التحقق من الشهادة' : 'Error during certificate verification');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-foreground pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cyber uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {isArabic ? 'الاعتمادات الرسمية الموثقة' : 'OFFICIAL ACCREDITATION'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-cyber font-black tracking-tight text-white flex items-center gap-3">
              {isArabic ? (
                <>الشهادات <span className="text-primary neon-text">الرقمية المعتمدة</span></>
              ) : (
                <>DIGITAL <span className="text-primary neon-text">CERTIFICATES</span></>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic 
                ? 'تحقق من صحة الشهادات إلكترونياً، حمّل نسختك بدقة فائقة PDF، وانشر إنجازاتك مباشرة على LinkedIn.'
                : 'Verify credentials, download high-resolution certificates, and export your achievements to LinkedIn.'}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-dark-navy/80 p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('my_certs')}
              className={`px-4 py-2 rounded-lg text-xs font-cyber tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'my_certs'
                  ? 'bg-primary text-dark-navy font-bold shadow-[0_0_15px_rgba(0,255,204,0.3)]'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> {isArabic ? `شهاداتي المعتمدة (${userCerts.length})` : `MY CREDENTIALS (${userCerts.length})`}
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-4 py-2 rounded-lg text-xs font-cyber tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'verify'
                  ? 'bg-primary text-dark-navy font-bold shadow-[0_0_15px_rgba(0,255,204,0.3)]'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" /> {isArabic ? 'التحقق من كود الشهادة' : 'VERIFY CODE'}
            </button>
          </div>
        </div>

        {/* Tab 1: My Credentials */}
        {activeTab === 'my_certs' && (
          <div className="space-y-8">
            {/* Certificate selector cards */}
            {userCerts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCerts.map((cert) => {
                  const isSelected = selectedCert?.id === cert.id;
                  return (
                    <div
                      key={cert.id}
                      onClick={() => setSelectedCert(cert)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,255,204,0.2)]'
                          : 'border-white/10 bg-dark-navy/60 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-cyber uppercase px-2 py-0.5 rounded bg-primary/20 text-primary">
                          {cert.type}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {cert.verificationCode}
                        </span>
                      </div>
                      <h4 className="font-cyber font-bold text-white text-sm line-clamp-1 mb-1">
                        {cert.courseTitle || cert.eventTitle}
                      </h4>
                      <p className="text-xs font-mono text-muted-foreground">
                        {isArabic ? 'تاريخ الإصدار: ' : 'Issued: '}{
                          cert.issuedAt && typeof (cert.issuedAt as any).toDate === 'function'
                            ? (cert.issuedAt as any).toDate().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')
                            : new Date(String(cert.issuedAt)).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-white/10 bg-dark-navy/60 space-y-4">
                <Award className="w-12 h-12 text-primary/40 mx-auto" />
                <h3 className="text-lg font-cyber text-white">
                  {isArabic ? 'لم تصدر لك أي شهادات حتى الآن' : 'NO CERTIFICATES ISSUED YET'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {isArabic 
                    ? 'أكمل أي مسار تدريبي بنسبة 100% أو شارك في هاكاثونات النادي للحصول على شهادتك المعتمدة تلقائياً!'
                    : 'Complete any course 100% or attend club hackathons to automatically unlock your official verified certificate!'}
                </p>
                <Link to="/courses">
                  <Button variant="cyber" className="text-xs font-cyber">
                    {isArabic ? 'تصفح المسارات والدورات' : 'BROWSE COURSES'} <ArrowRight className="w-3.5 h-3.5 ml-1 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Selected Certificate Preview */}
            {selectedCert && (
              <div className="pt-4">
                <CertificateView certificate={selectedCert} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Public Verification Engine */}
        {activeTab === 'verify' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="p-6 rounded-2xl border border-primary/30 bg-dark-navy/80 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-lg font-cyber font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> {isArabic ? 'التحقق من كود الاعتماد الإلكتروني' : 'VERIFY A CREDENTIAL CODE'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isArabic 
                  ? 'أدخل رمز التحقق الفريد المطبوع على شهادة نادي DataCamp بجامعة الابتكار (مثال: DC-PY99-X2K4).'
                  : 'Enter the unique verification code printed on any DataCamp Student Club certificate (e.g. DC-PY99-X2K4).'}
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DC-PY99-X2K4"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-sm text-white focus:outline-none focus:border-primary uppercase"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
                <Button
                  onClick={() => handleVerify()}
                  disabled={verifying}
                  className="bg-primary hover:bg-primary/90 text-dark-navy font-cyber font-bold px-6"
                >
                  {verifying ? (isArabic ? 'جاري الفحص...' : 'CHECKING...') : (isArabic ? 'تحقق الآن' : 'VERIFY')}
                </Button>
              </div>
            </div>

            {/* Verification Result */}
            {hasSearched && (
              <div>
                {verifiedCert ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <div className="font-cyber font-bold text-sm">
                          {isArabic ? 'شهادة رسمية موثقة ومعتمدة' : 'AUTHENTIC CREDENTIAL VERIFIED'}
                        </div>
                        <div className="text-xs font-mono text-emerald-300/80">
                          {isArabic 
                            ? 'هذه الشهادة رسمية ومسجلة في السجل الأكاديمي لنادي DataCamp بجامعة الابتكار.'
                            : 'This certificate is authentic and recorded in the DataCamp Student Club registry.'}
                        </div>
                      </div>
                    </div>
                    <CertificateView certificate={verifiedCert} />
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-center justify-center">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <div className="font-cyber font-bold text-sm">
                        {isArabic ? 'لم يتم العثور على الشهادة' : 'CREDENTIAL NOT FOUND'}
                      </div>
                      <div className="text-xs font-mono text-red-300/80">
                        {isArabic 
                          ? `لم يتم العثور على أي شهادة مسجلة بالكود "${searchCode}" في قاعدة البيانات الرسمية.`
                          : `No certificate matching code "${searchCode}" was found in our verification registry.`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
