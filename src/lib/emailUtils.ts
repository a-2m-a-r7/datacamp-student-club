/**
 * emailUtils.ts
 * Utility to identify university vs personal email addresses,
 * recognize academic institutions, and route users directly to
 * Gmail or Microsoft Outlook / Office 365 webmail.
 */

export interface EmailInfo {
  email: string;
  isUniversity: boolean;
  type: 'university' | 'personal';
  provider: 'gmail' | 'outlook' | 'yahoo' | 'other';
  institutionName?: string;
  webmailUrl: string;
  providerLabel: string;
}

// Known Egyptian & International University Domain Mappings
const UNIVERSITY_DOMAINS: Record<string, string> = {
  'asu.edu.eg': 'Ain Shams University',
  'eng.asu.edu.eg': 'Faculty of Engineering, Ain Shams University',
  'cis.asu.edu.eg': 'Faculty of Computer & Information Sciences, Ain Shams University',
  'cu.edu.eg': 'Cairo University',
  'fci.cu.edu.eg': 'Faculty of Computers and AI, Cairo University',
  'eng.cu.edu.eg': 'Faculty of Engineering, Cairo University',
  'alexu.edu.eg': 'Alexandria University',
  'mans.edu.eg': 'Mansoura University',
  'au.edu.eg': 'Assiut University',
  'bu.edu.eg': 'Benha University',
  'helwan.edu.eg': 'Helwan University',
  'fcih.helwan.edu.eg': 'Faculty of Computers and AI, Helwan University',
  'giu-uni.de': 'German International University (GIU)',
  'guc.edu.eg': 'German University in Cairo (GUC)',
  'aucegypt.edu': 'American University in Cairo (AUC)',
  'bue.edu.eg': 'British University in Egypt (BUE)',
  'eui.edu.eg': 'Egypt University of Informatics (EUI)',
  'znu.edu.eg': 'Zagazig University',
  'mu.edu.eg': 'Minia University',
  'svu.edu.eg': 'South Valley University',
};

export function analyzeEmail(email: string): EmailInfo {
  const cleanEmail = email.trim().toLowerCase();
  const domain = cleanEmail.split('@')[1] || '';

  const isEdu =
    domain.endsWith('.edu') ||
    domain.includes('.edu.') ||
    domain.endsWith('.ac.uk') ||
    domain.endsWith('.edu.eg') ||
    domain.endsWith('.edu.sa') ||
    domain in UNIVERSITY_DOMAINS;

  // Determine institution name if available
  let institutionName: string | undefined;
  if (UNIVERSITY_DOMAINS[domain]) {
    institutionName = UNIVERSITY_DOMAINS[domain];
  } else if (isEdu) {
    const parts = domain.split('.');
    const uniPart = parts[0] === 'eng' || parts[0] === 'fci' || parts[0] === 'cis' ? parts[1] : parts[0];
    institutionName = `${uniPart.toUpperCase()} University / Academic Institute`;
  }

  // Determine email provider & direct webmail URL
  if (isEdu) {
    // Almost all universities use Microsoft 365 / Outlook for student email
    return {
      email: cleanEmail,
      isUniversity: true,
      type: 'university',
      provider: 'outlook',
      institutionName,
      webmailUrl: 'https://outlook.office.com/mail/',
      providerLabel: 'Microsoft Outlook / Office 365 (University Mail)',
    };
  }

  if (domain.includes('gmail.com')) {
    return {
      email: cleanEmail,
      isUniversity: false,
      type: 'personal',
      provider: 'gmail',
      webmailUrl: 'https://mail.google.com/',
      providerLabel: 'Google Gmail',
    };
  }

  if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com')) {
    return {
      email: cleanEmail,
      isUniversity: false,
      type: 'personal',
      provider: 'outlook',
      webmailUrl: 'https://outlook.live.com/mail/',
      providerLabel: 'Microsoft Outlook Personal',
    };
  }

  if (domain.includes('yahoo.com')) {
    return {
      email: cleanEmail,
      isUniversity: false,
      type: 'personal',
      provider: 'yahoo',
      webmailUrl: 'https://mail.yahoo.com/',
      providerLabel: 'Yahoo Mail',
    };
  }

  return {
    email: cleanEmail,
    isUniversity: false,
    type: 'personal',
    provider: 'other',
    webmailUrl: `mailto:${cleanEmail}`,
    providerLabel: 'Webmail Client',
  };
}
