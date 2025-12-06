/**
 * Contains the Mermaid syntax for the sequence diagrams.
 */

export const diagram1 = `
sequenceDiagram
    autonumber
    participant Supplier
    participant Admin as Admin Gudang
    participant Sistem

    Supplier->>Admin: Barang dikirim
    activate Admin
    Admin->>Sistem: inputDataBarang()
    activate Sistem
    Sistem->>Sistem: cekPencatatan()
    Sistem-->>Admin: data tersimpan
    deactivate Sistem
    
    Admin->>Sistem: evaluasiBarang()
    activate Sistem
    
    alt Barang tidak sesuai
        Sistem->>Supplier: returnBarang()
    else Barang sesuai
        Admin->>Sistem: prosesPembayaran()
    end
    deactivate Sistem
    deactivate Admin
`;

export const diagram2 = `
sequenceDiagram
    autonumber
    participant Sistem
    participant Gudang
    participant Distributor

    Sistem->>Gudang: barangMasuk()
    activate Gudang
    Gudang->>Sistem: kirimBarang()
    deactivate Gudang
    activate Sistem
    Sistem->>Distributor: notifikasiBarang()
    deactivate Sistem
    activate Distributor
    Distributor->>Sistem: cekKondisiBarang()
    activate Sistem
    
    alt Rusak
        Distributor->>Gudang: kembalikanBarang()
    else Bagus
        Distributor->>Sistem: konfirmasi()
    end
    deactivate Sistem
    deactivate Distributor
`;

export const diagram3 = `
sequenceDiagram
    autonumber
    participant Pembeli
    participant Distributor
    participant Sistem

    Pembeli->>Distributor: pesanBarang()
    activate Distributor
    Distributor->>Sistem: prosesPengiriman()
    activate Sistem
    Sistem->>Pembeli: barangDikirim()
    deactivate Sistem
    deactivate Distributor
`;
