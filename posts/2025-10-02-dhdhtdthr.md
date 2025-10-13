---
title: dhdhtdthr
date: 2025-10-02
category: drthtrthr
tags: ["dthhdhd"]
author: drthdthr
excerpt: hdhtdh drhtdh
---

---
title: MySQL Labsheet 3
date: 2025-10-11
category: MySql
tags: [MySQL, Praktikum]
author: Aruf
excerpt: Mengimplementasi teori, konsep dan prinsip pemograman database MySQL menggunakan perintah multi tabel.
---

# Labsheet 3 - MySQL

Mengimplementasi teori, konsep dan prinsip pemograman database MySQL menggunakan perintah multi tabel.

## Buat database

```mysql
create database akademik;
```

## Buat tabel

### Tabel Mahasiswa

```mysql
create table mhs (
nim varchar(7) primary key,
nama varchar(30)
);
```

<br>

### Tabel Mata Kuliah

```mysql
create table mk (
kodeMK varchar(6) primary key,
namaMK varchar(30),
sks int
);
```

<br>

### Tabel Pengambilan Mata Kuliah

```mysql
create table ambilMK (
nim varchar(7),
kodeMK varchar(6),
nilai int,
primary key (nim, kodeMK)
);
```

<br>

## Isi Data Table

### Table Mahasiswa

```mysql
insert into mhs (nim, nama) values
('1543002', 'Andi Dahlia'),
('1543003', 'Doni Kusuma'),
('1543004', 'Dianita Fajri'),
('1543005', 'Farida Anisa'),
('1543006', 'Fajlur Rohman'),
('1543007', 'Herianto Arbie'),
('1543008', 'Heru Pahlawanto'),
('1543009', 'Ikke Anindita'),
('1543010', 'Ilyas Ramadhan'),
('1543011', 'Joko Utomo');
```

<br>

### Table Mata Kuliah

```mysql
insert into mk (kodeMK, namaMK, sks) values
('5P5257', 'Logika Samar', 2),
('5P5258', 'Sistem Terdistribusi', 2),
('5W5148', 'Praktikum Teknik Multimedia', 1),
('5W5247', 'Teknik Multimedia', 2),
('5W5249', 'Teknik Riset Operasional', 2),
('5W5250', 'Basis Data II', 2),
('5W5251', 'Praktikum Basis Data II', 2),
('5W5252', 'Metode Numerik', 2),
('5W5253', 'Metode Penelitian', 2);
```

<br>

### Table Pengambilan Mata Kuliah

```mysql
insert into ambilMK (nim, kodeMK, nilai) values
('1543002', '5P5257', 3),
('1543002', '5W5148', 4),
('1543002', '5W5247', 3),
('1543002', '5W5249', 3),
('1543002', '5W5250', 4),
('1543002', '5W5251', 4),
('1543002', '5W5252', 2),
('1543003', '5P5257', 3),
('1543003', '5W5148', 3),
('1543003', '5W5247', 4),
('1543003', '5W5249', 3),
('1543003', '5W5250', 4),
('1543003', '5W5251', 4),
('1543004', '5P5257', 2),
('1543004', '5W5148', 2),
('1543004', '5W5247', 2),
('1543004', '5W5249', 2),
('1543004', '5W5250', 2),
('1543004', '5W5251', 2);
```

<br>

## Menampilkan sebagian data dari dua tabel atau lebih

```mysql
SELECT mhs.nim, mhs.nama
FROM mhs, mk, ambilMK
WHERE mhs.nim = ambilMK.nim
AND mk.kodeMK = ambilMK.kodeMK
AND mk.namaMK = 'Basis Data II';
```

atau

```mysql
SELECT ambilMK.nim, mhs.nama
FROM mhs, mk, ambilMK
WHERE mhs.nim = ambilMK.nim
AND mk.kodeMK = ambilMK.kodeMK
AND mk.namaMK = 'Basis Data II';
```

<br>

#### pengambilan data berdasarkan kodeMK bukan namaMK

