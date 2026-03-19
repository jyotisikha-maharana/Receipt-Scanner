import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    const isProduction = configService.get<string>('NODE_ENV') === 'production';

    if (databaseUrl) {
      return {
        type: 'postgres' as const,
        url: databaseUrl,
        ssl: { rejectUnauthorized: false },
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      };
    }

    return {
      type: 'postgres' as const,
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get<number>('DB_PORT', 5432),
      username: configService.get<string>('DB_USERNAME', 'smartreceipt'),
      password: configService.get<string>('DB_PASSWORD', 'smartreceipt123'),
      database: configService.get<string>('DB_NAME', 'smartreceipt'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: !isProduction,
      logging: !isProduction,
    };
  },
  inject: [ConfigService],
};
