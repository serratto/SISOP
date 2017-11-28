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
                    this.carregaFileManager_01(jsonData),
                    this.carregaEstados_02(jsonData),
                    this.carregaTemplateLeitura_03(jsonData),
                    this.carregaModeloInstrumentoTemplateLeitura_04(jsonData),
                    this.carregaSituacaoLeitura_05(jsonData),
                    this.carregaVariavelLeituraSituacao_06(jsonData),
                    this.carregaTipoInstrumento_07(jsonData),
                    this.carregaTipoInstrumentoPorInstalacao_08(jsonData),
                    this.carregaTipoModelos_09(jsonData),
                    this.carregaEstruturaLocalizacao_10(jsonData),
                    this.carregaSecao_11(jsonData),
                    this.carregaElemento_12(jsonData),
                    this.carregaInstrumento_13(jsonData),
                    this.carregaLabelLeitura_14(jsonData)
                    // this.carregaUltimas12Leituras(jsonData)
                ])
                .then(() => { resolve(); })
                .catch((err) => {
                    console.log('at carregaCampanhaNoDB', err);
                    reject(JSON.stringify(err));
                }));
    }
    private carregaFileManager_01(jsonData: object): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let command = 'insert into FileManager (uheId, filetimestamp, ' +
                'qtinstrumentos) ' +
                'values (?,?,?)';
            let arg = [jsonData['Usina'].Id,
            jsonData['FileTimestamp'],
            jsonData['QtInstrumentos']];
            this._sql.executeQuery(command, arg)
                .then((res) => resolve(res))
                .catch((err) => reject("OP-09: " + err));
        });
    }
    private carregaEstados_02(jsonData: object): Promise<any> {
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
                    reject("OP-02: " + err);
                });
        });
    }
    private carregaTemplateLeitura_03(jsonData: object): Promise<any> {
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
                    reject("OP-03: " + err);
                });
        });
    }
    private carregaModeloInstrumentoTemplateLeitura_04(jsonData: object): Promise<any> {
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
                    reject("OP-04: " + err);
                });
        });
    }
    private carregaSituacaoLeitura_05(jsonData: object): Promise<any> {
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
                    reject("OP-05: " + err);
                });
        });
    }
    private carregaVariavelLeituraSituacao_06(jsonData: object): Promise<any> {
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
                    reject("OP-06: " + err);
                });
        });
    }
    private carregaTipoInstrumento_07(jsonData: object): Promise<any> {
        var args = [];
        let command = 'insert or replace into TipoInstrumento ' +
            '(id, sigla, nome, multiponto, niveldagua)'
            + ' values ';
        _.forEach(jsonData['TiposInstrumento'], function (item) {
            args.push(item.Id)
            args.push(item.Sigla);
            args.push(item.Nome);
            args.push(item.Multiponto);
            args.push(item.NivelDagua);
            command += '(?, ?, ?, ?, ?),';
        });
        command = command.substring(0, command.length - 1);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject("OP-07: " + err);
                });
        });
    }
    private carregaTipoInstrumentoPorInstalacao_08(jsonData: object): Promise<any> {
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
                    reject("OP-08: " + err);
                });
        });
    }
    private carregaTipoModelos_09(jsonData: object): Promise<any> {
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
                    reject("OP-09: " + err);
                });
        });
    }
    private carregaEstruturaLocalizacao_10(jsonData: object): Promise<any> {
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
                    reject("OP-10: " + err);
                });
        });
    }
    private carregaSecao_11(jsonData: object): Promise<any> {
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
                    reject("OP-11: " + err);
                });
        });
    }
    private carregaElemento_12(jsonData: object): Promise<any> {
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
                    reject("OP-12: " + err);
                });
        });
    }
    private carregaInstrumento_13(jsonData: object): Promise<any> {
        var prom = [];
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

            prom.push(this._sql.executeQuery(command, args)
                .then(() => { Promise.resolve() })
                .catch((err) => Promise.reject("OP-13: " + err)));
        }
        return Promise.all(prom);
    }
    private carregaLabelLeitura_14(jsonData: object): Promise<any> {
        var prom = [];
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

                prom.push(this._sql.executeQuery(command, args)
                    .then(() => { Promise.resolve() })
                    .catch((err) => Promise.reject("OP-14: " + err)));
            }
        }
        return Promise.all(prom);
    }
}