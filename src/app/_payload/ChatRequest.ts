export const VALID_USER = 1;
export const SEND_RSA = 2;
export const SEND_RND = 3;
export const MESSAGE = 5;
export const ERROR = 6;
export const COMPLETED = 7;

export class ChatRequest{
    type: number;
    userFrom: string;
    userTo: string;
    content: string;

    constructor(type: number,
        userFrom: string,
        userTo: string,
        content: string)
    {
            this.type = type;
            this.userFrom = userFrom;
            this.userTo = userTo;
            this.content = content;
    }
    
    public getType(): number{
        return this.type;
    }
    public getUserFrom(): string{
        return this.userFrom;
    }
    public getUserTo(): string{
        return this.userTo;
    }
    public getContent(): string{
        return this.content;
    }
    public isTypeValidUser(): boolean{
        return this.type == VALID_USER;
    }
    public isTypeMessage(): boolean{
        return this.type == MESSAGE;
    }
}