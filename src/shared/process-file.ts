import { Injectable } from '@angular/core';
import { SISOPEnvironment } from "./shared";
import { File } from '@ionic-native/file'

import {
    MockChavantes, MockJurumirim,
    MockSaltoGrande, MockTaquarucu
} from "../data/data";
@Injectable()
export class ProcessFile {
    _file: File;
    constructor() {
        this._file = new File();
    }

    readFile(filename: string): Promise<string> {

        var promise = new Promise<any>((resolve, reject) => {
            if (SISOPEnvironment.isAndroid()) {
                this._file.readAsText(this._file.externalApplicationStorageDirectory, filename)
                    .then((data) => resolve(data))
                    .catch((err) => reject(err));
            }
            /* Local Mock */
            else {
                if (filename.toLowerCase() == '01_uhe jurumirim.json') {
                    resolve(MockJurumirim.getData());
                }
                else if (filename.toLowerCase() == '02_uhe chavantes.json') {
                    resolve(MockChavantes.getData());
                }
                else if (filename.toLowerCase() == '03_uhe salto grande.json') {
                    resolve(MockSaltoGrande.getData());
                }
                else if (filename.toLowerCase() == '07_uhe taquarucu.json') {
                    resolve(MockTaquarucu.getData());
                }
            }
            resolve();
        });
        return promise;
    }

    parseJsonFromUHE(jsonStringData: string): Promise<any> {
        var promise = new Promise<any>((resolve, reject) => {
            try {
                let jsonData = JSON.parse(jsonStringData);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        });
        return promise;
    }
}