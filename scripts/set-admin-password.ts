import { findUserByEmail, updateUser } from '../lib/db/data-store';
import { hashPassword } from '../lib/auth/password';

async function main() {
  const newPassword = process.argv[2];
  const targetEmail = process.argv[3] || 'admin@rajpowertech.com';

  if (!newPassword || newPassword.length < 6) {
    console.error('Usage: npx tsx scripts/set-admin-password.ts <new_password> [email]');
    console.error('Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  console.log(`Searching for user: ${targetEmail}...`);
  const user = await findUserByEmail(targetEmail);

  if (!user) {
    console.error(`Error: User with email ${targetEmail} not found in database.`);
    process.exit(1);
  }

  console.log(`User found (${user.name || user.email}, role: ${user.role}). Updating password...`);
  const passwordHash = await hashPassword(newPassword);
  const success = await updateUser(user.id, {
    passwordHash,
    updatedAt: new Date().toISOString(),
  });

  if (success) {
    console.log(` Successfully updated password for ${targetEmail}!`);
    console.log(`New password: ${newPassword}`);
  } else {
    console.error('Failed to update user password in database.');
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error setting admin password:', err);
  process.exit(1);
});
