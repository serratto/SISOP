import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { UHEFile, StorageManager } from './shared';

@Injectable()
export class GlobalVariables {
    private stMan: StorageManager;
    constructor(private events: Events) {
        this.stMan = new StorageManager();
    }

    public instrumentoSelecionado: any = null;

    public getCurrentUHE(): Promise<UHEFile> {
        return this.stMan.getCurrentUHE();
    }

    public setCurrentUHE(value: UHEFile): Promise<any> {
        var currentUHE = new UHEFile();
        currentUHE.seq = value.seq;
        currentUHE.name = value.name;
        currentUHE.fileName = value.fileName;
        currentUHE.usinaId = value.usinaId;

        return new Promise<any>((resolve, reject) => {
            this.stMan.setCurrentUHE(currentUHE)
                .then(() => {
                    this.events.publish('uheselected:changed');
                    resolve();
                })
                .catch((err) => reject(err));
        });
    }
}