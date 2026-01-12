const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('./grubtech.db');

// Read all i18n files
const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/i18n/en.json'), 'utf8'));
const ar = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/i18n/ar.json'), 'utf8'));
const es = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/i18n/es.json'), 'utf8'));
const pt = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/i18n/pt.json'), 'utf8'));

// Clear existing content
db.prepare('DELETE FROM website_content').run();

const insertContent = db.prepare(`
  INSERT INTO website_content (section, content_en, content_ar, content_es, content_pt)
  VALUES (?, ?, ?, ?, ?)
`);

// Helper function to insert content
function insert(section, en_val, ar_val, es_val, pt_val) {
  insertContent.run(section, en_val, ar_val, es_val, pt_val);
}

console.log('Migrating i18n content to database...\n');

// HERO SECTION
console.log('✓ Hero Section');
insert('hero_headline', en.hero.headline, ar.hero.headline, es.hero.headline, pt.hero.headline);
insert('hero_subheading', en.hero.subheading, ar.hero.subheading, es.hero.subheading, pt.hero.subheading);
insert('hero_schedule_cta', en.hero.scheduleCTA, ar.hero.scheduleCTA, es.hero.scheduleCTA, pt.hero.scheduleCTA);
insert('hero_watch_cta', en.hero.watchCTA, ar.hero.watchCTA, es.hero.watchCTA, pt.hero.watchCTA);

// PROBLEMS SECTION
console.log('✓ Problems Section');
insert('problems_title', en.problems.title, ar.problems.title, es.problems.title, pt.problems.title);

// Problem cards
for (let i = 0; i < en.problems.cards.length; i++) {
  insert(
    `problems_card_${i + 1}_title`,
    en.problems.cards[i].title,
    ar.problems.cards[i].title,
    es.problems.cards[i].title,
    pt.problems.cards[i].title
  );
  insert(
    `problems_card_${i + 1}_description`,
    en.problems.cards[i].description,
    ar.problems.cards[i].description,
    es.problems.cards[i].description,
    pt.problems.cards[i].description
  );
}

// SOLUTIONS SECTION
console.log('✓ Solutions Section');
const solutions = ['gOnline', 'gOnlineLite', 'gKDS', 'gDispatch'];
solutions.forEach(solution => {
  const key = solution.charAt(0).toLowerCase() + solution.slice(1);
  insert(
    `solutions_${key}_title`,
    en.solutions[solution].title,
    ar.solutions[solution].title,
    es.solutions[solution].title,
    pt.solutions[solution].title
  );
  insert(
    `solutions_${key}_description`,
    en.solutions[solution].description,
    ar.solutions[solution].description,
    es.solutions[solution].description,
    pt.solutions[solution].description
  );
  insert(
    `solutions_${key}_cta`,
    en.solutions[solution].cta,
    ar.solutions[solution].cta,
    es.solutions[solution].cta,
    pt.solutions[solution].cta
  );

  // Features (stored as JSON array stringified)
  insert(
    `solutions_${key}_features`,
    JSON.stringify(en.solutions[solution].features),
    JSON.stringify(ar.solutions[solution].features),
    JSON.stringify(es.solutions[solution].features),
    JSON.stringify(pt.solutions[solution].features)
  );
});

// WHY GRUBTECH SECTION
console.log('✓ Why Grubtech Section');
insert('why_grubtech_title', en.whyGrubtech.title, ar.whyGrubtech.title, es.whyGrubtech.title, pt.whyGrubtech.title);

// Why Grubtech cards
for (let i = 0; i < en.whyGrubtech.cards.length; i++) {
  insert(
    `why_grubtech_card_${i + 1}_title`,
    en.whyGrubtech.cards[i].title,
    ar.whyGrubtech.cards[i].title,
    es.whyGrubtech.cards[i].title,
    pt.whyGrubtech.cards[i].title
  );
  insert(
    `why_grubtech_card_${i + 1}_description`,
    en.whyGrubtech.cards[i].description,
    ar.whyGrubtech.cards[i].description,
    es.whyGrubtech.cards[i].description,
    pt.whyGrubtech.cards[i].description
  );
}

// CTA SECTION
console.log('✓ CTA Section');
insert('cta_headline', en.cta.headline, ar.cta.headline, es.cta.headline, pt.cta.headline);
insert('cta_subheading', en.cta.subheading, ar.cta.subheading, es.cta.subheading, pt.cta.subheading);
insert('cta_button', en.cta.button, ar.cta.button, es.cta.button, pt.cta.button);

// FOOTER
console.log('✓ Footer');
insert('footer_copyright', en.footer.copyright, ar.footer.copyright, es.footer.copyright, pt.footer.copyright);

console.log('\n✅ Migration complete!');

// Show count
const count = db.prepare('SELECT COUNT(*) as count FROM website_content').get();
console.log(`Total content entries: ${count.count}\n`);

db.close();
