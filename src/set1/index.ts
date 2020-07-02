import fs from 'fs';
import crypto from 'crypto';
import R from 'ramda';
import { letterScore } from './frequency';

/**
 * Challenge 1
 */
export function hexToBase64(hex: string): string {
  return Buffer.from(hex, 'hex').toString('base64');
}

/**
 * Challenge 2
 */
export function fixedBufferXor(buf1: Buffer, buf2: Buffer): string {
  const res = new Uint8Array(buf1.length);
  buf1.forEach((byte, i) => (res[i] = byte ^ buf2[i]));
  return Buffer.from(res).toString('hex');
}

/**
 * Challenge 3
 */

function freqScore(text: string) {
  text = text.toLowerCase();

  let count = 0;
  for (let i = 0; i < text.length; i++) {
    count += letterScore(text[i]);
  }
  return count;
}

export function singleByteXor(text: string): { decoded: string; key: number } {
  const textBuf = Buffer.from(text, 'hex');
  let score = -10000;
  let bestSentence = '';
  let key = 0;
  for (let ch = 0; ch <= 255; ch++) {
    const xored = fixedBufferXor(
      Buffer.from(text, 'hex'),
      Buffer.alloc(textBuf.length).fill(ch),
    );
    const res: string[] = [];
    Buffer.from(xored, 'hex').forEach((byte) => {
      res.push(String.fromCharCode(byte));
    });
    const decoded = res.join('');
    if (freqScore(decoded) > score) {
      bestSentence = decoded;
      score = freqScore(decoded);
      key = ch;
    }
  }
  return {
    decoded: bestSentence,
    key,
  };
}

/**
 * Challenge 4
 */

export async function detectSingleByteXor(): Promise<string> {
  let bestScore = 0,
    winner = '';
  const data = await fs.promises.readFile('src/set1/4.txt');
  const lines = data.toString('ascii').split('\n');
  lines.forEach((line) => {
    const { decoded } = singleByteXor(line);
    const score = freqScore(decoded);
    if (score > bestScore) {
      bestScore = score;
      winner = decoded;
    }
  });
  return winner;
}

/**
 * Chalenge 5
 */

export function repeatingKeyXor(text: Buffer, key: string): string {
  const result = Buffer.alloc(text.length);
  for (let i = 0; i < text.length; i++) {
    result[i] = text[i] ^ key.charCodeAt(i % key.length);
  }
  return result.toString('hex');
}

/**
 * Challenge 6
 */

type KeySizeDistance = [number, number];

function byteHammingDistance(n1: number, n2: number) {
  const s1 = n1.toString(2).slice(0, 8);
  const s2 = n2.toString(2).slice(0, 8);
  return s1.split('').reduce((acc, cur, i) => {
    return s1[i] !== s2[i] ? acc + 1 : acc;
  }, 0);
}

export function hammingDistance(s1: string, s2: string): number {
  return s1
    .split('')
    .reduce(
      (acc, cur, i) =>
        acc + byteHammingDistance(s1.charCodeAt(i), s2.charCodeAt(i)),
      0,
    );
}

function hammingDistanceBuf(b1: Buffer, b2: Buffer): number {
  return b1.reduce((acc, cur, i) => acc + byteHammingDistance(b1[i], b2[i]), 0);
}

async function readAndDecode() {
  const file = await fs.promises.readFile('./src/set1/6.txt');
  return Buffer.from(file.toString('utf-8'), 'base64');
}

function findKeySizes(buf: Buffer) {
  const keyDistance: Array<KeySizeDistance> = [];
  const chunks: Buffer[] = [];
  for (let keySize = 2; keySize < 40; keySize++) {
    for (let j = 0; j < 4; j++) {
      chunks[j] = Buffer.from(buf.slice(j * keySize, j * keySize + keySize));
    }
    const distances = [];
    for (let k = 0; k < 4; k++) {
      for (let l = 0; l < 4; l++) {
        if (k !== l)
          distances.push(hammingDistanceBuf(chunks[k], chunks[l]) / keySize);
      }
    }
    const avgDist =
      distances.reduce((acc, cur) => acc + cur, 0) / distances.length;
    keyDistance.push([keySize, avgDist]);
  }
  keyDistance.sort((a, b) => a[1] - b[1]);
  return keyDistance.slice(0, 5);
}

