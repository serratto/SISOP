import { Injectable } from '@angular/core';
import { StorageSql, StorageWeb, SISOPEnvironment } from './shared';
import { ISQLProvider } from './shared';
import _ from 'lodash';

@Injectable()
export class StorageLoadData {
    private _web: boolean;
    private _sql: ISQLProvider;

    constructor() {
        if (SISOPEnvironment.isAndroid()) {
            this._web = false;
            this._sql = new StorageSql();
        }
        else {
            this._web = true;
            this._sql = new StorageWeb();
        }
    }

    public carregaCampanhaNoDB(jsonData: object): Promise<any> {
        return new Promise((resolve, reject) =>
            Promise.all(
                [
                    this.carregaFileManager(jsonData),
                    this.carregaEstados(jsonData),
                    this.carregaTemplateLeitura(jsonData),
                    this.carregaModeloInstrumentoTemplateLeitura(jsonData),
                    this.carregaSituacaoLeitura(jsonData),
                    this.carregaVariavelLeituraSituacao(jsonData),
                    this.carregaTipoInstrumento(jsonData),
                    this.carregaTipoInstrumentoPorInstalacao(jsonData),
                    this.carregaTipoModelos(jsonData),
                    this.carregaEstruturaLocalizacao(jsonData),
                    this.carregaSecao(jsonData),
                    this.carregaElemento(jsonData),
                    this.carregaInstrumento(jsonData),
                    this.carregaLabelLeitura(jsonData)
                    // this.carregaUltimas12Leituras(jsonData)
                ])
                .then(() => { resolve(); })
                .catch((err) => {
                    console.log('at carregaCampanhaNoDB', err);
                    reject(JSON.stringify(err));
                }));
    }
    private carregaFileManager(jsonData: object): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let command = 'insert into FileManager (uheId, filetimestamp, ' +
                'qtinstrumentos) ' +
                'values (?,?,?)';
            let arg = [jsonData['Usina'].Id,
            jsonData['FileTimestamp'],
            jsonData['QtInstrumentos']];
            this._sql.executeQuery(command, arg)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }
    private carregaEstados(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into Estados (id, nome) values ';
        _.forEach(jsonData['Estados'], function (estado) {
            args.push(estado.Id)
            args.push(estado.Nome);
            command += '(?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaTemplateLeitura(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into TemplateLeitura ' +
            '(id, tipoInstrumentoId, sequencia, sigla, nome)'
            + ' values ';
        _.forEach(jsonData['LeituraStructure']['TemplateLeitura'], function (item) {
            args.push(item.Id)
            args.push(item.TipoInstrumentoId);
            args.push(item.Sequencia);
            args.push(item.Sigla);
            args.push(item.Nome);
            command += '(?, ?, ?, ?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaModeloInstrumentoTemplateLeitura(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into ModeloInstrumentoTemplateLeitura ' +
            '(modeloInstrumentoId, templateLeituraId)'
            + ' values ';
        _.forEach(jsonData['LeituraStructure']['ModeloInstrumentoTemplateLeitura'], function (item) {
            args.push(item.ModeloInstrumentoId)
            args.push(item.TemplateLeituraId);
            command += '(?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaSituacaoLeitura(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into SituacaoLeitura ' +
            '(id, tipoInstrumentoId, sigla, nome)'
            + ' values ';
        _.forEach(jsonData['LeituraStructure']['SituacaoLeitura'], function (item) {
            args.push(item.Id)
            args.push(item.TipoInstrumentoId);
            args.push(item.Sigla);
            args.push(item.Nome);
            command += '(?, ?, ?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaVariavelLeituraSituacao(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into VariavelLeituraSituacao ' +
            '(tipoInstrumentoId, situacaoLeituraId, modeloInstrumentoId, templateLeituraId, unidadeMedida)'
            + ' values ';
        _.forEach(jsonData['LeituraStructure']['VariavelLeituraSituacao'], function (item) {
            args.push(item.TipoInstrumentoId)
            args.push(item.SituacaoLeituraId);
            args.push(item.ModeloInstrumentoId);
            args.push(item.TemplateLeituraId);
            args.push(item.UnidadeMedida);
            command += '(?, ?, ?, ?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaTipoInstrumento(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into TipoInstrumento ' +
            '(id, sigla, nome, multiponto)'
            + ' values ';
        _.forEach(jsonData['TiposInstrumento'], function (item) {
            args.push(item.Id)
            args.push(item.Sigla);
            args.push(item.Nome);
            args.push(item.Multiponto);
            command += '(?, ?, ?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaTipoInstrumentoPorInstalacao(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into TipoInstrumentoPorInstalacao ' +
            '(usinaId, tipoInstrumentoId)'
            + ' values ';
        var usinaId = jsonData['Usina'].Id;
        _.forEach(jsonData['TiposInstrumento'], function (item) {
            args.push(usinaId)
            args.push(item.Id);
            command += '(?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaTipoModelos(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into Modelos ' +
            '(id, sigla, nome)'
            + ' values ';
        _.forEach(jsonData['Modelos'], function (item) {
            args.push(item.Id)
            args.push(item.Sigla);
            args.push(item.Nome);
            command += '(?, ?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaEstruturaLocalizacao(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into EstruturaLocalizacao ' +
            '(id, nome)'
            + ' values ';
        _.forEach(jsonData['EstruturasLocalizacao'], function (item) {
            args.push(item.Id)
            args.push(item.Nome);
            command += '(?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaSecao(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into Secao ' +
            '(id, estruturaId, nome)'
            + ' values ';
        _.forEach(jsonData['Secoes'], function (item) {
            args.push(item.Id)
            args.push(item.EstruturaId);
            args.push(item.Nome);
            command += '(?, ?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaElemento(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into Elemento ' +
            '(id, secaoId, nome)'
            + ' values ';
        _.forEach(jsonData['Elementos'], function (item) {
            args.push(item.Id)
            args.push(item.SecaoId);
            args.push(item.Nome);
            command += '(?, ?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }
    private carregaInstrumento(jsonData: object): Promise<any> {
        for (var index = 0; index < jsonData['Instrumentos'].length; index++) {
            let item = jsonData['Instrumentos'][index];

            var args = [];
            let command = 'insert or replace into Instrumento ' +
                '(id, usinaId, tipoInstrumentoId, modeloId, ' +
                ' estadoId, estruturaLocalizacaoId, secaoId, elementoId, ' +
                ' codigoBarra, numero, estaca, afastamento)' +
                ' values ' +
                '(?, ?, ?, ?, ' +
                ' ?, ?, ?, ?, ' +
                ' ?, ?, ?, ?)';
            args.push(item.Id)
            args.push(item.UsinaId);
            args.push(item.TpInstrId);
            args.push(item.ModeloId);
            args.push(item.EstadoId);
            args.push(item.EstruturaId);
            args.push(item.SecaoId);
            args.push(item.ElementoId);
            args.push(item.CodigoBarra);
            args.push(item.Numero);
            args.push(item.Estaca);
            args.push(item.Afastamento);

            this._sql.executeQuery(command, args)
                .then(() => Promise.resolve())
                .catch((err) => Promise.reject(err));
        }

        return Promise.resolve();
    }
    private carregaLabelLeitura(jsonData: object): Promise<any> {
        for (var index = 0; index < jsonData['Instrumentos'].length; index++) {
            let instrumento = jsonData['Instrumentos'][index];
            for (var index2 = 0; index2 < instrumento['LabelLeitura'].length; index2++) {
                let item = instrumento['LabelLeitura'][index2];
                var args = [];
                let command = 'insert or replace into LabelLeitura ' +
                    '(instrumentoId, seq, valor) ' +
                    ' values ' +
                    '(?, ?, ?)';
                args.push(instrumento.Id);
                args.push(item.Seq);
                args.push(item.Valor);
                this._sql.executeQuery(command, args)
                    .then(() => Promise.resolve())
                    .catch((err) => Promise.reject(err));
            }
        }
        return Promise.resolve();
    }
}