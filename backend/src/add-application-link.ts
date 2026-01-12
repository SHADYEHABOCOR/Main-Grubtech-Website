import db from './config/database.js';

console.log('Adding application_link column to job_vacancies table...');

try {
  // Check if column already exists
  const tableInfo = db.prepare('PRAGMA table_info(job_vacancies)').all() as any[];
  const hasApplicationLink = tableInfo.some(col => col.name === 'application_link');

  if (!hasApplicationLink) {
    db.prepare('ALTER TABLE job_vacancies ADD COLUMN application_link TEXT').run();
    console.log('✓ application_link column added successfully');
  } else {
    console.log('✓ application_link column already exists');
  }
} catch (error) {
  console.error('Error:', error);
}
