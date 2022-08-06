import { Injectable } from '@angular/core';
import rsa from 'js-crypto-rsa';
import { JsonWebKeyPair } from 'js-crypto-rsa/dist/typedef';
import * as crypto from 'crypto-js';


@Injectable({
  providedIn: 'root'
})
export class CryptService {

  constructor() { }

  generateRSAKey(): Promise<JsonWebKeyPair>{
    return rsa.generateKey(2048);
  }

  hashM(userR: boolean, keyP1?: JsonWebKey, keyP2?: JsonWebKey): string | undefined{
    if(keyP1 !== undefined && keyP2 !== undefined){
      const k1 = keyP1.n?.toString();
      const k2 = keyP2.n?.toString();
      console.log("K1: " + keyP1.n);
      console.log("K2: " + keyP2.n);
      if(k1 !== undefined && k2 !== undefined)
        if(userR)
          return crypto.SHA1(k1.concat(k2)).toString();
        else
          return crypto.SHA1(k2.concat(k1)).toString();
    }
    return undefined;
  }
}
