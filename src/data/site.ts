// Verified business information — sourced from kolkin.coffee (Nov 2026 audit).
export const SHOP_DOMAIN = 'https://kolkin.coffee'; // Shopify storefront that owns cart + checkout
export const SITE_URL = 'https://kolkin.coffee';

export const business = {
  name: 'Kølkin Coffee',
  legalName: 'Kolkin Coffee',
  founded: '2014',
  phoneDisplay: '(812) 599-8410',
  phoneHref: 'tel:+18125998410',
  smsHref: 'sms:+18125998410',
  email: 'kolkincoffee@gmail.com',
  careersEmail: 'kolkincoffeeapply@gmail.com',
  address: {
    street: '2736 Charlestown Rd #5',
    city: 'New Albany',
    region: 'IN',
    postal: '47150',
    country: 'US',
  },
  mapsUrl: 'https://goo.gl/maps/CEpVe3ryjCwWJSQM8',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Kolkin+Coffee%2C+2736+Charlestown+Rd+%235%2C+New+Albany%2C+IN+47150',
  mapEmbed: 'https://maps.google.com/maps?q=Kolkin%20Coffee%20New%20Albany%20Indiana&t=m&z=15&output=embed&iwloc=near',
  // Hours in shop-local time (America/Indiana/Indianapolis). day: 0 = Sunday.
  hours: [
    { day: 0, label: 'Sunday', open: null, close: null },
    { day: 1, label: 'Monday', open: '06:30', close: '19:00' },
    { day: 2, label: 'Tuesday', open: '06:30', close: '19:00' },
    { day: 3, label: 'Wednesday', open: '06:30', close: '19:00' },
    { day: 4, label: 'Thursday', open: '06:30', close: '19:00' },
    { day: 5, label: 'Friday', open: '06:30', close: '19:00' },
    { day: 6, label: 'Saturday', open: '07:30', close: '19:00' },
  ] as { day: number; label: string; open: string | null; close: string | null }[],
  social: {
    instagram: 'https://www.instagram.com/kolkincoffee/',
    facebook: 'https://www.facebook.com/Kolkin-Coffee-1579204685698288/',
  },
  giftCardsUrl: 'https://squareup.com/gift/FD1K2A3GMNBYG/order',
  rangeMeUrl: 'https://www.rangeme.com',
  freeShippingThreshold: 30,
};

export const hoursSummary = [
  { days: 'Monday – Friday', time: '6:30 AM – 7 PM' },
  { days: 'Saturday', time: '7:30 AM – 7 PM' },
  { days: 'Sunday', time: 'Closed' },
];

export const nav = [
  { href: '/collections/coffee', label: 'Coffee' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/community', label: 'Community' },
  { href: '/wholesale', label: 'Wholesale' },
  { href: '/visit', label: 'Visit' },
];
