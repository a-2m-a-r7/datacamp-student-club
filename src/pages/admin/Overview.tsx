import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, Calendar, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const Overview = () => {
  const [counts, setCounts] = useState({
    users: 0,
    events: 0,
    registrations: 0,
    uptime: '—'
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ name: string; users: number; events: number }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      let userCount = 0;
      let eventCount = 0;
      let regCount = 0;
      let activity: any[] = [];

      if (isSupabaseConfigured) {
        try {
          const { count: usersTotal, error: usersError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          if (usersError) throw usersError;
          userCount = usersTotal || 0;

          const { count: eventsTotal, data: evList, error: eventsError } = await supabase.from('events').select('registered_count');
          if (eventsError) throw eventsError;
          eventCount = eventsTotal || (evList?.length ?? 0);
          regCount = (evList || []).reduce((sum: number, ev: any) => sum + (ev.registered_count || 0), 0);

          const { data: logsData } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5);
          activity = (logsData || []).map((l: any) => ({
            user: l.user_email || 'Member',
            action: l.action,
            time: l.created_at ? new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
          }));
          const { data: growth, error: growthError } = await supabase.rpc('admin_growth');
          if (growthError) throw growthError;
          setChartData(growth || []);


        } catch (err) {
          setError('Analytics could not be loaded. Check database setup.');
        }
      }

      setCounts({ users: userCount, events: eventCount, registrations: regCount, uptime: '—' });
      setRecentActivity(activity);
    };

    fetchData();
  }, []);

  const stats = [
    { label: 'Total Members', value: counts.users.toLocaleString(), trend: '', up: true, icon: Users, color: 'text-neon-green' },
    { label: 'Total Events', value: counts.events.toString(), trend: '', up: true, icon: Calendar, color: 'text-neon-blue' },
    { label: 'Total Registrations', value: counts.registrations.toString(), trend: '', up: true, icon: TrendingUp, color: 'text-neon-purple' },
    { label: 'System Uptime', value: counts.uptime, trend: '', up: true, icon: Activity, color: 'text-primary' },
  ];


  return (
    <div className="space-y-8">
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-cyber tracking-tighter">SYSTEM OVERVIEW</h1>
        <p className="text-muted-foreground">Real-time analytics and club performance metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={stat.label}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center text-xs font-bold ${stat.up ? 'text-neon-green' : 'text-destructive'}`}>
                  {stat.trend}
                  {stat.up ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
                </div>
              </div>
              <div>
                <div className="text-3xl font-black font-cyber tracking-tighter">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">GROWTH METRICS</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0E17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#39FF14' }}
                />
                <Area type="monotone" dataKey="users" stroke="#39FF14" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg">AUDIT LOGS</CardTitle>
            <Link to="/admin/security" aria-label="View audit records"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentActivity.map((log, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-primary">
                  {log.user.charAt(0)}
                </div>
                <div className="flex-grow">
                  <div className="text-xs font-bold">{log.user}</div>
                  <div className="text-[10px] text-muted-foreground">{log.action}</div>
                </div>
                <div className="text-[10px] text-muted-foreground whitespace-nowrap">{log.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
