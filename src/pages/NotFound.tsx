import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const { isArabic } = useLanguage();
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-9xl font-black font-cyber text-primary mb-4 opacity-20">404</h1>
      <h2 className="text-3xl font-bold mb-6 font-cyber">
        {isArabic ? 'انقطع الاتصال • الصفحة غير موجودة' : 'SIGNAL_LOST_IN_VOID'}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        {isArabic 
          ? 'الإحداثيات المطلوبة لا تتطابق مع أي صفحة معروفة في شبكة نادي DataCamp.' 
          : 'The requested coordinates do not correspond to any known terminal in the network.'}
      </p>
      <Button variant="cyber" onClick={() => window.location.href = '/'}>
        {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'RETURN_TO_HOME_BASE'}
      </Button>
    </div>
  );
};

export default NotFound;
