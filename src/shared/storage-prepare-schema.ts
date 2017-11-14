import { Injectable } from '@angular/core';
import { StorageSql, StorageWeb } from './shared';
import { ISQLProvider } from './shared';

@Injectable()
export class StoragePrepareSchema {

    private _web: boolean;
    private _sql: ISQLProvider;
    constructor() {
        if (!document.URL.startsWith('http')) {
            this._web = false;
            this._sql = new StorageSql();
        }
        else {
            this._web = true;
            this._sql = new StorageWeb();
        }
    }

    public prepareSchema(): Promise<any> {
        return new Promise((resolve, reject) =>
            Promise.all(
                [this.createFileManager(),
                this.createCampaingStatistics(),
                this.createEstados(),
                this.createTipoInstrumento(),
                this.createTipoInstrumentoPorInstalacao(),
                this.createModelos(),
                this.createEstruturaLocalizacao(),
                this.createSecao(),
                this.createElemento(),
                this.createSituacaoLeitura(),
                this.createTemplateLeitura(),
                this.createVariavelLeituraSituacao(),
                this.createInstrumento(),
                this.createLabelLeitura(),
                this.createUltimas12Leituras(),
                this.createLeituraValor(),
                this.createStateChange()
                ])
                .then(() => { resolve(); })
                .catch((err) => {
                    console.log('at prepareSchema', err);
                    reject(JSON.stringify(err));
                }));
    }
    private createFileManager(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS FileManager ' +
                '(uheId bigint primary key, ' +
                'fileTimestamp varchar(16), ' +
                'qtInstrumentos int, ' +
                'dataFechamento datetime)';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createCampaingStatistics(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS CampaignStatistics ' +
                '(uheId bigint primary key, ' +
                'fileTimestamp varchar(16), ' +
                'tipoInstrumentoId bigint, ' +
                'qtInstrumentos int, ' +
                'qtProcessado int)';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createEstados(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS Estados ' +
                '(id bigint primary key, ' +
                'nome varchar(255))';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createTipoInstrumento(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS TipoInstrumento ' +
                '(id bigint primary key ' +
                ',sigla varchar(20)' +
                ',nome varchar(255)' +
                ',multiponto int' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createTipoInstrumentoPorInstalacao(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS TipoInstrumentoPorInstalacao ' +
                '(usinaId bigint ' +
                ',tipoInstrumentoId bigint' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createModelos(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS Modelos ' +
                '(id bigint primary key ' +
                ',sigla varchar(20)' +
                ',nome varchar(255)' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createEstruturaLocalizacao(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS EstruturaLocalizacao ' +
                '(id bigint primary key ' +
                ',nome varchar(255)' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createSecao(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS Secao ' +
                '(id bigint primary key ' +
                ', estruturaId bigint ' +
                ',nome varchar(255)' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createElemento(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS Elemento ' +
                '(id bigint primary key ' +
                ', secaoId bigint ' +
                ',nome varchar(255)' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createSituacaoLeitura(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS SituacaoLeitura ' +
                '(id bigint primary key ' +
                ',tipoInstrumentoId bigint' +
                ',sigla varchar(20)' +
                ',nome varchar(255)' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createTemplateLeitura(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS TemplateLeitura ' +
                '(id bigint primary key ' +
                ',tipoInstrumentoId bigint' +
                ',sequencia int' +
                ',sigla varchar(20)' +
                ',nome varchar(255)' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createVariavelLeituraSituacao(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS VariavelLeituraSituacao ' +
                '(tipoInstrumentoId bigint' +
                ',situacaoLeituraId bigint' +
                ',modeloInstrumentId bigint' +
                ',templateLeituraId bigint' +
                ',unidadeMedida string' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createInstrumento(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS Instrumento ' +
                '(id bigint primary key ' +
                ',usinaId bigint' +
                ',tipoInstrumentoId bigint' +
                ',modeloId bigint' +
                ',estadoId bigint' +
                ',estruturaLocalizacaoId bigint' +
                ',secaoId bigint' +
                ',elementoId bigint' +
                ',codigoBarra string' +
                ',numero string' +
                ',estaca string' +
                ',afastamento string' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createLabelLeitura(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS LabelLeitura ' +
                '(instrumentoId bigint ' +
                ',seq int' +
                ',valor string' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createUltimas12Leituras(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS Ultimas12Leituras ' +
                '(leituraId bigint ' +
                ',instrumentoId bigint' +
                ',dataLeitura string' +
                ',nivelDagua string' +
                ',situacaoLeituraId int' +
                ',observacao string' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createLeituraValor(): Promise<any> {
        return new Promise((resolve, reject) => {
            let command = 'CREATE TABLE IF NOT EXISTS LeituraValor ' +
                '(leituraId bigint ' +
                ',templateLeituraId bigint' +
                ',sequencial int' +
                ',valor decimal(20,7)' +
                ')';
            this._sql.executeNonQuery(command)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                })
        });
    }
    private createStateChange():Promise<any>{
            return new Promise((resolve, reject) => {
                let command = 'CREATE TABLE IF NOT EXISTS MudancaEstado ' +
                    '(instrumentoId bigint primary key, ' +
                    'estadoId bigint)';
                this._sql.executeNonQuery(command)
                    .then(() => { resolve(); })
                    .catch((err) => {
                        reject(err);
                        return;
                    })
            });
    
    }
}