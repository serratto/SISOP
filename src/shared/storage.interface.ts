export interface ISQLProvider {
    executeQuery(query: string, parms: any[]): Promise<any>;
    executeNonQuery(query: string): Promise<any>;
}