import { Injectable } from '@angular/core';
import rsa from 'js-crypto-rsa';
import { JsonWebKeyPair } from 'js-crypto-rsa/dist/typedef';
import * as crypt from 'crypto-js';
import { pseudoRandomBytes, randomBytes } from 'crypto';


const charact = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./;'[]\=-)(*&^%$#@!~`";

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
          return crypt.SHA1(k1.concat(k2)).toString();
        else
          return crypt.SHA1(k2.concat(k1)).toString();
    }
    return undefined;
  }

  hashX(userR?: boolean, keyP1?: JsonWebKey, keyP2?: JsonWebKey, 
    randA?: string, randB?: string): string | undefined{
    if(keyP1 !== undefined && keyP2 !== undefined
      && randA !== undefined && randB !== undefined){
      const k1 = keyP1.n?.toString();
      const k2 = keyP2.n?.toString();
      console.log("K1: " + keyP1.n);
      console.log("K2: " + keyP2.n);
      if(k1 !== undefined && k2 !== undefined)
        if(userR){
          console.log("HashRand: " + crypt.SHA256(k1 + k2 + randA + randB).toString());
          return crypt.SHA256(k1 + k2 + randA + randB).toString();
        }  
        else{
          console.log("HashRand: " + crypt.SHA256(k2 + k1 + randB + randA).toString());
          return crypt.SHA256(k2 + k1 + randB + randA).toString();
        }
    }
    return undefined;
  }

  async encryptRSA(msg: Uint8Array, key: JsonWebKey): Promise<Uint8Array> {
    console.log("encode: " + JSON.stringify(msg))
    return await rsa.encrypt(msg, key);
    // .then(res =>{
    //   console.log("Crypt: " + res);
    //   return res
    // })
    // return undefined;
  }

  async decryptRSA(msg: Uint8Array, key: JsonWebKey): Promise<Uint8Array> {
    return await rsa.decrypt(msg, key);
    // .then(res =>{
    //   return res;
    // })
    // return undefined;
  }

  encryptAES(msg: string, key: string): string{
    return crypt.AES.encrypt(msg, key).toString()
  }

  decryptAES(msg: string, key: string): string{
    return crypt.AES.decrypt(msg, key).toString(crypt.enc.Utf8);
    // crypto.ran
  }

  encodeUTF8(msg: string): Uint8Array{
    return new TextEncoder().encode(msg);
  }

  decodeUTF8(msg: Uint8Array): string {
    return new TextDecoder().decode(msg);
  }

  makeRandom(length: number): string{
    let text = "";
    for (let i = 0; i < length; i++) {
      text += charact.charAt(Math.floor(Math.random() * charact.length));
    }
    return text;
  }

  randomValues(): Uint8Array{
    let arr: Uint8Array = new Uint8Array(32);
    window.crypto.getRandomValues(arr);
    return arr;
  }

  StrToArray(str: string): Uint8Array{
    let strArr = str.split(',');
    console.log("S2A: " + strArr[0]);
    let arr: Uint8Array = new Uint8Array(strArr.length);
    for (var i = 0; i < strArr.length; i++) {
      arr[i] = parseInt(strArr[i]);
      
    }
    return arr;
  }

  ArrayToJson(array: Uint8Array) {
    let str = "";
    for (var i = 0; i < array.length; i++) {
      str += String.fromCharCode(array[i]);
    }
    return JSON.parse(str);
  }

  // StringToItnum(str: string): []{

  // }
}
