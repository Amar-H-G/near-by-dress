import { useState, useEffect } from 'react';
import { useSettings } from '../../core/contexts/useSettings';
import API from '../../core/api/client';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon, Save, Globe, Palette, Phone, Search,
  MessageCircle, Image, Bell, MapPin, Layout, ShoppingBag, Share2, Plus, Trash2,
  ChevronUp, ChevronDown, RefreshCw, Quote, Tag, List, Star, FileText
} from 'lucide-react';

const TABS = [
  { id: 'builder',      label: 'Homepage Builder', icon: List },
  { id: 'branding',     label: 'Branding',         icon: Globe },
  { id: 'colors',       label: 'Colors',           icon: Palette },
  { id: 'contact',      label: 'Contact',          icon: Phone },
  { id: 'seo',          label: 'SEO',              icon: Search },
  { id: 'whatsapp',     label: 'WhatsApp',         icon: MessageCircle },
  { id: 'hero',         label: 'Hero Banner',      icon: Image },
  { id: 'campaigns',    label: 'Campaigns',        icon: Layout },
  { id: 'mood',         label: 'Moods Section',    icon: Star },
  { id: 'features',     label: 'Features List',    icon: Layout },
  { id: 'testimonials', label: 'Testimonials',     icon: Quote },
  { id: 'offers',       label: 'Offers & Coupons', icon: Tag },
  { id: 'location',     label: 'Location Defaults',icon: MapPin },
  { id: 'sellercta',    label: 'Seller CTA',       icon: ShoppingBag },
  { id: 'social',       label: 'Social Links',     icon: Share2 },
  { id: 'cms',          label: 'Page CMS Builder', icon: FileText },
];

const Field = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>
    {children}
    {hint && <span style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.7 }}>{hint}</span>}
  </div>
);

const Input = (props) => (
  <input className="input" style={{ fontSize: 14 }} {...props} />
);

const Textarea = (props) => (
  <textarea className="input" rows={3} style={{ fontSize: 14, resize: 'vertical' }} {...props} />
);

const ColorField = ({ label, name, value, onChange }) => (
  <Field label={label}>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <input type="color" name={name} value={value || '#000000'} onChange={onChange}
        style={{ width: 44, height: 44, padding: 2, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'var(--surface-2)' }} />
      <Input type="text" name={name} value={value || ''} onChange={onChange} style={{ flex: 1 }} placeholder="#7c3aed" />
    </div>
  </Field>
);

const Toggle = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
    <div style={{ position: 'relative', width: 44, height: 24 }} onClick={onChange}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 12,
        background: checked ? 'var(--primary)' : 'var(--border)',
        transition: 'background 0.2s'
      }} />
      <div style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
    <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
  </label>
);

