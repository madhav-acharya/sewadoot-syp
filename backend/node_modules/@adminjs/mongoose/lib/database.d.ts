import { BaseDatabase } from 'adminjs';
import Resource from './resource.js';
declare class Database extends BaseDatabase {
    private readonly connection;
    constructor(connection: any);
    static isAdapterFor(connection: any): boolean;
    resources(): Resource[];
}
export default Database;
