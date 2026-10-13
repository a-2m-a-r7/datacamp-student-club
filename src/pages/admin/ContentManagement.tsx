import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layout, Save, Target, Info, Globe, MessageSquare, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { defaultHomeContent, defaultAboutData } from '../../lib/defaultContent';
import { contentService } from '../../services/contentService';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('home');

  const pages = [
    { id: 'home', name: 'Home Page', icon: Layout },
    { id: 'about', name: 'About Us', icon: Info },
    { id: 'site', name: 'Discord & Social Links', icon: Share2 },
  ];

  const [homeContent, setHomeContent] = useState(defaultHomeContent);
  const [aboutData, setAboutData] = useState(defaultAboutData);
  const [siteSettings, setSiteSettings] = useState<any>({
    discordUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    siteDescription: '',
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [home, about, site] = await Promise.all([
          contentService.getSetting('home'),
          contentService.getSetting('about'),
          contentService.getSetting('site'),
        ]);
        if (home) setHomeContent(home);
        if (about) setAboutData(about);
        if (site) {
          // Normalize socialLinks array into flat state for easy editing
          const links = site.socialLinks || [];
          const gh = links.find((l: any) => l.platform?.toLowerCase() === 'github')?.url || site.githubUrl || '';
          const li = links.find((l: any) => l.platform?.toLowerCase() === 'linkedin')?.url || site.linkedinUrl || '';
          const tw = links.find((l: any) => l.platform?.toLowerCase() === 'twitter')?.url || site.twitterUrl || '';
          const fb = links.find((l: any) => l.platform?.toLowerCase() === 'facebook')?.url || site.facebookUrl || '';
          setSiteSettings({
            discordUrl: site.discordUrl || '',
            githubUrl: gh,
            linkedinUrl: li,
            twitterUrl: tw,
            facebookUrl: fb,
            siteDescription: site.siteDescription || '',
          });
        }
      } catch (err) {
        console.error('Content settings fetch error:', err);
      }
    };

    loadContent();
    return contentService.subscribe('settings', loadContent);
  }, []);

  const handleSave = async () => {
    try {
      if (activeTab === 'home') await contentService.upsertSetting('home', homeContent);
      if (activeTab === 'about') await contentService.upsertSetting('about', aboutData);
      if (activeTab === 'site') {
        const socialLinks = [
          siteSettings.githubUrl ? { platform: 'github', url: siteSettings.githubUrl } : null,
          siteSettings.linkedinUrl ? { platform: 'linkedin', url: siteSettings.linkedinUrl } : null,
          siteSettings.twitterUrl ? { platform: 'twitter', url: siteSettings.twitterUrl } : null,
          siteSettings.facebookUrl ? { platform: 'facebook', url: siteSettings.facebookUrl } : null,
        ].filter(Boolean);

        await contentService.upsertSetting('site', {
          ...siteSettings,
          socialLinks,
        });
      }
      toast.success(`Content for ${activeTab} updated in database`);
    } catch (error) {
      toast.error(`Failed to update ${activeTab} content`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-cyber tracking-tighter">CONTENT CONTROL</h1>
          <p className="text-muted-foreground">Manage the text and media across all public pages.</p>
        </div>
        <Button variant="cyber" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActiveTab(page.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all border ${
              activeTab === page.id
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
            }`}
          >
            <page.icon className="w-4 h-4" />
            <span className="text-xs font-cyber uppercase tracking-widest">{page.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-6">
          {activeTab === 'home' && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The first thing visitors see on the home page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Main Heading</label>
                  <Input
                    value={homeContent.heroTitle}
                    onChange={(e) => setHomeContent({...homeContent, heroTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Sub-heading</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[80px]"
                    value={homeContent.heroSubtitle}
                    onChange={(e) => setHomeContent({...homeContent, heroSubtitle: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Statistics Counters</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {homeContent.stats.map((stat, idx) => (
                      <div key={idx} className="p-4 glass rounded-xl border-white/10 space-y-2">
                        <Input
                          value={stat.value}
                          className="h-8 text-center font-bold"
                          onChange={(e) => {
                            const newStats = [...homeContent.stats];
                            newStats[idx].value = e.target.value;
                            setHomeContent({...homeContent, stats: newStats});
                          }}
                        />
                        <Input
                          value={stat.label}
                          className="h-6 text-[10px] text-center uppercase tracking-widest"
                          onChange={(e) => {
                            const newStats = [...homeContent.stats];
                            newStats[idx].label = e.target.value;
                            setHomeContent({...homeContent, stats: newStats});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'about' && (
            <div className="grid gap-6">
              <Card className="border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Mission & Vision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Club Mission</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px]"
                      value={aboutData.mission}
                      onChange={(e) => setAboutData({...aboutData, mission: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Club Vision</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px]"
                      value={aboutData.vision}
                      onChange={(e) => setAboutData({...aboutData, vision: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-neon-blue" />
                    Our History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">History Text</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[150px]"
                      value={aboutData.history}
                      onChange={(e) => setAboutData({...aboutData, history: e.target.value})}
                    />
                  </div>
                  </CardContent>
                </Card>
              </div>
          )}

          {activeTab === 'site' && (
            <div className="space-y-6">
              <Card className="border-neon-purple/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-neon-purple" />
                    Discord Community Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure the official student Discord invitation link displayed on the Contact page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                      Discord Invite URL
                    </label>
                    <Input
                      placeholder="https://discord.gg/your-club-invite"
                      value={siteSettings.discordUrl}
                      onChange={(e) => setSiteSettings({...siteSettings, discordUrl: e.target.value})}
                    />
                    <p className="text-[11px] text-muted-foreground font-mono">
                      If left empty, the Discord section on the public Contact page displays a "Coming Soon" badge and a direct link for admins to configure it here.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-primary" />
                    Official Social Media Channels
                  </CardTitle>
                  <CardDescription>
                    Active links are displayed in the footer and across the platform. Leave empty to hide.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">GitHub Organization / Profile</label>
                      <Input
                        placeholder="https://github.com/datacamp-club"
                        value={siteSettings.githubUrl}
                        onChange={(e) => setSiteSettings({...siteSettings, githubUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">LinkedIn Page</label>
                      <Input
                        placeholder="https://linkedin.com/company/datacamp-club"
                        value={siteSettings.linkedinUrl}
                        onChange={(e) => setSiteSettings({...siteSettings, linkedinUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Twitter / X Profile</label>
                      <Input
                        placeholder="https://x.com/datacamp_club"
                        value={siteSettings.twitterUrl}
                        onChange={(e) => setSiteSettings({...siteSettings, twitterUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Facebook Page</label>
                      <Input
                        placeholder="https://facebook.com/datacamp.club"
                        value={siteSettings.facebookUrl}
                        onChange={(e) => setSiteSettings({...siteSettings, facebookUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
