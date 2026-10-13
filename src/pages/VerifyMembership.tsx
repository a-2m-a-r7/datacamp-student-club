import React,{useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import {supabase} from '../lib/supabase';
import {useLanguage} from '../contexts/LanguageContext';
export default function VerifyMembership(){
 const {token}=useParams();const {isArabic}=useLanguage();const [result,setResult]=useState<any>();const [error,setError]=useState('');
 useEffect(()=>{let active=true;setError('');setResult(undefined);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token||'')){setResult({valid:false});return;}
 supabase.rpc('verify_member_card',{p_token:token}).then(({data,error})=>{if(!active)return;if(error)setError(isArabic?'تعذر التحقق. حاول مرة أخرى.':'Verification unavailable. Please retry.');else setResult(data||{valid:false});});return()=>{active=false};},[token,isArabic]);
 return <div className="max-w-lg mx-auto p-8 py-24 space-y-6"><h1 className="text-2xl font-bold">{isArabic?'التحقق من بطاقة العضوية':'Membership card verification'}</h1>
 {error?<p role="alert">{error}</p>:!result?<p>{isArabic?'جارٍ التحقق…':'Verifying…'}</p>:result.valid?<><p className="text-primary">{isArabic?'بطاقة عضوية سارية':'Valid membership card'}</p><p dir="ltr">{result.member_id}</p></>:<p>{isArabic?'بطاقة غير صالحة أو عضوية غير نشطة':'Invalid card or inactive membership'}</p>}</div>;
}
