export const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about'},
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
  {
    name: 'More', href: '/blog', dropdown: [
      { name: 'Services', href: '/services' },
      // { name: 'Blog', href: '/blog' },
      { name: 'Get A Quote', href: '/quote' },
      { name: 'Locations', href: '/locations'}
    ],
  },
];
