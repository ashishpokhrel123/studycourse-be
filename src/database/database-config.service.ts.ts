import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

class DatabaseConfigService {
  private secretManagerClient: SecretManagerServiceClient;

  constructor() {
    this.secretManagerClient = new SecretManagerServiceClient();
  }

  private async getSecretValue(name: string): Promise<string> {
    const [version] = await this.secretManagerClient.accessSecretVersion({
      name: name,
    });
    return version.payload?.data?.toString() || '';
  }

private async resolveSecretReference(ref: string): Promise<string> {
    if (ref.startsWith('$(ref:projects/')) {
        const secretName = ref.match(/\$\(\S*\/secrets\/(\S*)\/versions\/latest\)/)[1];
        const projectId = "calm-edge-415106";

        // Ensure projectId is not empty before proceeding
        if (!projectId) {
            throw new Error('PROJECT_ID environment variable is not set');
        }

        return await this.getSecretValue(`projects/${projectId}/secrets/${secretName}/versions/latest`);
    } else {
        return ref;
    }
}


  public async getTypeOrmConfig(): Promise<TypeOrmModuleOptions> {
    const postgresHost = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-host/versions/latest)');
    const postgresDatabase = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-database/versions/latest)');
    const postgresUser = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-user/versions/latest)');
    const postgresPassword = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-password/versions/latest)');
    const postgresPort = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-port/versions/latest)');

    return {
      type: 'postgres',
      host: postgresHost,
      port: parseInt(postgresPort),
      username: postgresUser,
      password: postgresPassword,
      database: postgresDatabase,
      autoLoadEntities: true,
      synchronize: true
    };
  }

  public async getTypeOrmConfigForORM(): Promise<TypeOrmModuleOptions> {
    const postgresHost = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-host/versions/latest)');
    const postgresDatabase = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-database/versions/latest)');
    const postgresUser = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-user/versions/latest)');
    const postgresPassword = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-password/versions/latest)');
     const postgresPort = await this.resolveSecretReference('$(ref:projects/${PROJECT_ID}/secrets/postgres-port/versions/latest)');

    return {
      type: 'postgres',
      host: postgresHost,
      port: parseInt(postgresPort),
      username: postgresUser,
      password: postgresPassword,
      database: postgresDatabase,
      migrationsTableName: 'migrations',
      entities: [join(__dirname, '../common/entities/**/*{.ts,.js}')],
      migrations: ['libs/migrations/*.ts'],
    };
  }
}

export const databaseConfigService = new DatabaseConfigService();
