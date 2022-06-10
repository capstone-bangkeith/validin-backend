import { Spellcheck } from 'natural';

export const corpus = [
  'provinsi',
  'kota',
  'kabupaten',
  'nama',
  'jenis',
  'kelamin',
  'alamat',
  'kecamatan',
  'agama',
  'status',
  'perkawinan',
  'pekerjaan',
  'kewarganegaraan',
  'berlaku',
  'hingga',
  'seumur',
  'hidup',
  'belum',
  'kawin',
  'islam',
  'kristen',
  'katholik',
  'hindu',
  'buddha',
  'laki-laki',
  'perempuan',
  'cerai',
  'hidup',
  'mati',
];

export const spellCheck = new Spellcheck(corpus);

export const getCorrections = (word: string) => {
  return spellCheck.getCorrections(word, 1);
};
