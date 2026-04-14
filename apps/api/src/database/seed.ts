import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'flama',
  password: process.env.DB_PASSWORD || 'flama',
  database: process.env.DB_DATABASE || 'flama',
  entities: [User],
});

async function seed() {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);

  const existingAdmin = await userRepo.findOneBy({ email: 'admin@flama.dev' });
  if (!existingAdmin) {
    const admin = userRepo.create({
      email: 'admin@flama.dev',
      password: await bcrypt.hash('admin123456', 12),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      emailVerifiedAt: new Date(),
    });
    await userRepo.save(admin);
    console.log('Created admin user: admin@flama.dev');
  }

  const existingUser = await userRepo.findOneBy({ email: 'user@flama.dev' });
  if (!existingUser) {
    const user = userRepo.create({
      email: 'user@flama.dev',
      password: await bcrypt.hash('user123456', 12),
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true,
      emailVerifiedAt: new Date(),
    });
    await userRepo.save(user);
    console.log('Created test user: user@flama.dev');
  }

  console.log('Seeding complete.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
