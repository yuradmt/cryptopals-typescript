import {
  hexToBase64,
  fixedBufferXor,
  singleByteXor,
  detectSingleByteXor,
  repeatingKeyXor,
  hammingDistance,
  breakRepeatingKeyXor,
  aesInECBMode,
} from '../src/set1';
describe('set 1', () => {
  it('converts hex to base64', () => {
    const res = hexToBase64(
      '49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d',
    );
    expect(res).toBe(
      'SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t',
    );
  });

  it('xors two fixed length buffers', () => {
    const b1 = Buffer.from('1c0111001f010100061a024b53535009181c', 'hex'),
      b2 = Buffer.from('686974207468652062756c6c277320657965', 'hex');
    expect(fixedBufferXor(b1, b2)).toBe('746865206b696420646f6e277420706c6179');
  });

  it('finds single byte xor', () => {
    const { decoded } = singleByteXor(
      '1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736',
    );
    expect(decoded).toBe("Cooking MC's like a pound of bacon");
  });

  it('detects a string encrypted with a single byte xor out of a file', async () => {
    const detected = await detectSingleByteXor();
    expect(detected.slice(0, 3)).toBe('Now');
  });

  it('encodes a string with repeating key xor', () => {
    expect(
      repeatingKeyXor(
        Buffer.from(
          "Burning 'em, if you ain't quick and nimble\nI go crazy when I hear a cymbal",
          'ascii',
        ),
        'ICE',
      ),
    ).toBe(
      '0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f',
    );
  });

  it('calculated hamming distance', () => {
    expect(hammingDistance('this is a test', 'wokka wokka!!!')).toBe(37);
  });

  it('breaks repeating-key XOR', async () => {
    const solutions = await breakRepeatingKeyXor();
    expect(solutions.includes('Terminator X: Bring the noise'));
  });

  it('deciphers AES in ECB mode', async () => {
    const decoded = await aesInECBMode();
    expect(decoded.slice(0, 8)).toBe("I'm back");
  });
});
