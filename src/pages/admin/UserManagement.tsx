import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, runTransaction, addDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReady } from '../../lib/firebase';
import { logAction } from '../../lib/logger';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Search, Filter, Download, Upload, MoreVertical, 
  CheckCircle, XCircle, UserPlus, FileSpreadsheet, Trash2, ShieldAlert, Eye, Calendar,
  Shield, Key, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { hashPassword } from '../../lib/utils';
import { demoUsers, setDemoUsers, demoEvents, demoStaff } from '../../lib/demoData';
import { generateMemberId } from '../../lib/memberUtils';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';
import { RoleEditorModal } from '../../components/admin/RoleEditorModal';
import { ROLE_DEFINITIONS, ROLE_LIST, ALL_PERMISSIONS } from '../../lib/roleDefinitions';
import { UserRole } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const UserManagement = () => {
  const { isArabic } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingRoleUser, setEditingRoleUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    if (!isFirebaseReady) {
      setEvents(demoEvents);
    } else {
      const q = query(collection(db, 'events'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.warn("Events listener permission denied or error:", error);
      });
      return () => unsubscribe();
    }
  }, []);

  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'member',
    faculty: 'Engineering',
    status: 'active'
  });

  useEffect(() => {
    if (!isFirebaseReady) {
      setUsers(demoUsers);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.warn("Users listener permission denied:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isFirebaseReady]);

  const updateDemoUsers = (newUsers: any[]) => {
    setDemoUsers(newUsers);
    setUsers(newUsers);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    setLoading(true);

    const memberId = await generateMemberId(users);

    const { password: newUserPassword, ...safeUserData } = newUser;
    const userData = {
      ...safeUserData,
      memberId,
      createdAt: new Date().toISOString()
    };

    if (!isFirebaseReady) {
      const hashedPassword = await hashPassword(newUserPassword || 'temp_pass');
      const mockUser = { 
        id: 'mock_' + Date.now(), 
        ...userData, 
        password: hashedPassword,
        uid: 'mock_uid_' + Date.now() 
      };
      const updatedUsers = [mockUser, ...users];
      updateDemoUsers(updatedUsers);
      toast.success('Operative added to database (Demo Mode)');
      setShowAddModal(false);
      setLoading(false);
      return;
    }

    let secondaryAuth;
    let secondaryApp;
    
    try {
      // Create user in Firebase Auth using a secondary instance to avoid logging out admin
      const appName = `SecondaryApp_${Date.now()}`;
      secondaryApp = initializeApp(firebaseConfig, appName);
      secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        newUser.email.trim(), 
        newUserPassword || Math.random().toString(36).slice(-10) + '!'
      );
      
      const uid = userCredential.user.uid;

      // Now create the Firestore document with the correct UID
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', uid), {
        ...userData,
        email: newUser.email.toLowerCase().trim(),
        uid,
        isVerified: false,
        updatedAt: new Date().toISOString()
      });

      await logAction('USER_ADDED', 'Admin', userData.fullName, 'success');
      toast.success('Operative created successfully in Auth & Firestore');
      setShowAddModal(false);
    } catch (error: any) {
      console.error("Admin user creation error:", error);
      toast.error(error.message || 'Failed to create operative');
    } finally {
      // Cleanup ALWAYS - prevent leaks
      if (secondaryAuth) await signOut(secondaryAuth);
      if (secondaryApp) await deleteApp(secondaryApp);
      setLoading(false);
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB maximum limit');
      return;
    }

    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error('Invalid file format. Only .csv, .xlsx, or .xls files are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', raw: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        // Sanitize imported objects against prototype pollution keys
        const safeData = rawData.map(row => {
          const cleanRow: Record<string, any> = {};
          for (const key of Object.keys(row)) {
            if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
              cleanRow[key] = row[key];
            }
          }
          return cleanRow;
        });

        if (!isFirebaseReady) {
          const newUsers = safeData.map((item, index) => ({
            id: `imported_${Date.now()}_${index}`,
            fullName: String(item.fullName || item.Name || 'Imported User').slice(0, 100),
            email: String(item.email || item.Email || `user${index}@example.com`).slice(0, 100),
            role: item.role === 'super_admin' ? 'super_admin' : 'member',
            memberId: String(item.memberId || item.ID || (users.length + index + 1)).slice(0, 20),
            status: item.status === 'inactive' ? 'inactive' : 'active',
            faculty: String(item.faculty || item.Faculty || 'Unknown').slice(0, 100),
            createdAt: item.createdAt || new Date().toISOString(),
            isVerified: item.isVerified === true || item.isVerified === 'true'
          }));

          const updatedUsers = [...users, ...newUsers];
          updateDemoUsers(updatedUsers);
          toast.success(`Successfully imported ${newUsers.length} operatives.`);
        } else {
          toast.info(`Imported ${safeData.length} records. Batch processing required for live database.`);
        }
      } catch (error) {
        toast.error('Failed to parse file. Ensure it is a valid Excel or CSV file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "DataCamp_Members_Export.xlsx");
    toast.success('Exporting member database...');
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!isFirebaseReady) {
      const newUsers = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
      updateDemoUsers(newUsers);
      toast.success(`User status updated to ${newStatus}`);
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      await logAction('USER_STATUS_CHANGE', 'Admin', `${userId} -> ${newStatus}`, 'success');
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    if (!isFirebaseReady) {
      const newUsers = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
      updateDemoUsers(newUsers);
      toast.success(`Role updated to ${newRole}`);
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      await logAction('USER_ROLE_CHANGE', 'Admin', `${userId} -> ${newRole}`, 'success');
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!isFirebaseReady) {
      const newUsers = users.filter(u => u.id !== userId);
      updateDemoUsers(newUsers);
      toast.success('User removed from database');
      setShowDeleteConfirm(null);
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userId));
      await logAction('USER_DELETED', 'Admin', userId, 'warning');
      toast.success('User removed from database');
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-cyber tracking-tighter">
            {isArabic ? 'إدارة الأعضاء والرولات' : 'USER MANAGEMENT'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic 
              ? 'إدارة أعضاء النادي، محرر الرولات، وتعيين الصلاحيات والمشغلين.' 
              : 'Manage club members, role clearances, and operational permissions.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleExport} className="border-primary/30">
            <Download className="w-4 h-4 mr-2" />
            {isArabic ? 'تصدير إكسيل' : 'EXPORT_EXCEL'}
          </Button>
          <Button variant="cyber" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            {isArabic ? 'إضافة عضو جديد' : 'ADD OPERATIVE'}
          </Button>
        </div>
      </div>

      {/* View Switcher: Users List vs Roles Matrix */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cyber tracking-wider transition-all border ${
            activeTab === 'users'
              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(57,255,20,0.15)] font-bold'
              : 'border-white/5 text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{isArabic ? 'قائمة الأعضاء والمشغلين' : 'OPERATIVES_ROSTER'}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white">
            {filteredUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cyber tracking-wider transition-all border ${
            activeTab === 'matrix'
              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(57,255,20,0.15)] font-bold'
              : 'border-white/5 text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{isArabic ? 'مصفوفة الرولات والصلاحيات' : 'ROLES_PERMISSIONS_MATRIX'}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {ROLE_LIST.length} Roles
          </span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
              <Input 
                placeholder={isArabic ? 'البحث بالاسم أو المعرف أو البريد...' : 'Search by name, ID, or email...'} 
                className={isArabic ? 'pr-10' : 'pl-10'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-md px-2">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <select 
                  className="bg-dark-navy border-none text-[10px] font-bold uppercase tracking-widest outline-none py-2 text-foreground cursor-pointer"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all" className="bg-dark-navy text-white">
                    {isArabic ? 'جميع الرولات (ALL)' : 'ALL_ROLES'}
                  </option>
                  {ROLE_LIST.map(r => (
                    <option key={r.id} value={r.id} className="bg-dark-navy text-white">
                      {isArabic ? `${r.titleAr} (${r.tag})` : `${r.titleEn} (${r.tag})`}
                    </option>
                  ))}
                </select>
              </div>
              <label className="cursor-pointer">
                <input type="file" accept=".csv, .xlsx" className="hidden" onChange={handleImportCSV} />
                <div className="flex items-center px-3 py-2 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold hover:bg-white/10 transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-2" /> {isArabic ? 'استيراد CSV' : 'IMPORT_CSV'}
                </div>
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="p-4 font-medium">{isArabic ? 'العضو' : 'Operative'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'رقم العضوية' : 'ID Number'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'الرول والصلاحية' : 'Role & Clearance'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'التوثيق' : 'Verification'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'الحالة' : 'Status'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center animate-pulse">{isArabic ? 'جاري الاتصال بقاعدة البيانات...' : 'QUERYING DATABASE...'}</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{isArabic ? 'لم يتم العثور على أي أعضاء' : 'NO_OPERATIVES_FOUND'}</td></tr>
                  ) : filteredUsers.map((user) => {
                    const roleDef = ROLE_DEFINITIONS[user.role as UserRole] || ROLE_DEFINITIONS.member;

                    return (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {user.fullName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-bold">{user.fullName}</div>
                              <div className="text-[10px] text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-neon-blue">{user.memberId}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingRoleUser(user)}
                              className={`px-2.5 py-1 rounded-md border text-[10px] font-cyber tracking-wider font-bold transition-all flex items-center gap-1.5 hover:scale-105 shadow-sm ${roleDef.badgeBg} ${roleDef.badgeBorder} ${roleDef.badgeColor}`}
                              title={isArabic ? 'فتح محرر الرولات والصلاحيات' : 'Open Role & Permissions Editor'}
                            >
                              <Shield className="w-3 h-3 shrink-0" />
                              <span>{isArabic ? roleDef.titleAr.split(' ')[0] : roleDef.tag}</span>
                            </button>
                            <select 
                              className="bg-dark-navy border border-white/10 rounded px-1.5 py-1 text-[10px] font-mono text-muted-foreground outline-none focus:border-primary cursor-pointer max-w-[110px]"
                              value={user.role}
                              onChange={(e) => changeUserRole(user.id, e.target.value)}
                            >
                              {ROLE_LIST.map(r => (
                                <option key={r.id} value={r.id} className="bg-dark-navy text-white">
                                  {r.id}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center text-[10px] font-bold uppercase tracking-widest ${user.isVerified ? 'text-neon-green' : 'text-muted-foreground'}`}>
                            {user.isVerified ? (
                              <><CheckCircle className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'موثق' : 'Verified'}</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'معلق' : 'Pending'}</>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => toggleUserStatus(user.id, user.status)}
                            className={`flex items-center text-xs font-bold ${user.status === 'active' ? 'text-neon-green' : 'text-destructive'}`}
                          >
                            {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" /> : <XCircle className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />}
                            {user.status.toUpperCase()}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-amber-400 hover:bg-amber-400/10 border border-transparent hover:border-amber-400/20"
                              onClick={() => setEditingRoleUser(user)}
                              title={isArabic ? 'محرر الرول والصلاحيات' : 'Role & Permissions Editor'}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20"
                              onClick={() => setViewingUser(user)}
                              title={isArabic ? 'عرض التفاصيل' : 'View Intel'}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
                              onClick={() => setShowDeleteConfirm(user.id)}
                              title={isArabic ? 'حذف العضو' : 'Delete Operative'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Roles & Permissions Matrix Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ROLE_LIST.map((role) => {
              const count = users.filter(u => u.role === role.id).length;

              return (
                <div
                  key={role.id}
                  className={`p-4 rounded-xl border transition-all ${role.badgeBg} ${role.badgeBorder} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${role.badgeBg} ${role.badgeBorder} ${role.badgeColor}`}>
                        {role.tag}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Level {role.level}/10
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white font-cyber mb-1">
                      {isArabic ? role.titleAr : role.titleEn}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {isArabic ? role.descriptionAr : role.descriptionEn}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono">
                      <strong className="text-white text-sm">{count}</strong> {isArabic ? 'أعضاء' : 'Operatives'}
                    </span>
                    <button
                      onClick={() => {
                        setFilterRole(role.id);
                        setActiveTab('users');
                      }}
                      className="text-[10px] font-cyber text-primary hover:underline"
                    >
                      {isArabic ? 'عرض الأعضاء ↗' : 'VIEW_USERS ↗'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-cyber flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                {isArabic ? 'جدول توزيع الصلاحيات حسب الرول' : 'SYSTEM PERMISSIONS MATRIX'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'مصفوفة تفصيلية لجميع الصلاحيات والأنظمة الفرعية مقابل كل رول داخل نادي DataCamp.' 
                  : 'Comprehensive cross-matrix of all functional platform capabilities mapped against assigned clearances.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="p-3 font-medium min-w-[200px]">{isArabic ? 'الصلاحية / الوظيفة' : 'Capability'}</th>
                      {ROLE_LIST.map(r => (
                        <th key={r.id} className="p-3 font-medium text-center min-w-[90px]">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${r.badgeColor}`}>
                            {r.tag}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_PERMISSIONS.map((perm) => (
                      <tr key={perm.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-white font-cyber">{isArabic ? perm.nameAr : perm.nameEn}</div>
                          <div className="text-[10px] text-muted-foreground">{isArabic ? perm.descriptionAr : perm.descriptionEn}</div>
                        </td>
                        {ROLE_LIST.map(r => {
                          const isGranted = r.permissions.includes(perm.id);
                          return (
                            <td key={r.id} className="p-3 text-center">
                              {isGranted ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neon-green/20 text-neon-green font-bold">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/5 text-muted-foreground/30 font-bold">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Operative Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-navy/90 backdrop-blur-md">
          <Card className="w-full max-w-lg border-primary/30 shadow-[0_0_50px_rgba(57,255,20,0.1)]">
            <CardHeader>
              <CardTitle className="text-2xl font-cyber">INITIALIZE_NEW_OPERATIVE</CardTitle>
              <CardDescription className="text-destructive font-bold text-[10px] uppercase tracking-widest">
                Warning: This creates a database record only. Operatives must still register via the portal to access the grid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Full Name</label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    value={newUser.fullName} 
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Email Address</label>
                  <Input 
                    type="email"
                    placeholder="operative@datacamp.com" 
                    value={newUser.email} 
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Initial Password</label>
                  <Input 
                    type="password"
                    placeholder="Set temporary password" 
                    value={newUser.password} 
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                    required 
                  />
                  <p className="text-[8px] text-muted-foreground">Inform the operative of this password. They should change it upon first login.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Assigned Role</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="member" className="bg-dark-navy">Member (عضو طالب)</option>
                      <option value="super_admin" className="bg-dark-navy text-primary">Super Admin (سوبر أدمن)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Faculty</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      value={newUser.faculty}
                      onChange={(e) => setNewUser({...newUser, faculty: e.target.value})}
                    >
                      <option value="Computer Science" className="bg-dark-navy">Computer Science</option>
                      <option value="Engineering" className="bg-dark-navy">Engineering</option>
                      <option value="Nursing" className="bg-dark-navy">Nursing</option>
                      <option value="Physical Therapy" className="bg-dark-navy">Physical Therapy</option>
                      <option value="Business" className="bg-dark-navy">Business</option>
                      <option value="Arts" className="bg-dark-navy">Arts</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6">
                  <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>ABORT</Button>
                  <Button variant="cyber" type="submit">CONFIRM_ENTRY</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-navy/90 backdrop-blur-md">
          <Card className="w-full max-w-md border-destructive/30">
            <CardHeader>
              <CardTitle className="text-xl font-cyber text-destructive flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" />
                DANGER_ZONE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to remove this operative from the database? This action is permanent and will redact all associated access keys.
              </p>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)}>CANCEL</Button>
                <Button variant="destructive" onClick={() => deleteUser(showDeleteConfirm)}>REDACT_OPERATIVE</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View User Activity Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-navy/90 backdrop-blur-md">
          <Card className="w-full max-w-2xl border-primary/30 shadow-[0_0_50px_rgba(57,255,20,0.1)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {viewingUser.fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <CardTitle className="text-xl font-cyber">{viewingUser.fullName}</CardTitle>
                  <CardDescription className="text-xs font-mono text-primary/70">ID: {viewingUser.memberId} • {viewingUser.email}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingUser(null)}><XCircle className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground mb-1">
                      {isArabic ? 'الرول الحالي والصلاحية' : 'Current Role & Clearance'}
                    </p>
                    {(() => {
                      const vRoleDef = ROLE_DEFINITIONS[viewingUser.role as UserRole] || ROLE_DEFINITIONS.member;
                      return (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${vRoleDef.badgeBg} ${vRoleDef.badgeBorder} ${vRoleDef.badgeColor}`}>
                            {isArabic ? vRoleDef.titleAr : vRoleDef.titleEn}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">Lvl {vRoleDef.level}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <Button 
                    variant="cyber" 
                    size="sm" 
                    onClick={() => setEditingRoleUser(viewingUser)}
                    className="text-xs gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {isArabic ? 'تعديل الرول' : 'EDIT_ROLE'}
                  </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground mb-2">
                    {isArabic ? 'الكلية' : 'Faculty'}
                  </p>
                  <p className="font-bold">{viewingUser.faculty || (isArabic ? 'غير محددة' : 'Not Specified')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-cyber uppercase tracking-widest text-primary flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  {isArabic ? 'العمليات والمهام المرتبطة' : 'RELATED_OPERATIONS'}
                </h4>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                    {isArabic ? 'الفعاليات المنظمة' : 'Organized Events'}
                  </p>
                  {events.filter(e => e.organizers?.some((o: string) => o.includes(viewingUser.email) || o.includes(viewingUser.memberId))).length > 0 ? (
                    <div className="grid gap-2">
                      {events.filter(e => e.organizers?.some((o: string) => o.includes(viewingUser.email) || o.includes(viewingUser.memberId))).map((e, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-3 rtl:mr-0 rtl:ml-3 text-primary" />
                            <span className="text-sm">{e.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{new Date(e.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic p-4 bg-white/5 rounded border border-dashed border-white/10 text-center">
                      {isArabic ? 'لا توجد فعاليات مسندة لهذا العضو حالياً.' : 'No active event assignments found for this operative.'}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                    {isArabic ? 'حالة الانضمام للكادر' : 'Staff Status'}
                  </p>
                  {demoStaff.some((s: any) => s.linkedUser?.includes(viewingUser.email) || s.linkedUser?.includes(viewingUser.memberId)) ? (
                    <div className="p-3 bg-primary/10 rounded border border-primary/30 flex items-center justify-between">
                      <div className="flex items-center">
                        <ShieldAlert className="w-4 h-4 mr-3 rtl:mr-0 rtl:ml-3 text-primary" />
                        <span className="text-sm font-bold">{isArabic ? 'عضو كادر قيادي نشط' : 'ACTIVE CORE OPERATIVE'}</span>
                      </div>
                      <span className="text-[10px] font-cyber text-primary">{isArabic ? 'موثق' : 'VERIFIED'}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic p-4 bg-white/5 rounded border border-dashed border-white/10 text-center">
                      {isArabic ? 'غير مدرج في قائمة الكادر الأساسي حالياً.' : 'Not currently listed in core staff roster.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="cyber" onClick={() => setViewingUser(null)}>
                  {isArabic ? 'إغلاق المعاينة' : 'CLOSE_INTEL'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role & Permissions Editor Modal */}
      {editingRoleUser && (
        <RoleEditorModal
          user={editingRoleUser}
          isOpen={!!editingRoleUser}
          onClose={() => setEditingRoleUser(null)}
          onSaveRole={async (userId, newRole) => {
            await changeUserRole(userId, newRole);
            if (viewingUser && viewingUser.id === userId) {
              setViewingUser({ ...viewingUser, role: newRole });
            }
          }}
        />
      )}
    </div>
  );
};

const Activity = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default UserManagement;
