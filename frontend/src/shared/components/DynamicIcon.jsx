import * as Icons from 'lucide-react';

/**
 * DynamicIcon.jsx
 * Dynamically resolves and renders a Lucide icon by string name.
 * Falls back gracefully to `Sparkles` if the icon is not found.
 */
const DynamicIcon = ({ name, size = 20, className, ...props }) => {
  const IconComponent = Icons[name] || Icons.Sparkles;
  return <IconComponent size={size} className={className} {...props} />;
};

export default DynamicIcon;
