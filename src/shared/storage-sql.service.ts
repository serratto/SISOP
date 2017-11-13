import { Injectable } from '@angular/core';
import { ISQLProvider, Constants } from './shared';
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";

@Injectable()
export class StorageSql implements ISQLProvider {

    private _db: any;
    private consts: Constants;
    private sqlite: SQLite;

    constructor() {
        this.consts = new Constants();
        this.sqlite = new SQLite();
        this._db = this.sqlite.create({ name: this.consts.UserDBName, location: 'default' })
            .then((db: SQLiteObject) => { });
    }

    executeQuery(query: string, parms?: any[]): Promise<any> {
        var promise = new Promise((resolve, reject) => {
            this._db.executeSql(query, parms)
                .then((data) => resolve(data))
                .catch(err => {
                    console.error('Erro no storage-sql runCommand', err.tx, err.err);
                    reject(err);
                });
        });
        return promise;
    }

    executeNonQuery(query: string): Promise<any> {
        var promise = new Promise((resolve, reject) => {
            this._db.executeSql(query)
                .then((data) => resolve(data))
                .catch((err) => {
                    console.error('Erro no storage-web executeNonQuery', err.tx, err.err);
                    reject(err);
                });
        });
        return promise;
    }
}