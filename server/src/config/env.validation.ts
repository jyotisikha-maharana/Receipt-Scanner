import { IsString, IsNumber, IsOptional, validateSync } from 'class-validator';
import { plainToClass, Type } from 'class-transformer';

class EnvironmentVariables {
  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Type(() => Number)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsOptional()
  @IsString()
  GEMINI_API_KEY?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  PORT?: number;

  @IsOptional()
  @IsString()
  UPLOAD_DIR?: string;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}
