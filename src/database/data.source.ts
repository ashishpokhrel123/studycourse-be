import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
console.log(join(__dirname, '../**/**.entity{.ts,.js}'))
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: "34.172.227.235",
  port: 5432,
  username: 'postgres',
  password: '>yL2*Ppxak_/QHD#',
 
  database: 'study-courses',
  entities: [join(__dirname, '../**/**.entity{.ts,.js}')],
  migrations: [
    "../database/migrations/*.ts"
  ],
  synchronize:true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