const AdminSettings = () => {
  const { settings, refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('builder');
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) setForm(JSON.parse(JSON.stringify(settings)));
  }, [settings]);

  const set = (path, value) => {
    setForm(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...(obj[keys[i]] || {}) };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    set(name, type === 'checkbox' ? checked : value);
  };

  // Move a section up/down in the homepage sections order array
  const moveSection = (index, direction) => {
    const order = [...(form.homepageSectionsOrder || [])];
    if (direction === 'up' && index > 0) {
      const temp = order[index];
      order[index] = order[index - 1];
      order[index - 1] = temp;
    } else if (direction === 'down' && index < order.length - 1) {
      const temp = order[index];
      order[index] = order[index + 1];
      order[index + 1] = temp;
    }
    setForm(prev => ({ ...prev, homepageSectionsOrder: order }));
  };

  const handleStat = (idx, field, value) => {
    const stats = [...(form.heroBanner?.stats || [])];
    stats[idx] = { ...stats[idx], [field]: value };
    set('heroBanner.stats', stats);
  };

  const handleCampaign = (idx, field, value) => {
    const campaigns = [...(form.campaigns || [])];
    campaigns[idx] = { ...campaigns[idx], [field]: value };
    setForm(prev => ({ ...prev, campaigns }));
  };

  const addCampaign = () => {
    setForm(prev => ({
      ...prev,
      campaigns: [...(prev.campaigns || []), { title: '', copy: '', image: '', to: '/products' }]
    }));
  };

  const removeCampaign = (idx) => {
    setForm(prev => ({ ...prev, campaigns: prev.campaigns.filter((_, i) => i !== idx) }));
  };

  // Testimonials Array CRUD
  const handleTestimonial = (idx, field, value) => {
    const testimonials = [...(form.testimonials || [])];
    testimonials[idx] = { ...testimonials[idx], [field]: value };
    setForm(prev => ({ ...prev, testimonials }));
  };

  const addTestimonial = () => {
    setForm(prev => ({
      ...prev,
      testimonials: [...(prev.testimonials || []), { quote: '', author: '', role: 'Verified Shopper', avatar: '' }]
    }));
  };

  const removeTestimonial = (idx) => {
    setForm(prev => ({ ...prev, testimonials: prev.testimonials.filter((_, i) => i !== idx) }));
  };

  // Offers Array CRUD
  const handleOffer = (idx, field, value) => {
    const offers = [...(form.offers || [])];
    offers[idx] = { ...offers[idx], [field]: value };
    setForm(prev => ({ ...prev, offers }));
  };

  const addOffer = () => {
    setForm(prev => ({
      ...prev,
      offers: [...(prev.offers || []), { title: '', copy: '', code: '', discount: '', bgImage: '', link: '/products' }]
    }));
  };

  const removeOffer = (idx) => {
    setForm(prev => ({ ...prev, offers: prev.offers.filter((_, i) => i !== idx) }));
  };

  // Moods Section Array CRUD
  const handleMood = (idx, field, value) => {
    const moods = [...(form.moodSection?.moods || [])];
    moods[idx] = { ...moods[idx], [field]: value };
    set('moodSection.moods', moods);
  };

  const addMood = () => {
    const moods = [...(form.moodSection?.moods || [])];
    moods.push({ icon: 'Sparkles', title: '', copy: '', to: '' });
    set('moodSection.moods', moods);
  };

  const removeMood = (idx) => {
    const moods = (form.moodSection?.moods || []).filter((_, i) => i !== idx);
    set('moodSection.moods', moods);
  };

  // Features Section Array CRUD
  const handleFeature = (idx, field, value) => {
    const features = [...(form.featuresSection?.features || [])];
    features[idx] = { ...features[idx], [field]: value };
    set('featuresSection.features', features);
  };

  const addFeature = () => {
    const features = [...(form.featuresSection?.features || [])];
    features.push({ icon: 'Sparkles', title: '', desc: '' });
    set('featuresSection.features', features);
  };

  const removeFeature = (idx) => {
    const features = (form.featuresSection?.features || []).filter((_, i) => i !== idx);
    set('featuresSection.features', features);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      const nestedFields = [
        'socialLinks', 'seo', 'whatsapp', 'heroBanner', 'campaigns',
        'announcementBar', 'locationDefaults', 'homepageSectionsOrder',
        'homepageSections', 'sellerCta', 'featuredProductsHeader',
        'newArrivalsHeader', 'featuredShopsHeader', 'categoriesHeader',
        'moodSection', 'featuresSection', 'testimonials', 'offers'
      ];
      const skip = new Set([...nestedFields, 'logo', 'favicon', '_id', '__v', 'createdAt', 'updatedAt']);

      Object.entries(form).forEach(([k, v]) => {
        if (skip.has(k)) return;
        if (v !== null && v !== undefined) data.append(k, v);
      });
      nestedFields.forEach(k => {
        if (form[k] !== undefined) data.append(k, JSON.stringify(form[k]));
      });

      if (logoFile)    data.append('logo', logoFile);
      if (faviconFile) data.append('favicon', faviconFile);

      await API.put('/admin/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Settings saved successfully');
      await refreshSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const g = (path) => {
    const keys = path.split('.');
    let v = form;
    for (const k of keys) { v = v?.[k]; }
    return v ?? '';
  };

  const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 };
  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 };
  const sectionTitle = (t) => (
    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>{t}</h3>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ padding: 12, background: 'rgba(124,58,237,0.1)', color: 'var(--primary)', borderRadius: 12 }}>
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Platform Settings &amp; Homepage Builder</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>All values are DB-driven — changes apply globally in real-time</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Tab Sidebar */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ ...cardStyle, padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      background: active ? 'var(--primary)' : 'transparent',
                      color: active ? '#fff' : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}>
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1 }}>
            <div style={cardStyle}>

              {/* HOMEPAGE BUILDER */}
              {activeTab === 'builder' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionTitle('Homepage Layout Builder')}
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Drag &amp; reorder sections dynamically, or toggle visibility with real-time propagation.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(form.homepageSectionsOrder || []).map((key, i) => {
                      // Human readable name and matching show/hide toggle path
                      let label = key;
                      let showPath = '';

                      if (key === 'hero') { label = 'Hero Banner Slider'; showPath = 'homepageSections.showHero'; }
                      else if (key === 'features') { label = 'Core Platform Features'; showPath = 'homepageSections.showFeatures'; }
                      else if (key === 'campaigns') { label = 'Curated Campaigns'; showPath = 'homepageSections.showCampaigns'; }
                      else if (key === 'featuredProducts') { label = 'Featured Products (Editor\'s Rail)'; showPath = 'homepageSections.showFeatured'; }
                      else if (key === 'categories') { label = 'Browse by Categories'; showPath = 'homepageSections.showCategories'; } // categories is default true
                      else if (key === 'newArrivals') { label = 'New Arrivals Rail'; showPath = 'homepageSections.showNewArrivals'; }
                      else if (key === 'mood') { label = 'Mood & occasion ready Grid'; showPath = 'homepageSections.showMoodSection'; }
                      else if (key === 'featuredShops') { label = 'Boutique Discovery Grid'; showPath = 'homepageSections.showFeaturedShops'; }
                      else if (key === 'nearbyShops') { label = 'Nearby Shops Section'; showPath = 'homepageSections.showNearbyShops'; }
                      else if (key === 'nearbyDiscovery') { label = 'Dynamic Discovery Feed'; showPath = 'homepageSections.showNearbyFeed'; }
                      else if (key === 'testimonials') { label = 'Customer Testimonials Slider'; showPath = 'homepageSections.showTestimonials'; }
                      else if (key === 'offers') { label = 'Offers & Coupon Banners'; showPath = 'homepageSections.showOffers'; }
                      else if (key === 'sellerCta') { label = 'Seller Registration CTA'; showPath = 'homepageSections.showSellerCta'; }

                      const isEnabled = showPath ? !!g(showPath) : true;

                      return (
                        <div key={key} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 20px', border: '1px solid var(--border)', borderRadius: 12,
                          background: isEnabled ? 'var(--surface-2)' : 'rgba(0,0,0,0.02)',
                          opacity: isEnabled ? 1 : 0.65
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--border)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                              {i + 1}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {showPath && (
                              <Toggle label={isEnabled ? 'Active' : 'Disabled'} checked={isEnabled} onChange={() => set(showPath, !g(showPath))} />
                            )}
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button type="button" onClick={() => moveSection(i, 'up')} disabled={i === 0}
                                style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', opacity: i === 0 ? 0.3 : 1 }}>
                                <ChevronUp size={16} />
                              </button>
                              <button type="button" onClick={() => moveSection(i, 'down')} disabled={i === (form.homepageSectionsOrder || []).length - 1}
                                style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', opacity: i === (form.homepageSectionsOrder || []).length - 1 ? 0.3 : 1 }}>
                                <ChevronDown size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {sectionTitle('Homepage Header Controls')}
                  <div style={gridStyle}>
                    <Field label="Featured Products Eyebrow"><Input name="featuredProductsHeader.eyebrow" value={g('featuredProductsHeader.eyebrow')} onChange={handleChange} /></Field>
                    <Field label="Featured Products Title"><Input name="featuredProductsHeader.title" value={g('featuredProductsHeader.title')} onChange={handleChange} /></Field>
                  </div>
                  <Field label="Featured Products Copy"><Textarea name="featuredProductsHeader.copy" value={g('featuredProductsHeader.copy')} onChange={handleChange} /></Field>

                  <div style={gridStyle} className="mt-4">
                    <Field label="New Arrivals Eyebrow"><Input name="newArrivalsHeader.eyebrow" value={g('newArrivalsHeader.eyebrow')} onChange={handleChange} /></Field>
                    <Field label="New Arrivals Title"><Input name="newArrivalsHeader.title" value={g('newArrivalsHeader.title')} onChange={handleChange} /></Field>
                  </div>
                  <Field label="New Arrivals Copy"><Textarea name="newArrivalsHeader.copy" value={g('newArrivalsHeader.copy')} onChange={handleChange} /></Field>

                  <div style={gridStyle} className="mt-4">
                    <Field label="Boutique Discovery Eyebrow"><Input name="featuredShopsHeader.eyebrow" value={g('featuredShopsHeader.eyebrow')} onChange={handleChange} /></Field>
                    <Field label="Boutique Discovery Title"><Input name="featuredShopsHeader.title" value={g('featuredShopsHeader.title')} onChange={handleChange} /></Field>
                  </div>
                  <Field label="Boutique Discovery Copy"><Textarea name="featuredShopsHeader.copy" value={g('featuredShopsHeader.copy')} onChange={handleChange} /></Field>

                  <div style={gridStyle} className="mt-4">
                    <Field label="Categories Section Eyebrow"><Input name="categoriesHeader.eyebrow" value={g('categoriesHeader.eyebrow')} onChange={handleChange} /></Field>
                    <Field label="Categories Section Title"><Input name="categoriesHeader.title" value={g('categoriesHeader.title')} onChange={handleChange} /></Field>
                  </div>
                </div>
              )}

              {/* BRANDING */}
              {activeTab === 'branding' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {sectionTitle('Site Identity')}
                  <div style={gridStyle}>
                    <Field label="Site Name"><Input name="siteName" value={g('siteName')} onChange={handleChange} /></Field>
                    <Field label="Short Tagline"><Input name="siteTagline" value={g('siteTagline')} onChange={handleChange} placeholder="Fashion Marketplace" /></Field>
                    <Field label="Descriptor" hint="Used in hero/SEO"><Input name="siteDescriptor" value={g('siteDescriptor')} onChange={handleChange} placeholder="Hyperlocal Fashion Marketplace" /></Field>
                  </div>

                  {sectionTitle('Typography & Fonts')}
                  <Field label="Typography Font Family" hint="Select a premium Google Font family applied sitewide">
                    <select className="input" name="typographyFont" value={g('typographyFont') || 'Outfit'} onChange={handleChange} style={{ height: 42, padding: '0 12px', borderRadius: 8, fontSize: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                      <option value="Outfit">Outfit (Clean, Modern, Geometric)</option>
                      <option value="Inter">Inter (Professional UI Standard)</option>
                      <option value="Montserrat">Montserrat (Bold, Elegant, Contemporary)</option>
                      <option value="Lora">Lora (Premium Serif Accent)</option>
                      <option value="Cormorant Garamond">Cormorant Garamond (High-Fashion Garamond Serif)</option>
                      <option value="Playfair Display">Playfair Display (Luxury Serif Header)</option>
                      <option value="Roboto">Roboto (Clean Sans Serif)</option>
                    </select>
                  </Field>

                  {sectionTitle('Logo & Favicon')}
                  <div style={gridStyle}>
                    <Field label="Logo" hint="Upload new or keep existing">
                      {form.logo && !logoFile && <img src={form.logo} alt="Logo" style={{ height: 40, borderRadius: 8, marginBottom: 8, background: '#f1f5f9', padding: 4 }} />}
                      <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="input" style={{ padding: '8px 12px' }} />
                    </Field>
                    <Field label="Favicon" hint="Upload new or keep existing">
                      {form.favicon && !faviconFile && <img src={form.favicon} alt="Favicon" style={{ height: 32, borderRadius: 6, marginBottom: 8, background: '#f1f5f9', padding: 4 }} />}
                      <input type="file" accept="image/*" onChange={e => setFaviconFile(e.target.files[0])} className="input" style={{ padding: '8px 12px' }} />
                    </Field>
                  </div>

                  {sectionTitle('Platform Initial Loader')}
                  <div style={gridStyle}>
                    <Field label="Loader Text Messaging" hint="Custom text displayed on initial load"><Input name="loadingText" value={g('loadingText')} onChange={handleChange} placeholder="Loading Curated Fashion..." /></Field>
                    <Field label="Loader Screen Background Color">
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input type="color" name="loadingBgColor" value={g('loadingBgColor') || '#ffffff'} onChange={handleChange}
                          style={{ width: 44, height: 44, padding: 2, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'var(--surface-2)' }} />
                        <Input type="text" name="loadingBgColor" value={g('loadingBgColor') || ''} onChange={handleChange} style={{ flex: 1 }} placeholder="#ffffff" />
                      </div>
                    </Field>
                  </div>

                  {sectionTitle('Footer')}
                  <Field label="Footer Tagline"><Input name="footerTagline" value={g('footerTagline')} onChange={handleChange} /></Field>
                  <Field label="Footer Copyright" hint="Use {year} for dynamic year. Leave blank for auto."><Input name="footerCopyright" value={g('footerCopyright')} onChange={handleChange} placeholder="© {year} NearByDress. All rights reserved." /></Field>
                </div>
              )}

              {/* COLORS */}
              {activeTab === 'colors' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {sectionTitle('Brand Colors')}
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Colors are applied as CSS custom properties globally across the entire frontend.</p>
                  <div style={gridStyle}>
                    <ColorField label="Primary Color" name="primaryColor" value={g('primaryColor')} onChange={handleChange} />
                    <ColorField label="Secondary / Accent Color" name="secondaryColor" value={g('secondaryColor')} onChange={handleChange} />
                    <ColorField label="Accent 2 Color" name="accentColor" value={g('accentColor')} onChange={handleChange} />
                    <ColorField label="Primary Hover Color" name="hoverColor" value={g('hoverColor')} onChange={handleChange} />
                  </div>
                </div>
              )}

              {/* CONTACT */}
              {activeTab === 'contact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {sectionTitle('Contact Information')}
                  <div style={gridStyle}>
                    <Field label="Support Email"><Input type="email" name="contactEmail" value={g('contactEmail')} onChange={handleChange} /></Field>
                    <Field label="Contact Phone"><Input type="tel" name="contactPhone" value={g('contactPhone')} onChange={handleChange} /></Field>
                    <Field label="Support Label" hint="Button/link label"><Input name="supportLabel" value={g('supportLabel')} onChange={handleChange} /></Field>
                    <Field label="Business Address" hint="Optional — shown in footer if set"><Input name="address" value={g('address')} onChange={handleChange} /></Field>
                  </div>
                </div>
              )}

              {/* SEO */}
              {activeTab === 'seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionTitle('SEO & Schema Configuration')}
                  
                  {/* Homepage SEO */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, background: 'var(--surface-2)' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>1. Homepage Meta &amp; Social Cards</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <Field label="Homepage Meta Title" hint="Primary title tag for browser and search bots"><Input name="seo.homeTitle" value={g('seo.homeTitle')} onChange={handleChange} /></Field>
                      <Field label="Homepage Meta Description" hint="Keep under 155 characters for snippet optimization"><Textarea name="seo.homeDescription" value={g('seo.homeDescription')} onChange={handleChange} /></Field>
                      <Field label="Homepage Keywords" hint="Comma-separated search phrases"><Input name="seo.homeKeywords" value={g('seo.homeKeywords')} onChange={handleChange} /></Field>
                      <Field label="Default OpenGraph (OG) Image URL" hint="Landscape card image used during social previews"><Input name="seo.ogImage" value={g('seo.ogImage')} onChange={handleChange} placeholder="https://..." /></Field>
                    </div>
                  </div>

                  {/* Twitter Cards */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, background: 'var(--surface-2)' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>2. Twitter Metadata (X Cards)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                      <Field label="Twitter Card Type"><Input name="seo.twitterCard" value={g('seo.twitterCard')} onChange={handleChange} placeholder="summary_large_image" /></Field>
                      <Field label="Twitter Site Profile"><Input name="seo.twitterSite" value={g('seo.twitterSite')} onChange={handleChange} placeholder="@nearbydress" /></Field>
                      <Field label="Twitter Creator Profile"><Input name="seo.twitterCreator" value={g('seo.twitterCreator')} onChange={handleChange} placeholder="@nearbydress" /></Field>
                    </div>
                  </div>

                  {/* Page overrides */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, background: 'var(--surface-2)' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>3. Page-Specific Meta Defaults</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <Field label="Products Page Meta Title"><Input name="seo.productsTitle" value={g('seo.productsTitle')} onChange={handleChange} /></Field>
                      <Field label="Products Page Meta Description"><Textarea name="seo.productsDescription" value={g('seo.productsDescription')} onChange={handleChange} /></Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Shops Page Meta Title"><Input name="seo.shopsTitle" value={g('seo.shopsTitle')} onChange={handleChange} /></Field>
                      <Field label="Shops Page Meta Description"><Textarea name="seo.shopsDescription" value={g('seo.shopsDescription')} onChange={handleChange} /></Field>
                    </div>
                  </div>

                  {/* Organization Schema */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, background: 'var(--surface-2)' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>4. Structured JSON-LD Organization Data</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Organization Brand Name"><Input name="seo.organizationName" value={g('seo.organizationName')} onChange={handleChange} placeholder="NearByDress" /></Field>
                      <Field label="Organization Logo URL"><Input name="seo.organizationLogo" value={g('seo.organizationLogo')} onChange={handleChange} placeholder="https://..." /></Field>
                    </div>
                  </div>

                  {/* Local business / Geo SEO */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, background: 'var(--surface-2)' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>5. Geo-SEO / Local Target Settings</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <Field label="Street Address"><Input name="seo.localBusinessStreetAddress" value={g('seo.localBusinessStreetAddress')} onChange={handleChange} placeholder="e.g. 12, Park Street" /></Field>
                      <Field label="Locality / City"><Input name="seo.localBusinessLocality" value={g('seo.localBusinessLocality')} onChange={handleChange} placeholder="e.g. Kolkata" /></Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                      <Field label="Region / State"><Input name="seo.localBusinessRegion" value={g('seo.localBusinessRegion')} onChange={handleChange} placeholder="e.g. West Bengal" /></Field>
                      <Field label="Postal / Pincode"><Input name="seo.localBusinessPostalCode" value={g('seo.localBusinessPostalCode')} onChange={handleChange} placeholder="e.g. 700016" /></Field>
                      <Field label="Country Code"><Input name="seo.localBusinessCountry" value={g('seo.localBusinessCountry')} onChange={handleChange} placeholder="IN" /></Field>
                    </div>
                  </div>
                </div>
              )}

              {/* WHATSAPP */}
              {activeTab === 'whatsapp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {sectionTitle('WhatsApp Configuration')}
                  <Field label="Admin WhatsApp Number" hint="E.164 format without + e.g. 918167827523 — NEVER displayed in UI"><Input name="whatsapp.adminNumber" value={g('whatsapp.adminNumber')} onChange={handleChange} placeholder="918167827523" /></Field>
                  <Field label="Default Support Message" hint="Used when buyer clicks Support button"><Textarea name="whatsapp.supportMessage" value={g('whatsapp.supportMessage')} onChange={handleChange} /></Field>
                  <Field label="Order Message Prefix" hint="First line of every auto-generated order message"><Input name="whatsapp.orderPrefix" value={g('whatsapp.orderPrefix')} onChange={handleChange} placeholder="🛍️ New Order via NearByDress" /></Field>
                  <Field label="Order Greeting Intro Template" hint="Greeting text right before customer details"><Input name="whatsapp.orderIntro" value={g('whatsapp.orderIntro')} onChange={handleChange} placeholder="Hello NearByDress Admin Team," /></Field>
                  <Field label="Order Closing Outro Template" hint="Closing text right after product details"><Input name="whatsapp.orderOutro" value={g('whatsapp.orderOutro')} onChange={handleChange} placeholder="Please confirm availability." /></Field>
                </div>
              )}

              {/* PAGE CMS BUILDER */}
              {activeTab === 'cms' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionTitle('Enterprise Page CMS Builder')}
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Edit the public content pages (About Us, Privacy Policy, Terms, FAQ, Help Center) visually. You can also create brand-new custom content rails that integrate into the store dynamically.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {(form.customPages || []).map((page, index) => (
                      <div key={page.slug || index} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, background: 'var(--surface-2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: 'var(--border)', padding: '2px 8px', borderRadius: 4, color: 'var(--text-muted)' }}>
                              slug: {page.slug}
                            </span>
                            <a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                              View Live Page ↗
                            </a>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Toggle
                              label={page.isActive ? 'Active' : 'Disabled'}
                              checked={!!page.isActive}
                              onChange={() => {
                                const updated = [...(form.customPages || [])];
                                updated[index] = { ...updated[index], isActive: !updated[index].isActive };
                                setForm(prev => ({ ...prev, customPages: updated }));
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (form.customPages || []).filter((_, i) => i !== index);
                                setForm(prev => ({ ...prev, customPages: updated }));
                                toast.success('Page deleted from local draft. Save settings to persist.');
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                              title="Delete Page"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <Field label="Page Title">
                            <Input
                              value={page.title || ''}
                              onChange={(e) => {
                                const updated = [...(form.customPages || [])];
                                updated[index] = { ...updated[index], title: e.target.value };
                                setForm(prev => ({ ...prev, customPages: updated }));
                              }}
                              placeholder="e.g. Terms of Service"
                            />
                          </Field>

                          <Field label="Page Content (Supports paragraph breaks)" hint="Text content for this page">
                            <textarea
                              className="input"
                              rows={8}
                              style={{ fontSize: 14, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, padding: '10px 12px' }}
                              value={page.content || ''}
                              onChange={(e) => {
                                const updated = [...(form.customPages || [])];
                                updated[index] = { ...updated[index], content: e.target.value };
                                setForm(prev => ({ ...prev, customPages: updated }));
                              }}
                              placeholder="Type markdown or text paragraphs here..."
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      const slug = prompt('Enter page slug (lowercase, url-safe e.g. sizing-guide):');
                      if (!slug) return;
                      const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                      if ((form.customPages || []).some(p => p.slug === formattedSlug)) {
                        alert('A page with this slug already exists.');
                        return;
                      }
                      const title = prompt('Enter page title:');
                      if (!title) return;

                      const updated = [...(form.customPages || []), { slug: formattedSlug, title, content: 'Write content here...', isActive: true }];
                      setForm(prev => ({ ...prev, customPages: updated }));
                      toast.success(`Page "${title}" added as draft. Save settings to persist.`);
                    }}
                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
                  >
                    <Plus size={16} /> Add Custom CMS Page
                  </button>
                </div>
              )}

              {/* HERO BANNER */}
              {activeTab === 'hero' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {sectionTitle('Hero Section Texts')}
                  <div style={gridStyle}>
                    <Field label="Eyebrow Text"><Input name="heroBanner.eyebrow" value={g('heroBanner.eyebrow')} onChange={handleChange} /></Field>
                    <Field label="Primary CTA Label"><Input name="heroBanner.ctaPrimary" value={g('heroBanner.ctaPrimary')} onChange={handleChange} /></Field>
                    <Field label="Secondary CTA Label"><Input name="heroBanner.ctaSecondary" value={g('heroBanner.ctaSecondary')} onChange={handleChange} /></Field>
                  </div>
                  <Field label="Title" hint="Use \\n for line break"><Input name="heroBanner.title" value={g('heroBanner.title')} onChange={handleChange} /></Field>
                  <Field label="Subtitle / Copy"><Textarea name="heroBanner.subtitle" value={g('heroBanner.subtitle')} onChange={handleChange} /></Field>
                  {sectionTitle('Stats')}
                  {(form.heroBanner?.stats || []).map((stat, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                      <Field label={`Stat ${i + 1} Value`}><Input value={stat.value || ''} onChange={e => handleStat(i, 'value', e.target.value)} placeholder="500+" /></Field>
                      <Field label="Label"><Input value={stat.label || ''} onChange={e => handleStat(i, 'label', e.target.value)} placeholder="Local shops" /></Field>
                    </div>
                  ))}
                </div>
              )}

              {/* CAMPAIGNS */}
              {activeTab === 'campaigns' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionTitle('Homepage Campaign Cards')}
                  {(form.campaigns || []).map((c, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative' }}>
                      <button type="button" onClick={() => removeCampaign(i)}
                        style={{ position: 'absolute', top: 12, right: 12, background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Title"><Input value={c.title || ''} onChange={e => handleCampaign(i, 'title', e.target.value)} /></Field>
                        <Field label="Link (to)"><Input value={c.to || ''} onChange={e => handleCampaign(i, 'to', e.target.value)} placeholder="/products?search=party" /></Field>
                        <Field label="Image URL"><Input value={c.image || ''} onChange={e => handleCampaign(i, 'image', e.target.value)} placeholder="https://..." /></Field>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <Field label="Copy"><Textarea value={c.copy || ''} onChange={e => handleCampaign(i, 'copy', e.target.value)} rows={2} /></Field>
                      </div>
                      {c.image && <img src={c.image} alt="" style={{ height: 80, borderRadius: 8, marginTop: 12, objectFit: 'cover', width: '100%' }} />}
                    </div>
                  ))}
                  {(form.campaigns || []).length < 6 && (
                    <button type="button" onClick={addCampaign}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(124,58,237,0.08)', border: '1.5px dashed var(--primary)', borderRadius: 10, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                      <Plus size={16} /> Add Campaign Card
                    </button>
                  )}
                </div>
              )}

              {/* MOODS SECTION */}
              {activeTab === 'mood' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionTitle('Mood & Occasion Collections Settings')}
                  <Field label="Kicker Eyebrow"><Input name="moodSection.kicker" value={g('moodSection.kicker')} onChange={handleChange} /></Field>
                  <Field label="Section Title"><Input name="moodSection.title" value={g('moodSection.title')} onChange={handleChange} /></Field>
                  <Field label="Section Subtitle Copy"><Textarea name="moodSection.copy" value={g('moodSection.copy')} onChange={handleChange} /></Field>
                  <div style={gridStyle}>
                    <Field label="Collection CTA Button Label"><Input name="moodSection.buttonLabel" value={g('moodSection.buttonLabel')} onChange={handleChange} /></Field>
                    <Field label="Collection CTA Button Link"><Input name="moodSection.buttonLink" value={g('moodSection.buttonLink')} onChange={handleChange} /></Field>
                  </div>

                  {sectionTitle('Mood Cards List')}
                  {(form.moodSection?.moods || []).map((m, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative' }}>
                      <button type="button" onClick={() => removeMood(i)}
                        style={{ position: 'absolute', top: 12, right: 12, background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: 14 }}>
                        <Field label="Lucide Icon" hint="e.g. Sparkles, Heart, Sun"><Input value={m.icon || ''} onChange={e => handleMood(i, 'icon', e.target.value)} /></Field>
                        <Field label="Title"><Input value={m.title || ''} onChange={e => handleMood(i, 'title', e.target.value)} /></Field>
                        <Field label="Target Link"><Input value={m.to || ''} onChange={e => handleMood(i, 'to', e.target.value)} /></Field>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <Field label="Card Description"><Input value={m.copy || ''} onChange={e => handleMood(i, 'copy', e.target.value)} /></Field>
                      </div>
                    </div>
                  ))}
                  {(form.moodSection?.moods || []).length < 8 && (
                    <button type="button" onClick={addMood}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(124,58,237,0.08)', border: '1.5px dashed var(--primary)', borderRadius: 10, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                      <Plus size={16} /> Add Mood Card
                    </button>
                  )}
                </div>
              )}

              {/* FEATURES SECTION */}
              {activeTab === 'features' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionTitle('Features Section settings')}
                  <div style={gridStyle}>
                    <Field label="Section Eyebrow"><Input name="featuresSection.eyebrow" value={g('featuresSection.eyebrow')} onChange={handleChange} /></Field>
                    <Field label="Section Title"><Input name="featuresSection.title" value={g('featuresSection.title')} onChange={handleChange} /></Field>
                  </div>

                  {sectionTitle('Features Cards List')}
                  {(form.featuresSection?.features || []).map((f, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative' }}>
                      <button type="button" onClick={() => removeFeature(i)}
                        style={{ position: 'absolute', top: 12, right: 12, background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                        <Field label="Lucide Icon" hint="e.g. ShieldCheck, MessageCircle"><Input value={f.icon || ''} onChange={e => handleFeature(i, 'icon', e.target.value)} /></Field>
                        <Field label="Title"><Input value={f.title || ''} onChange={e => handleFeature(i, 'title', e.target.value)} /></Field>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <Field label="Description"><Input value={f.desc || ''} onChange={e => handleFeature(i, 'desc', e.target.value)} /></Field>
                      </div>
                    </div>
                  ))}
                  {(form.featuresSection?.features || []).length < 8 && (
                    <button type="button" onClick={addFeature}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(124,58,237,0.08)', border: '1.5px dashed var(--primary)', borderRadius: 10, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                      <Plus size={16} /> Add Feature Card
                    </button>
                  )}
                </div>
              )}

              {/* TESTIMONIALS */}
              {activeTab === 'testimonials' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionTitle('Testimonials Settings')}
                  {(form.testimonials || []).map((t, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative' }}>
                      <button type="button" onClick={() => removeTestimonial(i)}
                        style={{ position: 'absolute', top: 12, right: 12, background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Author Name"><Input value={t.author || ''} onChange={e => handleTestimonial(i, 'author', e.target.value)} /></Field>
                        <Field label="Role / Label"><Input value={t.role || ''} onChange={e => handleTestimonial(i, 'role', e.target.value)} placeholder="Verified Buyer" /></Field>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <Field label="Quote Text"><Textarea value={t.quote || ''} onChange={e => handleTestimonial(i, 'quote', e.target.value)} rows={2} /></Field>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addTestimonial}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(124,58,237,0.08)', border: '1.5px dashed var(--primary)', borderRadius: 10, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                    <Plus size={16} /> Add Testimonial Card
                  </button>
                </div>
              )}

              {/* OFFERS & COUPONS */}
              {activeTab === 'offers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionTitle('Offers & Discount Coupon Banners')}
                  {(form.offers || []).map((o, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative' }}>
                      <button type="button" onClick={() => removeOffer(i)}
                        style={{ position: 'absolute', top: 12, right: 12, background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
                        <Field label="Offer Title"><Input value={o.title || ''} onChange={e => handleOffer(i, 'title', e.target.value)} /></Field>
                        <Field label="Coupon Code"><Input value={o.code || ''} onChange={e => handleOffer(i, 'code', e.target.value)} placeholder="WEL50" /></Field>
                        <Field label="Discount Badge Text"><Input value={o.discount || ''} onChange={e => handleOffer(i, 'discount', e.target.value)} placeholder="20% OFF" /></Field>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                        <Field label="Background Image URL"><Input value={o.bgImage || ''} onChange={e => handleOffer(i, 'bgImage', e.target.value)} placeholder="https://..." /></Field>
                        <Field label="Redirect Link"><Input value={o.link || ''} onChange={e => handleOffer(i, 'link', e.target.value)} placeholder="/products" /></Field>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <Field label="Description / Details Copy"><Textarea value={o.copy || ''} onChange={e => handleOffer(i, 'copy', e.target.value)} rows={2} /></Field>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addOffer}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(124,58,237,0.08)', border: '1.5px dashed var(--primary)', borderRadius: 10, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                    <Plus size={16} /> Add Offer Banner Card
                  </button>
                </div>
              )}

              {/* ANNOUNCEMENT BAR */}
              {activeTab === 'announcement' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {sectionTitle('Announcement Bar')}
                  <Toggle label="Enable Announcement Bar" checked={!!g('announcementBar.enabled')}
                    onChange={() => set('announcementBar.enabled', !g('announcementBar.enabled'))} />
                  <Field label="Announcement Text"><Input name="announcementBar.text" value={g('announcementBar.text')} onChange={handleChange} placeholder="🎉 Free shipping on orders over ₹999!" /></Field>
                  <div style={gridStyle}>
                    <ColorField label="Background Color" name="announcementBar.color" value={g('announcementBar.color')} onChange={handleChange} />
                    <Field label="Link URL (optional)" hint="Clicking text opens this link"><Input name="announcementBar.link" value={g('announcementBar.link')} onChange={handleChange} placeholder="https://..." /></Field>
                  </div>
                  {g('announcementBar.enabled') && g('announcementBar.text') && (
                    <div style={{ background: g('announcementBar.color') || '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 500 }}>
                      Preview: {g('announcementBar.text')}
                    </div>
                  )}
                </div>
              )}

              {/* LOCATION */}
              {activeTab === 'location' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionTitle('Location & Radius Defaults')}
                  <div style={gridStyle}>
                    <Field label="Default Pincode" hint="Fallback when user hasn't set location"><Input name="locationDefaults.defaultPincode" value={g('locationDefaults.defaultPincode')} onChange={handleChange} placeholder="560001" /></Field>
                    <Field label="Default City"><Input name="locationDefaults.defaultCity" value={g('locationDefaults.defaultCity')} onChange={handleChange} placeholder="Bengaluru" /></Field>
                    <Field label="Default State"><Input name="locationDefaults.defaultState" value={g('locationDefaults.defaultState')} onChange={handleChange} placeholder="Karnataka" /></Field>
                    <Field label="Default Radius (km)" hint="Nearby shop search radius"><Input type="number" min={1} max={200} name="locationDefaults.defaultRadius" value={g('locationDefaults.defaultRadius')} onChange={handleChange} /></Field>
                    <Field label="Max Radius (km)" hint="Maximum allowed search radius"><Input type="number" min={5} max={500} name="locationDefaults.maxRadius" value={g('locationDefaults.maxRadius')} onChange={handleChange} /></Field>
                  </div>

                  {sectionTitle('Operational Boundaries & Serviceable Areas')}
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Define cities and specific delivery pincodes your platform services. Users outside active service boundaries will receive warnings.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
                    {(form.locationDefaults?.serviceableCities || []).map((city, idx) => (
                      <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative', background: 'var(--surface-2)' }}>
                        <button type="button" onClick={() => {
                          const list = [...(form.locationDefaults?.serviceableCities || [])].filter((_, i) => i !== idx);
                          set('locationDefaults.serviceableCities', list);
                        }}
                          style={{ position: 'absolute', top: 12, right: 12, background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <Trash2 size={12} /> Remove Area
                        </button>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                          <Field label="City Name"><Input value={city.name || ''} onChange={e => {
                            const list = [...(form.locationDefaults?.serviceableCities || [])];
                            list[idx] = { ...list[idx], name: e.target.value };
                            set('locationDefaults.serviceableCities', list);
                          }} placeholder="e.g. Kolkata" /></Field>
                          
                          <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 26 }}>
                            <Toggle label="Active Service Zone" checked={!!city.isActive} onChange={() => {
                              const list = [...(form.locationDefaults?.serviceableCities || [])];
                              list[idx] = { ...list[idx], isActive: !city.isActive };
                              set('locationDefaults.serviceableCities', list);
                            }} />
                          </div>
                        </div>

                        <Field label="Serviceable Pincodes" hint="Comma-separated postal codes for hyper-local delivery validation">
                          <Input value={(city.pincodes || []).join(', ')} onChange={e => {
                            const list = [...(form.locationDefaults?.serviceableCities || [])];
                            const codes = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            list[idx] = { ...list[idx], pincodes: codes };
                            set('locationDefaults.serviceableCities', list);
                          }} placeholder="e.g. 700001, 700016, 700019" />
                        </Field>
                      </div>
                    ))}
                    
                    <button type="button" onClick={() => {
                      const list = [...(form.locationDefaults?.serviceableCities || [])];
                      list.push({ name: '', pincodes: [], isActive: true });
                      set('locationDefaults.serviceableCities', list);
                    }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(124,58,237,0.08)', border: '1.5px dashed var(--primary)', borderRadius: 10, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                      <Plus size={16} /> Add Serviceable City
                    </button>
                  </div>
                </div>
              )}

              {/* SELLER CTA */}
              {activeTab === 'sellercta' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {sectionTitle('Seller CTA Section')}
                  <div style={gridStyle}>
                    <Field label="Eyebrow"><Input name="sellerCta.eyebrow" value={g('sellerCta.eyebrow')} onChange={handleChange} /></Field>
                    <Field label="CTA Button Label"><Input name="sellerCta.ctaLabel" value={g('sellerCta.ctaLabel')} onChange={handleChange} /></Field>
                  </div>
                  <Field label="Title"><Input name="sellerCta.title" value={g('sellerCta.title')} onChange={handleChange} /></Field>
                  <Field label="Copy / Body Text"><Textarea name="sellerCta.copy" value={g('sellerCta.copy')} onChange={handleChange} /></Field>
                </div>
              )}

              {/* SOCIAL LINKS */}
              {activeTab === 'social' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {sectionTitle('Social Media Links')}
                  {[
                    ['socialLinks.facebook',  'Facebook URL'],
                    ['socialLinks.instagram', 'Instagram URL'],
                    ['socialLinks.twitter',   'Twitter / X URL'],
                    ['socialLinks.youtube',   'YouTube URL'],
                    ['socialLinks.pinterest', 'Pinterest URL'],
                  ].map(([name, label]) => (
                    <Field key={name} label={label}>
                      <Input name={name} value={g(name)} onChange={handleChange} placeholder="https://..." />
                    </Field>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 15, fontWeight: 700 }}>
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
