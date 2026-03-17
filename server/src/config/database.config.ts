import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'smartreceipt'),
    password: configService.get<string>('DB_PASSWORD', 'smartreceipt123'),
    database: configService.get<string>('DB_NAME', 'smartreceipt'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    // NOTE: synchronize:true is dev-only. Use migrations in production.
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    logging: configService.get<string>('NODE_ENV') === 'development',
  }),
  inject: [ConfigService],
};
