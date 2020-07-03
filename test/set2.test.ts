import {
  pkcs7Padding,
  aesInECBModeEncrypt,
  aesInECBModeDecrypt,
  cbcModeDecrypt,
} from '../src/set2';

describe('it tests set2', () => {
  it('performs PKCS#7 padding', () => {
    const padded = pkcs7Padding(Buffer.from('YELLOW SUBMARINE', 'utf-8'), 20);
    console.log(padded);
    expect(padded.toString('utf-8')).toBe('YELLOW SUBMARINE\x04\x04\x04\x04');
  });

  it('decrypts file encrypted with AES CBC mode', async () => {
    const decoded = await cbcModeDecrypt();
    expect(decoded.slice(0, 8)).toBe("I'm back");
  });
});
