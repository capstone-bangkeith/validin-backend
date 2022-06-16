export type IQuerystring = {
  nik?: string;
  limit?: number;
  page?: number;
};

export type IQueryOcr = {
  rotate?: number;
  aggresive?: number;
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

export type Coordinate = {
  x: number;
  y: number;
};

export type IOCRBody = {
  ktp: {
    data: Buffer;
    filename: string;
    encoding: string;
    mimetype: string;
    limit: true;
  }[];
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
};

export type IHeaders = {
  token: string;
};