export async function breakRepeatingKeyXor(): Promise<string[]> {
  const file = await readAndDecode();
  const keySizes = findKeySizes(file);
  const solutions = [];
  for (const keySize of keySizes.map((elem) => elem[0])) {
    console.log(`trying keysize ${keySize}`);
    // chunkify
    const chunks: Buffer[] = [];
    let i = 0;
    do {
      chunks.push(file.slice(i, i + keySize));
      i += keySize;
    } while (i < file.length);

    // transpose
    const transposed: Buffer[] = [];
    for (let i = 0; i < keySize; i++) {
      transposed[i] = Buffer.alloc(keySize);
      for (let j = 0; j < keySize; j++) transposed[i][j] = chunks[j][i];
    }

    // solve each block
    const solution = Buffer.alloc(keySize);
    transposed.forEach((block, blockIndex) => {
      const { key } = singleByteXor(block.toString('hex'));
      solution[blockIndex] = key;
    });
    solutions.push(solution);
  }

  const decoded = Buffer.from(
    repeatingKeyXor(file, solutions[1].toString('ascii')),
    'hex',
  ).toString('utf-8');
  console.log(`sol ${solutions[1]}:`, decoded);

  return solutions.map((solution) => solution.toString('ascii'));
}

/**
 * Challenge 7
 */

//  The Base64-encoded content in this file has been encrypted via AES-128 in ECB mode under the key

// "YELLOW SUBMARINE".
// (case-sensitive, without the quotes; exactly 16 characters;
// I like "YELLOW SUBMARINE" because it's exactly 16 bytes long, and now you do too).

// Decrypt it. You know the key, after all.

// Easiest way: use OpenSSL::Cipher and give it AES-128-ECB as the cipher.
export async function aesInECBMode(): Promise<string> {
  try {
    const file = await fs.promises.readFile('./src/set1/7.txt');
    const buf = Buffer.from(file.toString('utf-8'), 'base64');
    const decipher = crypto.createDecipheriv(
      'aes-128-ecb',
      'YELLOW SUBMARINE',
      null,
    );
    let decrypted = '';
    decrypted += decipher.update(buf);
    decrypted += decipher.final();
    return decrypted;
  } catch (err) {
    return err.message;
  }
}

/**
 * Challenge 8
 */
// In this file are a bunch of hex-encoded ciphertexts.

// One of them has been encrypted with ECB.

// Detect it.

// Remember that the problem with ECB is that it is stateless and deterministic;
// the same 16 byte plaintext block will always produce the same 16 byte ciphertext.

interface ECBDetection {
  repetitions: number;
  ecbCipherText: string;
}
export async function detectAESinECBmode(): Promise<ECBDetection> {
  const BLOCK_SIZE = 16;
  const file = await fs.promises.readFile('./src/set1/8.txt');
  const bufs = file
    .toString('utf-8')
    .split('\n')
    .map((line) => Buffer.from(line.trim(), 'hex'));
  let maxRepetitions = 0;
  let candidate: Buffer = Buffer.from('');
  bufs.forEach((buf) => {
    const chunks = R.splitEvery(BLOCK_SIZE, Array.from(buf));
    const repetitions = chunks.length - R.uniq(chunks).length;
    if (repetitions > maxRepetitions) {
      maxRepetitions = repetitions;
      candidate = buf;
    }
  });
  return {
    repetitions: maxRepetitions,
    ecbCipherText: candidate.toString('hex'),
  };
}
