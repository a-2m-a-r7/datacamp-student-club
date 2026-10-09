import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../contexts/PointsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { demoUsers } from '../lib/demoData';
import { db, isFirebaseReady } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { UserProfile, LEVEL_THRESHOLDS, getLevelFromPoints } from '../types';
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Award,
  Sparkles,
  Search,
  Filter,
  GraduationCap,
  ShieldAlert
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { motion } from 'motion/react';

interface LeaderboardUser {
  uid: string;
  fullName: string;
  email: string;
  role: string;
  faculty?: string;
  totalPoints: number;
  level: string;
  memberId: string;
}

const Leaderboard = () => {
  const { user, profile } = useAuth();
  const { totalPoints: myTotalPoints, level: myLevel } = usePoints();
  const { isArabic, t } = useLanguage();

  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        let list: LeaderboardUser[] = [];

        if (isFirebaseReady) {
          try {
            const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(50));
            const snap = await getDocs(q);
            if (!snap.empty) {
              list = snap.docs.map(d => {
                const data = d.data();
                const pts = Number(data.totalPoints) || 0;
                return {
                  uid: d.id,
                  fullName: data.fullName || 'Operative',
                  email: data.email || '',
                  role: data.role || 'member',
                  faculty: data.faculty || 'Engineering',
                  totalPoints: pts,
                  level: getLevelFromPoints(pts),
                  memberId: data.memberId || 'DC-000',
                };
              });
            }
          } catch (fbErr) {
            console.warn('Firestore /users query restricted, using fallback demo leaders:', fbErr);
          }
        }

        // If firebase is empty or demo mode, generate rich leaderboard from demoUsers + current user
        if (list.length === 0) {
          list = demoUsers.map((u: any, idx: number) => {
            const pts = (5 - idx) * 450 + 150;
            return {
              uid: u.uid || `demo-${idx}`,
              fullName: u.fullName,
              email: u.email,
              role: u.role,
              faculty: u.faculty || (idx % 2 === 0 ? 'Computer Science' : 'Engineering'),
              totalPoints: pts,
              level: getLevelFromPoints(pts),
              memberId: u.memberId,
            };
          });

          // Add extra simulated students to create an impressive leaderboard
          list.push(
            { uid: 's1', fullName: 'Nour El-Din Hassan', email: 'nour@club.edu', role: 'member', faculty: 'Computer Science', totalPoints: 2850, level: 'ENGINEER', memberId: 'DC-019' },
            { uid: 's2', fullName: 'Mariam Khaled', email: 'mariam@club.edu', role: 'member', faculty: 'Artificial Intelligence', totalPoints: 1980, level: 'ANALYST', memberId: 'DC-024' },
            { uid: 's3', fullName: 'Ziad Al-Ghamdi', email: 'ziad@club.edu', role: 'member', faculty: 'Engineering', totalPoints: 1420, level: 'ANALYST', memberId: 'DC-031' },
            { uid: 's4', fullName: 'Salma Tarek', email: 'salma@club.edu', role: 'member', faculty: 'Business Informatics', totalPoints: 920, level: 'SPECIALIST', memberId: 'DC-042' },
            { uid: 's5', fullName: 'Omar Farouk', email: 'omar@club.edu', role: 'member', faculty: 'Science', totalPoints: 780, level: 'SPECIALIST', memberId: 'DC-055' }
          );
        }

        // Merge current user's real live points if logged in
        if (user && profile) {
          const userIdx = list.findIndex(u => u.uid === user.uid || u.email === user.email);
          const currentUserObj: LeaderboardUser = {
            uid: user.uid,
            fullName: profile.fullName || 'You',
            email: user.email || '',
            role: profile.role || 'member',
            faculty: profile.faculty || 'Engineering',
            totalPoints: myTotalPoints,
            level: myLevel,
            memberId: profile.memberId || 'DC-YOU',
          };

          if (userIdx !== -1) {
            list[userIdx] = currentUserObj;
          } else {
            list.push(currentUserObj);
          }
        }

        // Sort descending by XP
        list.sort((a, b) => b.totalPoints - a.totalPoints);
        setLeaders(list);
      } catch (err) {
        console.error('Leaderboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [user, profile, myTotalPoints, myLevel]);

  const faculties = ['all', 'Computer Science', 'Engineering', 'Artificial Intelligence', 'Business Informatics', 'Science'];

  const filteredLeaders = leaders.filter(l => {
    const matchFaculty = selectedFaculty === 'all' || l.faculty === selectedFaculty;
    const matchSearch =
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.memberId.toLowerCase().includes(search.toLowerCase());
    return matchFaculty && matchSearch;
  });

  const topThree = filteredLeaders.slice(0, 3);
  const remaining = filteredLeaders.slice(3);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="relative rounded-2xl border border-primary/20 bg-dark-navy/60 backdrop-blur-xl p-8 sm:p-12 overflow-hidden shadow-[0_0_50px_rgba(0,255,204,0.06)] text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-cyber tracking-wider mb-4">
          <Trophy className="w-4 h-4" />
          <span>{isArabic ? 'لوحة شرف نادي داتا كامب' : 'DATACAMP CLUB HALL OF FAME'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-cyber text-foreground tracking-tight max-w-2xl mx-auto">
          {isArabic ? 'لوحة المتصدرين العامة للنادي' : 'GLOBAL CLUB LEADERBOARD'}
        </h1>

        <p className="text-muted-foreground font-mono text-xs sm:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
          {isArabic 
            ? 'يتم احتساب الترتيب تلقائياً بناءً على إتمام الدورات، وحضور الفعاليات، والمشاركة في الورش، ودقة حل الاختبارات البرمجية.'
            : 'Rankings are calculated dynamically based on course completion, event attendance, workshop presentations, and quiz accuracy.'}
        </p>

        {user && (
          <div className="inline-flex items-center gap-4 mt-6 p-2 px-4 rounded-xl bg-primary/10 border border-primary/30 text-xs font-mono">
            <span>{isArabic ? 'نقاطك الحالية:' : 'Your Current Rank XP:'} <strong className="text-primary font-bold">{myTotalPoints} XP</strong></span>
            <span className="text-muted-foreground">•</span>
            <span>{isArabic ? 'المستوى الحالي:' : 'Rank Tier:'} <strong className="text-foreground">{myLevel}</strong></span>
          </div>
        )}
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length >= 3 && !search && selectedFaculty === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-4xl mx-auto items-end">
          {/* #2 Silver */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-slate-400/30 bg-dark-navy/60 backdrop-blur-xl p-6 text-center space-y-4 relative overflow-hidden order-2 md:order-1"
          >
            <div className="w-16 h-16 rounded-full bg-slate-400/10 border-2 border-slate-400 flex items-center justify-center mx-auto text-slate-300 font-cyber font-bold text-xl shadow-[0_0_20px_rgba(148,163,184,0.3)]">
              2
            </div>
            <div>
              <span className="text-[10px] font-cyber text-slate-400 uppercase tracking-widest">{isArabic ? 'المركز الثاني' : 'RUNNER UP'}</span>
              <h3 className="font-cyber font-bold text-foreground text-lg">{topThree[1].fullName}</h3>
              <p className="text-xs font-mono text-muted-foreground">{topThree[1].faculty}</p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <span className="text-lg font-cyber font-bold text-slate-300">{topThree[1].totalPoints} XP</span>
              <p className="text-[10px] font-mono text-muted-foreground">{topThree[1].level}</p>
            </div>
          </motion.div>

          {/* #1 Gold */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border-2 border-amber-400/60 bg-dark-navy/80 backdrop-blur-xl p-8 text-center space-y-4 relative overflow-hidden shadow-[0_0_40px_rgba(251,191,36,0.25)] order-1 md:order-2 md:-mt-6"
          >
            <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2">
              <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
            </div>
            <div className="w-20 h-20 rounded-full bg-amber-400/10 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 font-cyber font-bold text-2xl shadow-[0_0_30px_rgba(251,191,36,0.4)]">
              1
            </div>
            <div>
              <span className="text-[10px] font-cyber text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5" /> {isArabic ? 'بطل النادي' : 'CLUB CHAMPION'}
              </span>
              <h3 className="font-cyber font-black text-foreground text-xl mt-1">{topThree[0].fullName}</h3>
              <p className="text-xs font-mono text-muted-foreground">{topThree[0].faculty}</p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <span className="text-2xl font-cyber font-black text-amber-400">{topThree[0].totalPoints} XP</span>
              <p className="text-[11px] font-mono text-primary font-bold">{topThree[0].level}</p>
            </div>
          </motion.div>

          {/* #3 Bronze */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl border border-amber-700/30 bg-dark-navy/60 backdrop-blur-xl p-6 text-center space-y-4 relative overflow-hidden order-3"
          >
            <div className="w-16 h-16 rounded-full bg-amber-700/10 border-2 border-amber-600 flex items-center justify-center mx-auto text-amber-600 font-cyber font-bold text-xl shadow-[0_0_20px_rgba(217,119,6,0.2)]">
              3
            </div>
            <div>
              <span className="text-[10px] font-cyber text-amber-600 uppercase tracking-widest">{isArabic ? 'المركز الثالث' : '3RD PLACE'}</span>
              <h3 className="font-cyber font-bold text-foreground text-lg">{topThree[2].fullName}</h3>
              <p className="text-xs font-mono text-muted-foreground">{topThree[2].faculty}</p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <span className="text-lg font-cyber font-bold text-amber-500">{topThree[2].totalPoints} XP</span>
              <p className="text-[10px] font-mono text-muted-foreground">{topThree[2].level}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isArabic ? 'ابحث باسم العضو أو رقم العضوية...' : 'Search member name or Member ID...'}
            className="pl-10 rtl:pl-4 rtl:pr-10 font-mono text-xs bg-dark-navy/60 border-primary/20 h-11"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 custom-scrollbar">
          {faculties.map(fac => (
            <button
              key={fac}
              onClick={() => setSelectedFaculty(fac)}
              className={`px-3 py-1.5 text-xs font-cyber tracking-wider uppercase rounded-md border whitespace-nowrap transition-all ${
                selectedFaculty === fac
                  ? 'bg-primary text-black border-primary font-bold'
                  : 'bg-white/5 text-muted-foreground border-white/10 hover:text-foreground'
              }`}
            >
              {fac === 'all' 
                ? (isArabic ? 'جميع الكليات' : 'ALL FACULTIES') 
                : (isArabic 
                    ? (fac === 'Computer Science' ? 'حاسبات ومعلومات' : fac === 'Engineering' ? 'الهندسة' : fac === 'Artificial Intelligence' ? 'الذكاء الاصطناعي' : fac === 'Business Informatics' ? 'معلوماتية الأعمال' : fac === 'Science' ? 'العلوم' : fac) 
                    : fac)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-primary/20 bg-dark-navy/60 backdrop-blur-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-cyber tracking-widest text-muted-foreground uppercase">
                <th className="py-4 px-6">{isArabic ? 'الترتيب' : 'RANK'}</th>
                <th className="py-4 px-6">{isArabic ? 'العضو' : 'MEMBER'}</th>
                <th className="py-4 px-6 hidden sm:table-cell">{isArabic ? 'الكلية' : 'FACULTY'}</th>
                <th className="py-4 px-6">{isArabic ? 'المستوى' : 'TIER LEVEL'}</th>
                <th className="py-4 px-6 text-right rtl:text-left">{isArabic ? 'إجمالي النقاط' : 'TOTAL XP'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {filteredLeaders.map((lead, idx) => {
                const isMe = user && (lead.uid === user.uid || lead.email === user.email);
                const rankNumber = idx + 1;

                return (
                  <tr
                    key={lead.uid}
                    className={`transition-colors ${
                      isMe
                        ? 'bg-primary/10 border-l-4 rtl:border-l-0 rtl:border-r-4 border-primary hover:bg-primary/15'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-4 px-6 font-cyber font-bold text-sm">
                      {rankNumber === 1 ? (
                        <span className="text-amber-400 flex items-center gap-1">🥇 #1</span>
                      ) : rankNumber === 2 ? (
                        <span className="text-slate-300 flex items-center gap-1">🥈 #2</span>
                      ) : rankNumber === 3 ? (
                        <span className="text-amber-600 flex items-center gap-1">🥉 #3</span>
                      ) : (
                        <span className="text-muted-foreground">#{rankNumber}</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-cyber text-primary text-xs shrink-0">
                          {lead.fullName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span>{lead.fullName}</span>
                            {isMe && (
                              <span className="text-[9px] font-cyber px-1.5 py-0.5 rounded bg-primary text-black font-bold">
                                {isArabic ? 'أنت' : 'YOU'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{lead.memberId}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-muted-foreground hidden sm:table-cell">
                      {lead.faculty || 'Engineering'}
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded text-[10px] font-cyber tracking-wider bg-white/5 border border-white/10 text-primary">
                        {lead.level}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right rtl:text-left font-cyber font-bold text-primary text-sm">
                      {lead.totalPoints} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
