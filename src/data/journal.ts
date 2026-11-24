// Journal entries — republished from kolkin.coffee (original author and date preserved).
export interface Article {
  slug: string;
  title: string;
  kicker: string;
  excerpt: string;
  author: string;
  date: string; // ISO
  readMinutes: number;
  tags: string[];
  originalUrl: string;
  body: { type: 'p' | 'h2' | 'quote' | 'list'; text?: string; cite?: string; items?: string[] }[];
}

export const articles: Article[] = [
  {
    slug: 'community-connections-episode-1',
    title: 'Where every cup tells a story',
    kicker: 'Kølkin Community Connections · Episode 1',
    excerpt: 'Our first Community Connections feature: USA Today bestselling author Kristy Cambron, who has written several of her novels at Kølkin.',
    author: 'Gary Almon',
    date: '2025-09-08',
    readMinutes: 3,
    tags: ['Coffee and Community', 'Southern Indiana Coffee', 'Kentuckiana Coffee'],
    originalUrl: 'https://kolkin.coffee/blogs/kolkin-community-where-every-cup-tells-a-story/kolkin-community-connections-episode-1-where-every-cup-tells-a-story',
    body: [
      { type: 'p', text: 'At Kolkin Coffee, we believe a cup of coffee is never <em>just</em> a drink. It’s fuel for creativity, a bridge for conversation, and a spark for community. That’s why we’re launching <strong>Kolkin Community Connections</strong> — a recurring spotlight on the incredible people who gather, create, and dream at Kolkin Coffee.' },
      { type: 'p', text: 'Our first feature is someone who knows all about weaving stories that inspire: <strong>Kristy Cambron</strong>, USA Today bestselling author.' },
      { type: 'h2', text: 'Coffee, creativity, and community' },
      { type: 'p', text: 'Kristy has spent countless hours at Kolkin Coffee in Jeffersonville, Indiana, brainstorming ideas and bringing novels to life. From her favorite writing spot near the kayaks in our shop, to endless cups of artisan roasts, Kolkin has been part of her journey for over a decade.' },
      { type: 'p', text: 'In August 2025, Kristy released her 11th novel, <em>The French Kitchen</em> — a stunning work of historical fiction set in WWII and post-war Paris, exploring Julia Child’s life before she became the culinary icon we know today.' },
      { type: 'p', text: 'For Kristy, coffee has been more than fuel. It’s been community.' },
      { type: 'quote', text: 'Everyone knows authors survive on coffee… and southern Indiana authors survive on Kolkin Coffee. I’ve written several of my novels here, and the encouragement of Gary, Lanette, and this community has been incredible. It took 12 years to hit the bestseller list — and Kolkin has been a dream defender every step of the way.', cite: 'Kristy Cambron' },
      { type: 'h2', text: 'Rooted in Kentuckiana' },
      { type: 'p', text: 'As Jeffersonville, Indiana’s only active coffee roaster, Kolkin Coffee is proud to be family-owned, veteran- and woman-led, and fueled by our love for community, the outdoors, and artisan craft. For more than 11 years, we’ve been serving Southern Indiana and Louisville, one cup at a time.' },
      { type: 'p', text: 'Now, with our roasting facility, online shop, and wholesale distribution, we’re expanding our reach to homes, cafés, and businesses across the United States — and soon, international waters.' },
      { type: 'h2', text: 'Writers, dreamers, and everyday adventurers' },
      { type: 'p', text: 'From bestselling authors to first-time novelists, from small business owners to neighbors just looking for their morning brew — Kolkin Coffee is about creating a space to pause, connect, and dream big.' },
      { type: 'p', text: 'That’s what <strong>Kolkin Community Connections</strong> is all about: spotlighting the people who make this place so special.' },
      { type: 'h2', text: 'Join the story' },
      { type: 'list', items: ['Stop by our shop in Jeffersonville, IN', 'Explore our artisan seasonal roasts online', 'Follow along as we share more Kolkin Community Connections — because every cup tells a story.'] },
    ],
  },
];
