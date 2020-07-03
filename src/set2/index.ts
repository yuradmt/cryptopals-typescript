import fs from 'fs';
import crypto from 'crypto';
import R from 'ramda';
import { fixedBufferXor, hexToBase64 } from '../set1';
/**
 * Challenge 9


Implement PKCS#7 padding
A block cipher transforms a fixed-sized block (usually 8 or 16 bytes) of plaintext into ciphertext. But we almost never want 
to transform a single block; we encrypt irregularly-sized messages.

One way we account for irregularly-sized messages is by padding, creating a plaintext that is an even multiple of the 
blocksize. The most popular padding scheme is called PKCS#7.

So: pad any block to a specific block length, by appending the number of bytes of padding to the end of the block. For instance,

"YELLOW SUBMARINE"
... padded to 20 bytes would be:

*/

// "YELLOW SUBMARINE\x04\x04\x04\x04"

export function pkcs7Padding(block: Buffer, blockLen: number): Buffer {
  const paddingLen = blockLen - (block.length % blockLen);
  const padding = Buffer.alloc(paddingLen).fill(paddingLen);
  return Buffer.concat([block, padding]);
}

/**
 * Challenge 10
 
Implement CBC mode
CBC mode is a block cipher mode that allows us to encrypt irregularly-sized messages, despite the fact that a block cipher natively only 
transforms individual blocks.

In CBC mode, each ciphertext block is added to the next plaintext block before the next call to the cipher core.

The first plaintext block, which has no associated previous ciphertext block, is added to a "fake 0th ciphertext block" called the 
initialization vector, or IV.

Implement CBC mode by hand by taking the ECB function you wrote earlier, making it encrypt instead of decrypt (verify this by 
  decrypting whatever you encrypt to test), and using your XOR function from the previous exercise to combine them.

The file here is intelligible (somewhat) when CBC decrypted against "YELLOW SUBMARINE" with an IV of all ASCII 0 (\x00\x00\x00 &c)
 */

export function aesInECBModeEncrypt(buf: Buffer, key: Buffer): Buffer {
  const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
  let encrypted = cipher.update(buf);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted;
}

export function aesInECBModeDecrypt(buf: Buffer, key: Buffer): Buffer {
  const cipher = crypto.createDecipheriv('aes-128-ecb', key, null);
  cipher.setAutoPadding(false);
  let decrypted = cipher.update(buf);
  decrypted = Buffer.concat([decrypted, cipher.final()]);
  return decrypted;
}

export async function cbcModeDecrypt(): Promise<string> {
  const KEY = Buffer.from('YELLOW SUBMARINE', 'ascii');
  const inBase64 = (await fs.promises.readFile('./src/set2/10.txt')).toString(
    'ascii',
  );
  const file = Buffer.from(inBase64, 'base64');
  const iv = Buffer.alloc(16).fill(0);
  const blocks = R.splitEvery(16, Array.from(file)).map((arr) =>
    Buffer.from(arr),
  );
  let lastBlock = iv;
  let decoded = '';
  for (const block of blocks) {
    decoded += fixedBufferXor(
      aesInECBModeDecrypt(block, KEY),
      lastBlock,
    ).toString('ascii');
    lastBlock = block;
  }
  return decoded;
}
