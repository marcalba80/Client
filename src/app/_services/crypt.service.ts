import { Injectable } from '@angular/core';
import rsa from 'js-crypto-rsa';
import { JsonWebKeyPair } from 'js-crypto-rsa/dist/typedef';


@Injectable({
  providedIn: 'root'
})
export class CryptService {

  constructor() { }

  generateRSAKey(): Promise<JsonWebKeyPair>{
    return rsa.generateKey(2048);
  }
}
