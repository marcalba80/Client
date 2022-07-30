import Dexie, { Table } from 'dexie';

export interface Xat{
    id?: number;
    username: string;
    clauPublicaO?: string;
    clauPublicaD?: string;
}

export interface Missatge{
    id?: number;
    idXat: number;
    usuariOrigen: string;
    usuariDesti: string;
    text: string;
    data: string;
    hora: string;
}

export class AppDB extends Dexie{
    xat!: Table<Xat, number>;
    missatge!: Table<Missatge, number>;

    constructor(){
        super('ngdexieliveQuery');
        this.version(3).stores({
            xat: '++id',
            missatge: '++id, idXat',
        });
        // this.on()
    }

    async resetDatabase() {
        await db.transaction('rw', 'Xat', 'Missatge', () => {
            this.xat.clear();
            this.missatge.clear();
        });
    }
}

export const db = new AppDB();