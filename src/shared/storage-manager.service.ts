import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import {
    StorageSql, StorageWeb,
    StoragePrepareSchema, StorageLoadData,
    SISOPEnvironment
} from './shared';
import { ISQLProvider, UHEFile } from './shared';
import { ProcessFile } from './shared';
import _ from 'lodash';


@Injectable()
export class StorageManager {
    private events: Events;

    private _web: boolean;
    private _sql: ISQLProvider;
    private _processFile: ProcessFile;
    private _prepareSchema: StoragePrepareSchema;
    private _loadData: StorageLoadData;
    constructor() {
        this.events = new Events();

        this._processFile = new ProcessFile();
        this._prepareSchema = new StoragePrepareSchema();
        this._loadData = new StorageLoadData();

        if (SISOPEnvironment.useSQLlite) {
            this._web = false;
            this._sql = new StorageSql();
        }
        else {
            this._web = true;
            this._sql = new StorageWeb();
        }
    }

    public initializeKV(): Promise<any> {
        let command = 'CREATE TABLE IF NOT EXISTS kvPairTable (key text primary key, value text)';
        return this._sql.executeNonQuery(command);
    }

    getCurrentUHE(): Promise<UHEFile> {
        let command = 'SELECT key, value from kvPairTable where key = ?';
        let arg = ['currentuhe'];

        var promise = new Promise<UHEFile>((resolve, reject) => {
            this._sql.executeQuery(command, arg)
                .then((data) => {
                    if (data.res.rows.length > 0) {
                        resolve(JSON.parse(data.res.rows[0].value));
                    }
                    resolve(null);
                })
                .catch(err => {
                    reject(err);
                });
        });
        return promise;
    }

    setCurrentUHE(selected: UHEFile): Promise<any> {
        if (!selected) {
            return this.setUHENasPreferencias(selected);
        };
        return new Promise((resolve, reject) => {
            /* Processa parse do arquivo */
            this.processFile(selected)
                /* jsonData possui os dados do arquivo já no formato JSON */
                .then((jsonData) => {
                    /* processa arquivo e monta estrutura para o coletor */
                    this.processaArquivo(jsonData)
                        .then(() => {/* com o parse correto, seta a uhe nas preferências */
                            selected.usinaId = jsonData['Usina'].Id;
                            selected.sigla = jsonData['Usina'].Sigla;
                            this.setUHENasPreferencias(selected)
                                .then(() => resolve())
                                .catch((err) => {
                                    reject("Erro ao definir preferências do usuário. " + err);
                                    return;
                                })
                        })
                        .catch((err) => {
                            reject(err);
                            return;
                        });

                })
                /* caso tenha dado erro no parse do JSON*/
                .catch((err) => {
                    reject("Arquivo da '" + selected.name + "' está com formato inválido." + err);
                    return;
                })
        });
    }

