export const BUSINESS_INFO = {
  name: 'RAJ POWER TECH SERVICES',
  shortName: 'RPS',
  tagline: 'Trusted Power Backup & Energy Solutions Specialist',
  contactPerson: 'Mr. B. V. Raja Shekar Reddy',
  email: 'rpserviceshyd@gmail.com',
  phone: '93460 21289',
  phoneFormatted: '+91 93460 21289',
  phoneTel: '+919346021289',
  whatsappRaw: '9346021289',
  whatsappIntl: '919346021289',
  address: {
    plot: 'Plot No: 12A',
    colony: 'Vijaya Nagar Colony',
    landmark: 'Picket',
    city: 'Secunderabad',
    pincode: '500009',
    state: 'Telangana',
    country: 'India',
    full: 'Plot No:12A, Vijaya Nagar Colony, Picket, Secunderabad, Telangana - 500009, India.',
    mapsUrl: 'https://maps.google.com/maps?q=17.4532287%2C78.499837&z=17&hl=en',
    embedUrl: 'https://maps.google.com/maps?q=17.4532287,78.499837&hl=en&z=17&output=embed',
    coordinates: {
      lat: 17.4532287,
      lng: 78.499837,
    },
  },
  operatingTerritory: 'All Serviceable Regions, India',
  categories: [
    {
      id: 'inverters',
      name: 'Inverters',
      slug: 'inverters',
      description: 'Pure sine wave home & commercial inverters engineered for dependable continuous power during outages.',
      features: ['Pure Sine Wave Output', 'Smart Battery Management', 'Overload & Short Circuit Protection'],
      href: '/categories/inverters',
    },
    {
      id: 'batteries',
      name: 'Batteries',
      slug: 'batteries',
      description: 'High-cycle tubular & SMF inverter batteries built for severe climate conditions and deep discharge longevity.',
      features: ['Tall Tubular Heavy Duty Plates', 'Ultra Low Maintenance', 'Fast Recharge Technology'],
      href: '/categories/batteries',
    },
    {
      id: 'ups',
      name: 'UPS Systems',
      slug: 'ups',
      description: 'Zero-transfer line-interactive & online UPS systems safeguarding critical computers, servers, and medical equipment.',
      features: ['Zero Transfer Switching Time', 'Voltage Spike Suppression', 'Generator Compatibility'],
      href: '/categories/ups',
    },
  ],
} as const;

export const SOLUTIONS_LINKS = [
  {
    label: 'All Solutions & Products',
    slug: 'all',
    href: '/shop',
    description: 'Complete equipment lineup, combos, and custom capacity sizing',
  },
  {
    label: 'Inverters',
    slug: 'inverters',
    href: '/categories/inverters',
    description: 'Pure sine wave home & commercial inverters for continuous power',
  },
  {
    label: 'Batteries',
    slug: 'batteries',
    href: '/categories/batteries',
    description: 'High-cycle tubular & SMF batteries for deep discharge longevity',
  },
  {
    label: 'UPS Systems',
    slug: 'ups',
    href: '/categories/ups',
    description: 'Zero-transfer line-interactive & online UPS for critical devices',
  },
] as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Our Solutions', href: '/shop', hasDropdown: true },
  { label: 'Certifications', href: '/certifications' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
] as const;

