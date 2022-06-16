export type IQuerystring = {
  uid?: string;
  limit?: number;
  page?: number;
};

export type IParams = {
  uid: string;
};

export type IHeaders = {
  uname: string;
  pass: string;
};

export type IBody = {
  nama: string;
  nik: string;
  kota: string;
  provinsi: string;
  ttl: string;
  jenis_kelamin: string;
  alamat: string;
  rt_rw: string;
  kel_desa: string;
  kecamatan: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
};