    private setUHENasPreferencias(selected: UHEFile): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (selected) {
                let command = 'insert or replace into kvPairTable (key, value) values (?, ?)';
                let args = ['currentuhe', JSON.stringify(selected)];
                this._sql.executeQuery(command, args)
                    .then(data => { resolve(); })
                    .catch(err => {
                        reject(err);
                    });
            } else {
                let command = 'delete from kvPairTable where key = ?';
                let args = ['currentuhe', JSON.stringify(selected)];
                this._sql.executeQuery(command, args)
                    .then(data => { resolve(); })
                    .catch(err => {
                        reject(err);
                    });

            }
        });
    }

    public clearMobileData(): Promise<any> {

        this._sql.executeNonQuery('delete from kvPairTable');
        var prom = new Promise((resolve, reject) => {
            Promise.all([
                this._sql.executeNonQuery('drop table FileManager'),
                this._sql.executeNonQuery('drop table Estados'),
                this._sql.executeNonQuery('drop table TemplateLeitura'),
                this._sql.executeNonQuery('drop table VariavelLeituraSituacao'),
                this._sql.executeNonQuery('drop table SituacaoLeitura'),
                this._sql.executeNonQuery('drop table TipoInstrumento'),
                this._sql.executeNonQuery('drop table TipoInstrumentoPorInstalacao'),
                this._sql.executeNonQuery('drop table Modelos'),
                this._sql.executeNonQuery('drop table EstruturaLocalizacao'),
                this._sql.executeNonQuery('drop table Secao'),
                this._sql.executeNonQuery('drop table Elemento'),
                this._sql.executeNonQuery('drop table Instrumento'),
                this._sql.executeNonQuery('drop table LabelLeitura'),
                this._sql.executeNonQuery('drop table MudancaEstado'),
                this._sql.executeNonQuery('drop table ModeloInstrumentoTemplateLeitura'),
                this._sql.executeNonQuery('drop table CampaignStatistics'),
                this._sql.executeNonQuery('drop table Leitura'),
                this._sql.executeNonQuery('drop table LeituraValor')
            ])
                .then((ok) => resolve(ok))
                .catch(err => reject(err));
        });
        return prom;
    }

    private processFile(uheFile: UHEFile): Promise<any> {
        var promise = new Promise<any>((resolve, reject) => {
            this._processFile.readFile(uheFile.fileName)
                .then((jsonString) => {
                    this._processFile.parseJsonFromUHE(jsonString)
                        .then((jsonData) => {
                            resolve(jsonData);
                        })
                        .catch((err) => {
                            reject(err);
                        })
                })
        });
        return promise;
    }

    private processaArquivo(jsonData: object): Promise<any> {
        return new Promise((resolve, reject) => {
            /* prepara o schema do banco de dados */
            this._prepareSchema.prepareSchema()
                .then(() => {
                    this.loadDatabase(jsonData)
                        .then(() => { resolve(); })
                        .catch((err) => {
                            reject(err);
                        })
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    private loadDatabase(jsonData: object): Promise<any> {
        return new Promise((resolve, reject) => {
            /* Verifica se já foi carregada a campanha para o banco de dados */
            let command = 'SELECT uheId, filetimestamp, qtinstrumentos, datafechamento ' +
                'from FileManager ' +
                "where uheId = ? and filetimestamp = ?";
            let arg = [jsonData['Usina'].Id, jsonData['FileTimestamp']];
            this._sql.executeQuery(command, arg)
                .then((data) => {
                    /* armazena se existe a campanha corrente (mesma UHE/Tmestamp) */
                    let campanhaCorrente = (data.res.rows.length == 1);
                    let command = 'SELECT uheId, filetimestamp, qtinstrumentos, datafechamento ' +
                        'from FileManager ' +
                        "where uheId = ? ";
                    let arg = [jsonData['Usina'].Id];
                    this._sql.executeQuery(command, arg)
                        .then((data2) => {
                            /* Verifica se tem outra campanha carregada para a mesma uhe */
                            /* armazena se existe outra campanha para a UHE (mesma UHE / timestamp <>)*/
                            let outraCampanha = data2.res.rows.length != 0;

                            /* Caso não exista a campanha, carrega */
                            if (!campanhaCorrente && !outraCampanha) {
                                this._loadData.carregaCampanhaNoDB(jsonData)
                                    .then(() => resolve())
                                    .catch((err) => {
                                        reject(err);
                                        return;
                                    });
                            }
                            /* Caso não exista a campanha corrente, mas exista outra, emite erro */
                            else if (!campanhaCorrente && outraCampanha) {
                                reject("Já existe outra campanha para esta Usina carregada no coletor.");
                            }
                            /* Caso já exista a campanha carregada, não faz nada */
                            else { resolve(data); }
                        })
                        .catch((err) => { reject(err); });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    public getTiposByUHE(usinaId: number): Promise<any> {
        let comm = "select ti.id as 'id', ti.sigla as 'sigla', ti.nome as 'nome' " +
            "from TipoInstrumento ti join " +
            "     TipoInstrumentoPorInstalacao tipi  on ti.id = tipi.tipoInstrumentoId " +
            "where tipi.usinaId = ? " +
            "order by ti.sigla";
        let args = [];
        args.push(usinaId);

        return new Promise((resolve, reject) => {
            this._sql.executeQuery(comm, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public getInstrumentosByTipoUHE(tipoInstrumentoId: number, usinaId: number): Promise<any> {
        let comm = " select i.id, m.sigla as 'modelo', " +
            "substr('0000'|| i.numero,-4, 4) as 'numero'" +
            ", e.nome as 'estado'" +
            ", i.estadoid as 'estadoid'" +
            ", m.id as 'modeloid' " +
            ", ti.multiponto as 'multiponto' " +
            ", ti.niveldagua as 'niveldagua' " +
            ", ti.id as 'tipoInstrumentoId' " +
            ", count(l.instrumentoid) as 'contaleitura' " +
            " from instrumento i " +
            " join modelos m on i.modeloId = m.id " +
            " join estados e on i.estadoId = e.id " +
            " join tipoinstrumento ti on ti.id = i.tipoinstrumentoid" +
            " left outer join leitura l on l.InstrumentoId = i.id" +
            " where i.usinaid = ? and tipoinstrumentoid = ?" +
            " group by  " +
            "i.id, m.sigla, substr('0000'|| i.numero,-4, 4) " +
            ", e.nome, i.estadoid, m.id, ti.multiponto " +
            ", ti.niveldagua, ti.id"
            " order by i.numero " 
            ;
        let args = [];
        args.push(usinaId);
        args.push(tipoInstrumentoId);
        return new Promise((resolve, reject) => {
            this._sql.executeQuery(comm, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public getInstrumento(instrumentoId: number): Promise<any> {
        let comm = "select i.id as 'id', m.sigla, substr('0000' || i.numero, -4, 4) as 'numero', " +
            "m.sigla as 'siglamodelo', m.nome as 'nomemodelo', " +
            "i.codigobarra, i.estaca, i.afastamento, e.nome as 'estado', " +
            "el.nome as 'estruturalocalizacao', s.nome as 'secao', " +
            "elm.nome as 'elemento', ti.sigla as 'siglatipo', ti.nome as 'nometipo' " +
            "from Instrumento i " +
            "join modelos m on i.modeloid = m.id " +
            "join tipoinstrumento ti on i.tipoinstrumentoid = ti.id " +
            "join estados e on i.estadoid = e.id " +
            "join estruturalocalizacao el on el.id = i.estruturalocalizacaoid " +
            "join secao s on i.secaoid = s.id " +
            "join elemento elm on i.elementoid = elm.id " +
            "where i.id = ?";
        let args = [];
        args.push(instrumentoId);
        return new Promise((resolve, reject) => {
            this._sql.executeQuery(comm, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public saveStateInstrumento(instrumentoId: number, estadoId: number): Promise<any> {
        var args = [];
        let command = 'insert or replace into MudancaEstado ' +
            '(instrumentoId, estadoId)'
            + ' values (?, ?)';
        args.push(instrumentoId);
        args.push(estadoId);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }

    public getStateChangedInstrumento(instrumentoId: number): Promise<any> {
        var args = [];
        let command = 'select estadoId from MudancaEstado ' +
            'where instrumentoId = ?';
        args.push(instrumentoId);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public getUltimasLeituras(uheFile: UHEFile, instrumentoId: number): Promise<any> {
        var promise = new Promise<any>((resolve, reject) => {
            this._processFile.readFile(uheFile.fileName)
                .then((jsonString) => {
                    this._processFile.parseJsonFromUHE(jsonString)
                        .then((jsonData) => {
                            var lastRead = _.find(jsonData['Instrumentos'],
                                function (i) { return i.Id == instrumentoId });
                            resolve(lastRead);
                        })
                        .catch((err) => {
                            reject(err);
                        })
                })
        });
        return promise;
    }

    public getSituacaoLeituraByTipoInstrumento(tipoinstrumentoid: number): Promise<any> {
        var args = [];
        let command = 'select id, sigla, nome from SituacaoLeitura where tipoinstrumentoid = ?';
        args.push(tipoinstrumentoid);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public getTemplateLeituraByTipoInstrumento(tipoInstrumentoId: number): Promise<any> {
        var args = [];
        let command = " select id as 'templateLeituraId', " +
            " tipoinstrumentoid, " +
            " sequencia, " +
            " sigla, " +
            " nome " +
            " from templateLeitura " +
            " where tipoinstrumentoid = ? ";
        args.push(tipoInstrumentoId);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public getModeloTemplateLeituraByModelo(modeloInstrumentoId: number): Promise<any> {
        var args = [];
        let command = " select modeloInstrumentoId, templateLeituraId " +
            " from ModeloInstrumentoTemplateLeitura " +
            " where modeloInstrumentoId = ? ";
        args.push(modeloInstrumentoId);

        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public getVariaveisLeituraSituacao(tipoInstrumentoId: number, modeloInstrumentoId): Promise<any> {
        var args = [];
        let command = " select tipoinstrumentoid, situacaoleituraid, modeloinstrumentoid, " +
            " templateLeituraId, unidademedida " +
            " from VariavelLeituraSituacao " +
            " where tipoinstrumentoid = ? " +
            "   and modeloinstrumentoid = ? ";
        args.push(tipoInstrumentoId);
        args.push(modeloInstrumentoId);

        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public insertLeitura(leitura: any): Promise<any> {
        var args = [];
        let command = 'insert or replace into Leitura ' +
            '( DataLeitura, NivelDagua, ' +
            '  SituacaoLeitura, InstrumentoId, ' +
            '  Observacao, Barcode)'
            + ' values (?, ?, ?, ?, ?, ?)';

        args.push(leitura.DataLeitura);
        args.push(leitura.NivelDagua);
        args.push(leitura.SituacaoLeitura);
        args.push(leitura.InstrumentoId);
        args.push(leitura.Observacao);
        args.push(leitura.Barcode);

        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }

    public deleteLeitura(leitura: any): Promise<any> {
        var args = [];
        let command = 'delete from Leitura ' +
            ' where DataLeitura = ? and InstrumentoId = ?';

        args.push(leitura.DataLeitura);
        args.push(leitura.InstrumentoId);

        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }

    public deleteLeituraValor(leitura: any): Promise<any> {
        var args = [];
        let command = 'delete from LeituraValor ' +
            ' where DataLeitura = ? and InstrumentoId = ?';

        args.push(leitura.DataLeitura);
        args.push(leitura.InstrumentoId);

        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }

    public insertLeituraValor(leituraValor: any): Promise<any> {
        var args = [];
        let command = 'insert or replace into LeituraValor ' +
            '( DataLeitura, InstrumentoId, TemplateLeituraId, Sequencial, Valor )'
            + ' values (?, ?, ?, ?, ?)';

        args.push(leituraValor.DataLeitura);
        args.push(leituraValor.InstrumentoId);
        args.push(leituraValor.TemplateLeituraId);
        args.push(leituraValor.Sequencial);
        args.push(leituraValor.Valor);

        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then(() => { resolve(); })
                .catch((err) => {
                    reject(err);
                    return;
                });
        });
    }

    public getLeiturasCampanha(instrumentoId): Promise<any> {
        var args = [];
        let command = " select dataleitura, niveldagua, situacaoleitura, instrumentoid, observacao, barcode " +
            " from Leitura " +
            " where instrumentoid = ? ";
        args.push(instrumentoId);

        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public getLeituraValoresCampanha(instrumentoId): Promise<any> {
        var args = [];
        let command = " select dataleitura, instrumentoid, templateleituraid, sequencial, valor " +
            " from LeituraValor " +
            " where instrumentoid = ? ";
        args.push(instrumentoId);

        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }
}
