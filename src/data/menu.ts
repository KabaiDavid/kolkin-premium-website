// Café menu — transcribed verbatim from kolkin.coffee/pages/menu (Nov 2026).
export interface MenuTable { kind: 'table'; title: string; note?: string; columns: string[]; rows: { name: string; desc?: string; prices: (string | null)[] }[] }
export interface MenuList { kind: 'list'; title: string; note?: string; items: { name: string; desc?: string; price?: string; extra?: string[] }[] }
export type MenuSection = MenuTable | MenuList;

export const menu: { group: string; sections: MenuSection[] }[] = [
  {
    group: 'Coffee',
    sections: [
      {
        kind: 'table', title: 'Hot coffee (drip)', columns: ['12oz', '16oz', '20oz'],
        rows: [
          { name: 'House Coffee', prices: ['3.04', '3.50', '4.11'] },
          { name: 'Special Cup (Seasonal)', prices: ['3.37', '3.97', '4.35'] },
          { name: 'Café au Lait', prices: ['4.02', '4.52', '5.23'] },
          { name: 'Americano', prices: ['4.02', '4.44', '4.95'] },
          { name: 'Red Eye', prices: ['4.41', '4.86', '5.42'] },
        ],
      },
      {
        kind: 'table', title: 'Lattes', columns: ['12oz', '16oz', '20oz'],
        rows: [{ name: 'Latte', prices: ['4.49', '5.19', '5.84'] }],
      },
      {
        kind: 'table', title: 'Traditional flavored lattes', note: 'Mocha, Alchemist, White Mocha, Black & White, Caramel Vanilla', columns: ['12oz', '16oz', '20oz', '24oz'],
        rows: [
          { name: 'Hot', prices: ['5.09', '5.65', '6.64', null] },
          { name: 'Iced', prices: ['5.09', null, null, '6.96'] },
        ],
      },
      {
        kind: 'table', title: 'Pour overs', columns: ['12oz', '16oz', '20oz'],
        rows: [
          { name: 'V-60', prices: ['4.02', '4.53', null] },
          { name: 'Chemex', prices: ['4.02', '4.53', '4.81'] },
        ],
      },
      {
        kind: 'table', title: 'Cold brew', columns: ['16oz', '24oz'],
        rows: [{ name: 'Cold Brew', prices: ['4.53', '5.42'] }],
      },
      {
        kind: 'table', title: 'Shakes', note: 'Blended, frappuccino-style — any traditional or signature flavor', columns: ['16oz', '24oz'],
        rows: [{ name: 'Shake', prices: ['6.45', '7.29'] }],
      },
    ],
  },
  {
    group: 'Signature lattes',
    sections: [
      {
        kind: 'list', title: 'Signature lattes', note: 'Hot 12oz $5.23 · 16oz $5.89 · 20oz $6.73 — Iced 16oz $5.89 · 24oz $6.96',
        items: [
          { name: 'Black Bear', desc: 'Mocha + Peppermint' },
          { name: 'Bee Sting', desc: 'Hot Honey + Cinnamon + Sweetened Condensed Milk' },
          { name: 'Camper', desc: 'Spiced Brown Sugar + Vanilla' },
          { name: 'Hiker', desc: 'Peppermint + Vanilla' },
          { name: 'Islander', desc: 'Coconut + Vanilla' },
          { name: 'Kayaker', desc: 'White Mocha + Blackberry' },
          { name: 'Maple Tree', desc: 'Caramel + Maple Syrup' },
          { name: 'Miele', desc: 'Raw Organic Honey + Cinnamon' },
          { name: 'Shaken Brown Bear', desc: 'Brown Sugar Shaken Espresso (iced only)' },
          { name: 'Spiced Willow Tree', desc: 'Chai Latte + Matcha Shot — priced as Matcha Latte sizes + $1.35' },
          { name: 'Woodsman', desc: 'Maple Syrup + Vanilla' },
        ],
      },
    ],
  },
  {
    group: 'Not coffee',
    sections: [
      {
        kind: 'table', title: 'Alternative drinks', columns: ['12oz', '16oz', '20oz', '24oz'],
        rows: [
          { name: 'Chai / Polar Bear (Hot)', prices: ['5.51', '6.03', '7.15', null] },
          { name: 'Chai / Polar Bear (Iced)', prices: [null, '6.03', '4.95', null] },
          { name: 'Hot Chocolate', prices: ['3.88', '4.49', '4.77', null] },
          { name: 'Loose Leaf Tea (Hot)', prices: ['3.46', '3.69', '4.07', null] },
          { name: 'Iced Tea', prices: [null, '3.69', null, '4.11'] },
          { name: 'Chocolate Milk', prices: [null, '4.16', null, '4.30'] },
          { name: 'Lemonade (Seasonal)', prices: [null, '3.18', null, '3.74'] },
          { name: 'Iced Sweet Peach Tea (Seasonal)', prices: [null, '4.16', null, '4.67'] },
        ],
      },
      {
        kind: 'table', title: 'Matcha', columns: ['12oz', '16oz', '20oz', '24oz'],
        rows: [
          { name: 'Hot Matcha Latte', prices: ['5.09', '5.61', '6.12', null] },
          { name: 'Iced Matcha Latte', prices: [null, '5.61', null, '6.26'] },
          { name: 'Matcha Shake', prices: [null, '6.36', null, '6.74'] },
          { name: 'Mango Matcha', prices: [null, '6.87', null, null] },
          { name: 'Monkey Matcha', prices: [null, '6.97', null, null] },
        ],
      },
      {
        kind: 'table', title: 'Smoothies', note: 'Strawberry, Strawberry Banana, Piña Colada', columns: ['16oz', '24oz'],
        rows: [{ name: 'Smoothie', prices: ['6.36', '7.34'] }],
      },
      {
        kind: 'table', title: 'Italian sodas', note: 'Raspberry, Strawberry, Blackberry, Lavender, Tiger’s Blood (Strawberry + Coconut)', columns: ['16oz', '24oz'],
        rows: [{ name: 'Italian Soda', prices: ['3.97', '4.53'] }],
      },
      {
        kind: 'list', title: 'Extras',
        items: [
          { name: 'Extra Espresso Shot', price: '1.35' },
          { name: 'Extra Syrup', price: '1.00' },
          { name: '1-Pump Syrup', price: '0.20' },
          { name: 'Whipped Cream', price: '0.75' },
          { name: 'Milk alternatives', desc: 'Almond / Soy / Oat / Coconut', price: '1.10' },
        ],
      },
    ],
  },
  {
    group: 'Food',
    sections: [
      {
        kind: 'list', title: 'From the kitchen', note: 'All sandwiches are made in house.',
        items: [
          { name: 'Veggie, Egg & Cheese English Muffin', desc: 'With Kølkin breakfast sauce', price: '5.25', extra: ['+ Small house coffee — $7.00'] },
          { name: 'Ham, Egg & Cheese Croissant', desc: 'With Kølkin breakfast sauce', price: '6.00', extra: ['+ Small house coffee — $7.50'] },
          { name: 'Sausage, Egg & Cheese English Muffin', desc: 'With Kølkin breakfast sauce', price: '5.25', extra: ['+ Small house coffee — $7.00'] },
          { name: 'Bacon, Egg & Cheese Bagel', desc: 'With hot honey + maple glaze', price: '8.00', extra: ['+ Small house coffee — $9.50'] },
          { name: 'Turkey & Swiss Croissant', desc: 'With pesto', price: '8.00', extra: ['+ Chips — $9.00', '+ Chips and bottled drink — $10.50'] },
          { name: 'Avocado Toast', desc: 'With roasted tomatoes, feta cheese & balsamic glaze', price: '8.00' },
        ],
      },
      {
        kind: 'list', title: 'Bakery',
        items: [
          { name: 'Bagels', price: '3.00' },
          { name: 'Chocolate Croissants', price: '3.50' },
          { name: 'Muffins', desc: 'Chocolate, Apple Pecan, Blueberry' },
          { name: 'Scone of the Day', price: '3.75' },
          { name: 'Cinnamon Roll', price: '3.50' },
          { name: 'Lenka Bar', price: '3.25' },
        ],
      },
    ],
  },
];
