import { Injectable } from '@angular/core';
import { UHEFile, StorageManager } from './shared';

@Injectable()
export class SISOPGlobals {
    /* Constants */
    public AppName = 'SISOP Mobile';
    public UserDBName = 'SISOP.db';
    public KeyValueTable = 'kvPairTable';

    /* Variables */
    public instrumentoSelecionado: any;

    public currentDateDime() {
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        return localISOTime;
    }

    public getCurrentUHE(): Promise<UHEFile> {
        return new Promise<any>((resolve, reject) => {
            let stman = new StorageManager();
            stman.getCurrentUHE()
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }

    public setCurrentUHE(value: UHEFile): Promise<any> {
        var currentUHE = new UHEFile();
        currentUHE.seq = value.seq;
        currentUHE.name = value.name;
        currentUHE.fileName = value.fileName;
        currentUHE.usinaId = value.usinaId;

        return new Promise<any>((resolve, reject) => {
            let stman = new StorageManager();
            stman.setCurrentUHE(currentUHE)
                .then(() => {
                    resolve();
                })
                .catch((err) => reject(err));
        });
    }
}