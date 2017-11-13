import { Injectable } from '@angular/core';
import {
    MockChavantes, MockJurumirim,
    MockSaltoGrande, MockTaquarucu
} from "../data/data";
@Injectable()
export class ProcessFile {
    constructor() {

    }

    readFile(filename: string): Promise<string> {

        var promise = new Promise<any>((resolve, reject) => {
            if (document.URL.startsWith('http')) {
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
                /* Local Mock */
            }
            else {
                /* processa */
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