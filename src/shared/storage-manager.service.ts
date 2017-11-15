import { Injectable } from '@angular/core';
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

    private _web: boolean;
    private _sql: ISQLProvider;
    private _processFile: ProcessFile;
    private _prepareSchema: StoragePrepareSchema;
    private _loadData: StorageLoadData;
    constructor() {
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
            let command = 'insert or replace into kvPairTable (key, value) values (?, ?)';
            let args = ['currentuhe', JSON.stringify(selected)];
            this._sql.executeQuery(command, args)
                .then(data => { resolve(); })
                .catch(err => {
                    reject(err);
                });
        });
    }

    public clearMobileData() {
        var tabs = ['FileManager',
            'Estados',
            'TemplateLeitura',
            'VariavelLeituraSituacao',
            'SituacaoLeitura',
            'TipoInstrumento',
            'TipoInstrumentoPorInstalacao',
            'Modelos',
            'EstruturaLocalizacao',
            'Secao',
            'Elemento',
            'Instrumento',
            'LabelLeitura',
            'Ultimas12Leituras',
            'LeituraValor',
            'MudancaEstado'
        ];
        for (var index = 0; index < tabs.length; index++) {
            let command = 'delete from ' + tabs[index];
            this._sql.executeQuery(command, []).then().catch();
        }
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
            ", m.id as 'modeloid' " +
            ", ti.multiponto as 'multiponto' " +
            ", ti.id as 'tipoInstrumentoId' " +
            " from instrumento i " +
            " join modelos m on i.modeloId = m.id " +
            " join estados e on i.estadoId = e.id " +
            " join tipoinstrumento ti on ti.id = i.tipoinstrumentoid" +
            " where i.usinaid = ? and tipoinstrumentoid = ?" +
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

    public getSituacaoLeitura(situacaoLeituraId: number): Promise<any> {
        var args = [];
        let command = 'select id, sigla, nome from SituacaoLeitura where id = ?';
        args.push(situacaoLeituraId);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    public getTemplateLeituraByTipoInstrumento(tipoInstrumentoId: number,
        situacaoLeituraId: number, modeloInstrumentoId: number): Promise<any> {
        var args = [];
        let command = " select tl.id as 'templateleituraid', tl.tipoinstrumentoid as 'tipoinstrumentoid',  " +
            " tl.sequencia as 'seqleitura', tl.sigla as 'sigla', tl.nome as 'nome'  " +
            " from TemplateLeitura tl, " +
            "      variavelleiturasituacao vl " +
            " where tl.tipoinstrumentoid   = vl.tipoinstrumentoid " +
            "   and tl.modeloinstrumentoid = vl.modeloinstrumentoid " +
            "   and tl.id = vl.templateleituraid " +
            "   and tl.tipoinstrumentoid = ? " +
            "   and vl.tipoinstrumentoid = ? " +
            "   and tl.modeloinstrumentoid = ? " +
            "   and vl.modeloinstrumentoid = ? " +
            "   and vl.situacaoLeituraId = ? ";
        args.push(tipoInstrumentoId);
        args.push(tipoInstrumentoId);
        args.push(modeloInstrumentoId);
        args.push(modeloInstrumentoId);
        args.push(situacaoLeituraId);
        return new Promise<any>((resolve, reject) => {
            this._sql.executeQuery(command, args)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }
}
