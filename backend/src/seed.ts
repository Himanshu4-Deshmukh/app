import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { WalletService } from './wallet/wallet.service';
import { SlotsService } from './slots/slots.service';
import { Role } from './common/enums';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const walletService = app.get(WalletService);
  const slotsService = app.get(SlotsService);

  try {
    // Create admin user
    const adminExists = await usersService.findByEmail('admin@example.com');
    if (!adminExists) {
      const admin = await usersService.create(
        {
          name: 'Admin',
          email: 'admin@example.com',
          password: 'Admin@123',
        },
        Role.ADMIN,
      );
      await walletService.createWallet(admin._id.toString());
      console.log('✅ Admin user created: admin@example.com / Admin@123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample test user
    const testUserExists = await usersService.findByEmail('test@example.com');
    if (!testUserExists) {
      const testUser = await usersService.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@123',
      });
      const wallet = await walletService.createWallet(testUser._id.toString());
      
      // Give test user 1000 coins for testing
      await walletService.credit(testUser._id.toString(), 1000, 'ADMIN_CREDIT' as any);
      console.log('✅ Test user created: test@example.com / Test@123 (1000 coins)');
    } else {
      console.log('ℹ️  Test user already exists');
    }

    // Create sample slots for testing
    const now = new Date();
    const slots = await slotsService.findAll();
    
    if (slots.length === 0) {
      // Slot 1: Active slot (started 5 mins ago, ends in 10 mins)
      const slot1Start = new Date(now.getTime() - 5 * 60 * 1000);
      const slot1End = new Date(now.getTime() + 10 * 60 * 1000);
      await slotsService.create({
        startTime: slot1Start.toISOString(),
        endTime: slot1End.toISOString(),
        betAmount: 10,
        winAmount: 95,
      });

      // Slot 2: Future slot (starts in 15 mins, ends in 30 mins)
      const slot2Start = new Date(now.getTime() + 15 * 60 * 1000);
      const slot2End = new Date(now.getTime() + 30 * 60 * 1000);
      await slotsService.create({
        startTime: slot2Start.toISOString(),
        endTime: slot2End.toISOString(),
        betAmount: 10,
        winAmount: 95,
      });

      console.log('✅ Sample slots created');
    } else {
      console.log('ℹ️  Slots already exist');
    }

    console.log('\n🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await app.close();
  }
}

seed();
