#!/usr/bin/env tsx

import readline from 'readline';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db, { initDatabase } from '../src/config/database.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSecurePassword(): string {
  // Generate a random 16-character password with uppercase, lowercase, numbers, and special chars
  const length = 16;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + special;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += special[crypto.randomInt(special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[crypto.randomInt(all.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function createAdmin() {
  console.log('\n=== Grubtech CMS - Admin User Creation ===\n');

  // Initialize database
  initDatabase();

  // Check if users already exist
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count > 0) {
    console.log('⚠️  Warning: Admin users already exist in the database.');
    const proceed = await question('Do you want to create another admin user? (yes/no): ');
    if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      rl.close();
      process.exit(0);
    }
  }

  // Get username
  const username = await question('Enter username/email: ');
  if (!username) {
    console.log('❌ Username is required.');
    rl.close();
    process.exit(1);
  }

  // Check if username already exists
  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (existingUser) {
    console.log(`❌ User "${username}" already exists.`);
    rl.close();
    process.exit(1);
  }

  // Ask for password option
  console.log('\nPassword Options:');
  console.log('1. Generate a secure random password');
  console.log('2. Enter your own password');

  const choice = await question('\nChoose option (1 or 2): ');

  let password: string;

  if (choice === '1') {
    password = generateSecurePassword();
    console.log('\n✅ Generated secure password:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\x1b[1m\x1b[32m${password}\x1b[0m`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Copy this password now! It will not be shown again.\n');

    const confirm = await question('Have you saved the password? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('Cancelled. Please run the script again when ready.');
      rl.close();
      process.exit(0);
    }
  } else if (choice === '2') {
    password = await question('Enter password (min 8 characters): ');

    if (password.length < 8) {
      console.log('❌ Password must be at least 8 characters long.');
      rl.close();
      process.exit(1);
    }

    // Validate password strength
    if (!/[A-Z]/.test(password)) {
      console.log('⚠️  Warning: Password should contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
      console.log('⚠️  Warning: Password should contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      console.log('⚠️  Warning: Password should contain at least one number.');
    }

    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match.');
      rl.close();
      process.exit(1);
    }
  } else {
    console.log('❌ Invalid choice.');
    rl.close();
    process.exit(1);
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert user
  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
    console.log('\n✅ Admin user created successfully!');
    console.log(`\nUsername: ${username}`);
    console.log('\nYou can now login at: http://localhost:5173/admin/login\n');
  } catch (error) {
    console.log('❌ Error creating user:', error);
    process.exit(1);
  }

  rl.close();
}

createAdmin().catch((error) => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
