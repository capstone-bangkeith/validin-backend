-- CreateTable
CREATE TABLE "kodewilayah" (
    "kodewilayah" VARCHAR(20) NOT NULL,
    "provinsi" VARCHAR(255),
    "kabupatenkota" VARCHAR(255),
    "kecamatan" VARCHAR(255),

    CONSTRAINT "kodewilayah_pkey" PRIMARY KEY ("kodewilayah")
);

-- CreateTable
CREATE TABLE "ktp" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "nik" VARCHAR(255) NOT NULL,
    "alamat" VARCHAR(255) NOT NULL,
    "rt_rw" VARCHAR(255) NOT NULL,
    "kel_desa" VARCHAR(255) NOT NULL,
    "kecamatan" VARCHAR(255) NOT NULL,
    "agama" VARCHAR(50) NOT NULL,
    "status_perkawinan" VARCHAR(50) NOT NULL,
    "pekerjaan" VARCHAR(50) NOT NULL,
    "kewarganegaraan" VARCHAR(50) NOT NULL,

    CONSTRAINT "ktp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ktp_nik_key" ON "ktp"("nik");
