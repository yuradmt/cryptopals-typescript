type frequency = [string, number];
const letterFrequency: frequency[] = [
  [`z`, 9],
  [`q`, 12],
  [`j`, 16],
  [`x`, 23],
  [`k`, 54],
  [`v`, 105],
  [`b`, 148],
  [`y`, 166],
  [`w`, 168],
  [`g`, 187],
  [`p`, 214],
  [`f`, 240],
  [`m`, 251],
  [`u`, 273],
  [`c`, 334],
  [`d`, 382],
  [`l`, 407],
  [`h`, 505],
  [`r`, 628],
  [`s`, 651],
  [`n`, 723],
  [`i`, 757],
  [`o`, 764],
  [`a`, 804],
  [`t`, 928],
  [`e`, 1249],
  [` `, 1300],
];

export function letterScore(ch: string): number {
  const elem = letterFrequency.find((elem) => elem[0] === ch[0]);
  return elem ? elem[1] / 100 : 0;
}
