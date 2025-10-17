---
title: MySQL Labsheet 4
date: 2025-10-17
category: MySql
tags: [MySQL, Praktikum]
author: Aruf
excerpt: memahami dan mampu mengimplementasi teori, konsep dan prinsip Pemodelan Data Relasional.
---

## 1. Buat database
Buat database dengan nama alif_farma
```mysql
CREATE DATABASE alif_farma;
```
## 2. Buat tabel obat, jual dan detailjual
### 2.1 Buat tabel obat
```mysql
CREATE TABLE obat(kodeobat VARCHAR(6),
namaobat VARCHAR(30),
harga INTEGER,
PRIMARY KEY(kodeobat));
```
### 2.2 Buat tabel jual
```mysql
CREATE TABLE jual(kodejual VARCHAR(7),
tgljual DATE,
PRIMARY KEY(kodejual));
```
### 2.3 Buat tabel detailjual
```mysql
CREATE TABLE detailjual(kodejual VARCHAR(7),
kodeobat VARCHAR(6),
jmljual INTEGER,
PRIMARY KEY(kodejual,kodeobat),
FOREIGN KEY (kodejual) REFERENCES jual(kodejual) ON DELETE
CASCADE ON UPDATE CASCADE,
FOREIGN KEY (kodeobat)
REFERENCES obat(kodeobat) ON DELETE CASCADE ON UPDATE
CASCADE);
```
## 3. Mengisi tabel obat, jual dan detailjual
### 3.1 Mengisi tabel obat
```mysql
INSERT INTO obat (kodeobat, namaobat, harga) VALUES
('AF0001', 'Asam Mefenamat', 7000),
('AF0002', 'Amoxilin', 6000),
('AF0003', 'Bisolvon', 12000),
('AF0004', 'Betametason', 15000),
('AF0005', 'Combantrin', 17000),
('AF0006', 'Caladine cair', 22000),
('AF0007', 'Paracetamol', 9000),
('AF0008', 'Gentamicyn', 3500),
('AF0009', 'Nystatin', 23500),
('AF0010', 'Rivanol', 7500),
('AF0011', 'Vicks', 12500);

```
### 3.2 Mengisi tabel jual
```mysql
INSERT INTO jual (kodejual, tgljual) VALUES
('PA00001', '2018-08-23'),
('PA00002', '2018-08-25'),
('PA00003', '2018-09-01'),
('PA00004', '2019-01-02'),
('PA00005', '2019-02-27');
```
### 3.3 Mengisi tabel detailjual
```mysql
INSERT INTO detailjual (kodejual, kodeobat, jmljual) VALUES
('PA00001', 'AF0006', 1),
('PA00001', 'AF0008', 3),
('PA00002', 'AF0001', 2),
('PA00002', 'AF0011', 1),
('PA00002', 'AF0009', 2),
('PA00003', 'AF0001', 1),
('PA00004', 'AF0007', 1),
('PA00004', 'AF0003', 2),
('PA00005', 'AF0001', 3),
('PA00005', 'AF0002', 4),
('PA00005', 'AF0009', 1),
('PA00005', 'AF0010', 2),
('PA00005', 'AF0004', 4);
```
## 4. Manipulasi Data pada Basis Data Relasional
### 4.1 Input
#### Buat transaksi ke-6 dengan perintah:
```mysql
INSERT INTO jual VALUES('PA00006', '2019-06-09');
```
#### Kemudian jika isi detailjual dengan perintah:
```mysql
INSERT INTO detailjual VALUES('PA005', 'AF0001',2);
INSERT INTO detailjual VALUES('PA00006', 'AF005',20);
```
Maka akan gagal/error
#### Jika kita isi detailjual dengan perintah :
```mysql
INSERT INTO detailjual VALUES('PA00006', 'AF0005',5);
INSERT INTO detailjual VALUES('PA00006', 'AF0008',3);
```
Hasilnya berhasil, hal ini terjadi karena detailjual memiliki FOREIGN KEY dari
tabel jual dan tabel obat jadi jika kodeobat dan kodejual tidak ada pada tabel
referensinya maka data tidak dapat diinputkan.
### 4.2 Penghapusan Data dari tabel referensinya
#### Hapus penghapus Vicks = AF0011 pada tabel obat
```mysql
DELETE FROM obat WHERE kodeobat='AF0011';
```
### 4.3 Perubahan data pada tabel referensiPerubahan data pada tabel referensi
#### Ubah data pada tabel jual yang tadinya kodejual=PA00006 menjadi PA00005
`!!Karna Labsheet nya T*l*l jadi kita akalin!!`
#### Delete dlu yang PA00005
```mysql
DELETE FROM jual WHERE kodejual='PA00005';
```
#### Baru kita Update
```mysql
UPDATE jual SET kodejual='PA00005' WHERE kodejual='PA00006';
```
## Latihan
### a) Tampilkan kodejual, namaobat, jmljual
```mysql
SELECT detailjual.kodejual, obat.namaobat, detailjual.jmljual
FROM detailjual
JOIN obat ON detailjual.kodeobat = obat.kodeobat;
```
### b) Tampilkan kodejual, tgljual, namaobat, harga, jmljual, total
```mysql
SELECT jual.kodejual, jual.tgljual, obat.namaobat, obat.harga,
       detailjual.jmljual, (obat.harga * detailjual.jmljual) AS total
FROM jual
JOIN detailjual ON jual.kodejual = detailjual.kodejual
JOIN obat ON detailjual.kodeobat = obat.kodeobat;

```
### c) Total penjualan per tanggal
```mysql
SELECT jual.tgljual, SUM(obat.harga * detailjual.jmljual) AS total_penjualan
FROM jual
JOIN detailjual ON jual.kodejual = detailjual.kodejual
JOIN obat ON detailjual.kodeobat = obat.kodeobat
GROUP BY jual.tgljual;
```