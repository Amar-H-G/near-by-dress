import { Link } from 'react-router-dom';

const CAMPAIGNS = [
  {
    title: 'Weekend statement pieces',
    copy: 'Elevated dresses, party-ready textures, and local boutique edits made for plans after sunset.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=82',
    to: '/products?search=party',
  },
  {
    title: 'Everyday essentials',
    copy: 'Clean layers, soft tailoring, and refined casuals from shops around you.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=82',
    to: '/products?search=casual',
  },
];

const CampaignSection = () => (
  <section className="luxury-section">
    <div className="container">
      <div className="luxury-section-header">
        <div>
          <span className="luxury-eyebrow">Fashion campaigns</span>
          <h2 className="luxury-title luxury-title-sm">Curated drops with marketplace depth</h2>
        </div>
        <p className="luxury-copy">Editorial-style shopping moments help customers discover products by occasion, mood, and style.</p>
      </div>

      <div className="fashion-campaign-grid">
        {CAMPAIGNS.map((campaign) => (
          <Link key={campaign.title} to={campaign.to} className="fashion-campaign-card">
            <img src={campaign.image} alt="" loading="lazy" />
            <div className="fashion-campaign-content">
              <h3>{campaign.title}</h3>
              <p>{campaign.copy}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CampaignSection;
