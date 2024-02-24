import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

require('dotenv').config();

class DatabaseConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing && key !== 'POSTGRES_PASSWORD') {
      throw new Error(`config error - missing env.${key}`);
    }

    return value || '';
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    if (this.isProduction()) {
      return this.getProductionTypeOrmConfig();
    } else {
      return this.getDevelopmentTypeOrmConfig();
    }
  }

  private getProductionTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.GAE_DB_ADDRESS || '',
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD') || '',
      database: this.getValue('POSTGRES_DATABASE'),
      autoLoadEntities: true,
    };
  }

  private getDevelopmentTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: '127.0.0.1',
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD') || '',
      database: this.getValue('POSTGRES_DATABASE'),
      autoLoadEntities: true,
    };
  }

  public getTypeOrmConfigForORM(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      migrationsTableName: 'migrations',
      entities: [join(__dirname, '../common/entities/**/*{.ts,.js}')],
      migrations: ['libs/migrations/*.ts'],
    };
  }
}

const databaseConfigService = new DatabaseConfigService(
  process.env
).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { databaseConfigService };
