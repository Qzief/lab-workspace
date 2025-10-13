---
title: How To Get Unlimited Money
date: 2025-10-13
category: Mysql
tags: ["Praktikum", "Data"]
author: LEON
excerpt: Awokawok
---

# Labsheet 3 - MySQL

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
### Tabel Mata Kuliah
```mysql
create table mk (
kodeMK varchar(6) primary key,
namaMK varchar(30),
sks int
);
```
### Tabel Pengambilan Mata Kuliah
```mysql
create table ambilMK (
nim varchar(7),
kodeMK varchar(6),
nilai int,
primary key (nim, kodeMK)
);
```

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
### Table Mata Kuliah
```mysql
insert into mk (kodeMK, namaMK, sks) values
('5P5257', 'Logika Samar', 2),
('5P5258', 'Sistem Terdistribusi', 2),
('5P5148', 'Praktikum Teknik Multimedia', 1),
('5W5247', 'Teknik Multimedia', 2),
('5W5249', 'Teknik Riset Operasional', 2),
('5W5250', 'Basis Data II', 2),
('5W5251', 'Praktikum Basis Data II', 2),
('5W5252', 'Metode Numerik', 2),
('5W5253', 'Metode Penelitian', 2);
```
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
## 