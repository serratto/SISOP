import { Injectable } from '@angular/core';
import { ISQLProvider, SISOPGlobals } from './shared';
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";

@Injectable()
export class StorageSql implements ISQLProvider {

    private _db: any;
    private _globals: SISOPGlobals;
    private sqlite: SQLite;
    constructor() {
        this._globals = new SISOPGlobals();
        this.sqlite.create({ name: this._globals.UserDBName, location: 'default' })
            .then((db: SQLiteObject) => {
                this._db = db;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    executeQuery(query: string, parms?: any[]): Promise<any> {
        var promise = new Promise((resolve, reject) => {
            this.sqlite.create({ name: this._globals.UserDBName, location: 'default' })
                .then((db: SQLiteObject) => {
                    db.executeSql(query, parms)
                        .then((data) => resolve(data))
                        .catch(err => {
                            console.error('Erro no storage-sql executeQuery executeSql', err.tx, err.err);
                            reject(err);
                        })
                })
                .catch(err => {
                    console.error('Erro no storage-sql executeQuery create', err.tx, err.err);
                    reject(err);
                });
        });
        return promise;
    }

    executeNonQuery(query: string): Promise<any> {
        var promise = new Promise((resolve, reject) => {
            this.sqlite.create({ name: this._globals.UserDBName, location: 'default' })
                .then((db: SQLiteObject) => {
                    this._db.executeSql(query)
                        .then((data) => resolve(data))
                        .catch((err) => {
                            console.error('Erro no storage-sql executeNonQuery executeSql', err.tx, err.err);
                            reject(err);
                        })
                })
                .catch(err => {
                    console.error('Erro no storage-sql executeNonQuery create', err.tx, err.err);
                    reject(err);
                });
        });
        return promise;
    }
}