```mysql
SELECT mhs.nim, mhs.nama
FROM mhs, ambilMK
WHERE mhs.nim = ambilMK.nim
AND ambilMK.kodeMK = '5W5250';
```

<br>

### Menampilkan nim, nama mahasiswa dan jumlah SKS matakuliah yang diambil setiap mahasiswa.

```mysql
SELECT mhs.nim, mhs.nama, SUM(mk.sks)
AS jmlSKS
FROM mhs, mk, ambilMK
WHERE mhs.nim = ambilMK.nim
AND mk.kodeMK = ambilMK.kodeMK
GROUP BY ambilMK.nim;
```

<br>

###

```mysql
SELECT SUM(ambilMK.nilai\*mk.sks) / SUM(mk.sks)AS IPK FROM
ambilMK, mk WHERE ambilMK.kodeMK = mk.kodeMK AND
ambilMK.nim = '1543002';
```

<br>

```mysql
SELECT mhs.nim, mhs.nama, SUM(ambilMK.nilai\*mk.sks)/SUM(mk.sks)AS
IPK FROM mhs,ambilMK,mk WHERE mhs.nim=ambilMK.nim AND
ambilMK.kodeMK=mk.kodeMK GROUP BY mhs.nim;
```

<br>

## Tugas Latihan

### No 1

```mysql
INSERT INTO ambilMK (nim, kodeMK, nilai) VALUES
('1543005', '5W5250', 2),
('1543005', '5W5249', 3),
('1543006', '5W5250', 4),
('1543006', '5W5251', 3),
('1543007', '5W5250', 3),
('1543007', '5W5247', 2),
('1543008', '5W5252', 3),
('1543008', '5W5253', 4),
('1543009', '5W5250', 4),
('1543009', '5W5249', 3),
('1543010', '5W5251', 4),
('1543010', '5W5247', 2),
('1543011', '5W5252', 3),
('1543011', '5W5253', 4);
```

<br>

```mysql
SELECT mhs.nim, mhs.nama, mk.namaMK AS MataKuliah
FROM ambilMK
JOIN mhs ON ambilMK.nim = mhs.nim
JOIN mk ON ambilMK.kodeMK = mk.kodeMK
ORDER BY mhs.nim;
```

<br>

### No 2

```mysql
SELECT mhs.nama,
SUM(mk.sks) AS jmlSKS,
ROUND(AVG(ambilMK.nilai), 2) AS IPK
FROM mhs
JOIN ambilMK ON mhs.nim = ambilMK.nim
JOIN mk ON ambilMK.kodeMK = mk.kodeMK
GROUP BY mhs.nim, mhs.nama
ORDER BY mhs.nim;
```

<br>

### No 3

```mysql
CREATE TABLE dosen (
nidn VARCHAR(10) PRIMARY KEY,
namaDosen VARCHAR(40)
);
```

<br>

```mysql
CREATE TABLE ajar (
nidn VARCHAR(10),
kodeMK VARCHAR(6),
PRIMARY KEY (nidn, kodeMK),
FOREIGN KEY (nidn) REFERENCES dosen(nidn),
FOREIGN KEY (kodeMK) REFERENCES mk(kodeMK)
);
```

<br>

### No 4

```mysql
SELECT mk.namaMK,dosen.namaDosen
FROM mk
JOIN ajar ON mk.kodeMK = ajar.kodeMK
JOIN dosen ON ajar.nidn = dosen.nidn
ORDER BY mk.kodeMK;
```

<br>

### No 5

```mysql
SELECT
mhs.nim,
mhs.nama AS namaMahasiswa,
mk.namaMK,
dosen.namaDosen
FROM ambilMK
JOIN mhs ON ambilMK.nim = mhs.nim
JOIN mk ON ambilMK.kodeMK = mk.kodeMK
JOIN ajar ON mk.kodeMK = ajar.kodeMK
JOIN dosen ON ajar.nidn = dosen.nidn
ORDER BY mhs.nim;
```
