import { Injectable } from '@angular/core';
import { ISQLProvider, Constants } from './shared';

const win: any = window;

@Injectable()
export class StorageWeb implements ISQLProvider {
    private _db: any;
    private consts: Constants;
    constructor() {
        this.consts = new Constants();
        this._db = win.openDatabase(this.consts.UserDBName, '1.0', 'database', 5 * 1024 * 1024);
    }

    executeQuery(query: string, parms?: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.query(query, parms)
                .then((data) => resolve(data))
                .catch((err) => {
                    console.error('Erro no storage-web executeQuery', query, err);
                    reject(err);
                });
        });
    }

    executeNonQuery(query: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.query(query)
                .then((data) => resolve(data))
                .catch((err) => {
                    console.error('Erro no storage-web executeNonQuery', query, err);
                    reject(err);
                });
        });
    }

    /**
     * Perform an arbitrary SQL operation on the database. Use this method
     * to have full control over the underlying database through SQL operations
     * like SELECT, INSERT, and UPDATE.
     *
     * @param {string} query the query to run
     * @param {array} params the additional params to use for query placeholders
     * @return {Promise} that resolves or rejects with an object of the form { tx: Transaction, res: Result (or err)}
     */
    private query(query: string, params: any[] = []): Promise<any> {
        // console.log('StorageWeb query ', query, params);
        return new Promise((resolve, reject) => {
            try {
                this._db.transaction((tx: any) => {
                    tx.executeSql(query, params,
                        (tx: any, res: any) => resolve({ tx: tx, res: res }),
                        (tx: any, err: any) => {
                            reject('Erro: código: ' + err.code + ' message: ' + err.message);
                        }
                    )
                });
            } catch (err) {
                reject({ err: err });
            }
        });
    }
}