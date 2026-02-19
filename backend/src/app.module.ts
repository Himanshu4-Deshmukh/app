import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { WalletModule } from "./wallet/wallet.module";
import { WalletTransactionsModule } from "./wallet-transactions/wallet-transactions.module";
import { SlotsModule } from "./slots/slots.module";
import { BetsModule } from "./bets/bets.module";
import { PaymentsModule } from "./payments/payments.module";
import { AdminModule } from "./admin/admin.module";

import { RootController } from "./root.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URL"),
        dbName: configService.get<string>("DB_NAME"),
      }),
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    UsersModule,
    WalletModule,
    WalletTransactionsModule,
    SlotsModule,
    BetsModule,
    PaymentsModule,
    AdminModule,
  ],

  controllers: [RootController],
})
export class AppModule {}
