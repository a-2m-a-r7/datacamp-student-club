import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Check, X, ShieldAlert, Sparkles, Key, CheckCircle2, 
  XCircle, ArrowRight, UserCheck, Lock, Unlock, Info
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { UserRole } from '../../types';
import { ROLE_DEFINITIONS, ROLE_LIST, ALL_PERMISSIONS } from '../../lib/roleDefinitions';
import { useLanguage } from '../../contexts/LanguageContext';

interface RoleEditorModalProps {
  user: {
    id: string;
    uid?: string;
    fullName: string;
    email: string;
    memberId: string;
    role: UserRole;
    faculty?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSaveRole: (userId: string, newRole: UserRole) => Promise<void>;
}

export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaveRole,
}) => {
  const { isArabic } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role || 'member');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

  if (!isOpen) return null;

  const currentRoleInfo = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.member;
  const selectedRoleInfo = ROLE_DEFINITIONS[selectedRole] || ROLE_DEFINITIONS.member;
  const hasChanged = selectedRole !== user.role;

  const handleSave = async () => {
    if (!hasChanged || saving) return;
    setSaving(true);
    try {
      await onSaveRole(user.id, selectedRole);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-dark-navy/90 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl my-auto glass rounded-2xl border border-primary/30 shadow-[0_0_60px_rgba(57,255,20,0.12)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-cyber tracking-tight text-white">
                  {isArabic ? 'محرر الرولات والصلاحيات' : 'ROLE & PERMISSIONS EDITOR'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
                  {selectedRoleInfo.tag}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isArabic 
                  ? `تعديل صلاحيات العضو: ${user.fullName} (${user.memberId})` 
                  : `Configuring operational clearances for: ${user.fullName} (${user.memberId})`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current vs Target Summary Bar */}
        <div className="px-6 py-3 bg-white/[0.03] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{isArabic ? 'الرول الحالي:' : 'Current Role:'}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${currentRoleInfo.badgeBg} ${currentRoleInfo.badgeBorder} ${currentRoleInfo.badgeColor}`}>
              {isArabic ? currentRoleInfo.titleAr : currentRoleInfo.titleEn}
            </span>
          </div>

          {hasChanged && (
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">{isArabic ? 'الرول الجديد المقترح:' : 'Proposed Role:'}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${selectedRoleInfo.badgeBg} ${selectedRoleInfo.badgeBorder} ${selectedRoleInfo.badgeColor}`}>
                {isArabic ? selectedRoleInfo.titleAr : selectedRoleInfo.titleEn}
              </span>
            </div>
          )}

          {/* Sub-Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3 py-1 rounded text-xs font-cyber tracking-wider transition-all ${
                activeTab === 'roles' ? 'bg-primary text-black font-bold shadow-[0_0_10px_#39FF14]' : 'text-muted-foreground hover:text-white'
              }`}
            >
              {isArabic ? 'اختيار الرول' : 'SELECT ROLE'}
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-3 py-1 rounded text-xs font-cyber tracking-wider transition-all ${
                activeTab === 'permissions' ? 'bg-primary text-black font-bold shadow-[0_0_10px_#39FF14]' : 'text-muted-foreground hover:text-white'
              }`}
            >
              {isArabic ? 'مصفوفة الصلاحيات' : 'PERMISSIONS MATRIX'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
          {activeTab === 'roles' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ROLE_LIST.map((role) => {
                const isSelected = selectedRole === role.id;
                const isCurrent = user.role === role.id;

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all border text-left rtl:text-right flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(57,255,20,0.2)] ring-1 ring-primary'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${role.badgeBg} ${role.badgeBorder} ${role.badgeColor}`}>
                          {role.tag}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isCurrent && (
                            <span className="text-[9px] font-cyber px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground border border-white/10">
                              {isArabic ? 'الحالي' : 'CURRENT'}
                            </span>
                          )}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            isSelected ? 'bg-primary text-black border-primary' : 'border-white/20 text-transparent'
                          }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-white font-cyber mb-1">
                        {isArabic ? role.titleAr : role.titleEn}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                        {isArabic ? role.descriptionAr : role.descriptionEn}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span>Level {role.level}/10</span>
                      <span className="text-primary">{role.permissions.length} {isArabic ? 'صلاحية' : 'Privileges'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Permissions Matrix Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white font-cyber text-sm flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    {isArabic ? 'صلاحيات الرول المختار:' : 'Clearances for selected role:'} {isArabic ? selectedRoleInfo.titleAr : selectedRoleInfo.titleEn}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isArabic 
                      ? 'يوضح الجدول التالي الصلاحيات الممنوحة تلقائياً لهذا الرول داخل لوحة التحكم والمنصة.' 
                      : 'Granular system privileges granted to operatives assigned this clearance level.'}
                  </p>
                </div>
                <div className="text-right rtl:text-left">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
                    {selectedRoleInfo.permissions.length} / {ALL_PERMISSIONS.length} {isArabic ? 'مفعلة' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ALL_PERMISSIONS.map((perm) => {
                  const isGranted = selectedRoleInfo.permissions.includes(perm.id);

                  return (
                    <div
                      key={perm.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isGranted
                          ? 'bg-neon-green/5 border-neon-green/30 text-white'
                          : 'bg-white/[0.01] border-white/5 text-muted-foreground opacity-60'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isGranted ? 'bg-neon-green/20 text-neon-green' : 'bg-white/5 text-muted-foreground'
                      }`}>
                        {isGranted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-bold text-xs font-cyber tracking-wide">
                            {isArabic ? perm.nameAr : perm.nameEn}
                          </h5>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                            isGranted ? 'text-neon-green bg-neon-green/10' : 'text-muted-foreground'
                          }`}>
                            {isGranted ? (isArabic ? 'ممنوح' : 'GRANTED') : (isArabic ? 'محظور' : 'RESTRICTED')}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {isArabic ? perm.descriptionAr : perm.descriptionEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            {hasChanged ? (
              <span className="text-amber-400 font-cyber flex items-center gap-1.5">
                <Info className="w-4 h-4 shrink-0" />
                {isArabic ? 'تم تغيير الرول - اضغط حفظ لاعتماد الصلاحيات الجديدة.' : 'Pending changes: Apply to update database clearances.'}
              </span>
            ) : (
              <span>{isArabic ? 'لم يتم إجراء تعديل على الرول الحالي.' : 'No modifications made.'}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              {isArabic ? 'إلغاء' : 'CANCEL'}
            </Button>
            <Button
              variant="cyber"
              onClick={handleSave}
              disabled={!hasChanged || saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  {isArabic ? 'جاري الحفظ...' : 'UPDATING...'}
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  {isArabic ? 'تطبيق وحفظ الرول' : 'APPLY CLEARANCE'}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
