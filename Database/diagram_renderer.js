import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

export const stepDescriptions = {
    "Barang dikirim": { title: "1. Pengiriman Awal", desc: "Supplier mengirimkan stok fisik dan dokumen jalan (DO) ke Gudang Penerimaan." },
    "inputDataBarang()": { title: "2. Digitalisasi Data", desc: "Admin Gudang memindai atau menginput manual detail barang ke dalam WMS." },
    "cekPencatatan()": { title: "3. Validasi Sistem", desc: "Sistem memverifikasi kelengkapan data dan mencegah duplikasi SKU." },
    "data tersimpan": { title: "4. Data Staging", desc: "Data masuk ke status 'Pending QC'. Belum masuk stok aktif." },
    "evaluasiBarang()": { title: "5. Quality Control (QC 1)", desc: "Pemeriksaan fisik oleh Admin Gudang terhadap cacat atau kerusakan." },
    "returnBarang()": { title: "6a. Retur Supplier", desc: "Barang ditolak. Dokumen retur dicetak otomatis." },
    "prosesPembayaran()": { title: "6b. Approval Pembayaran", desc: "Barang diterima. Sistem memicu notifikasi ke Finance." },
    "barangMasuk()": { title: "7. Stock Put-away", desc: "Barang dipindahkan ke rak penyimpanan. Status stok 'On-Hand'." },
    "kirimBarang()": { title: "8. Outbound Gudang", desc: "Gudang melakukan picking & packing sesuai permintaan Distributor." },
    "notifikasiBarang()": { title: "9. Advance Shipping Notice", desc: "Sistem mengirim sinyal elektronik ke Distributor bahwa barang incoming." },
    "cekKondisiBarang()": { title: "10. QC Distributor (Inbound)", desc: "Distributor memeriksa kesesuaian fisik barang dengan notifikasi sistem." },
    "kembalikanBarang()": { title: "11a. Retur ke Gudang Pusat", desc: "Barang rusak dalam perjalanan dikembalikan." },
    "konfirmasi()": { title: "11b. GRN (Goods Receipt Note)", desc: "Distributor mengonfirmasi penerimaan. Stok tersedia untuk dijual." },
    "pesanBarang()": { title: "12. Order Pelanggan", desc: "Pembeli melakukan checkout via aplikasi/web Distributor." },
    "prosesPengiriman()": { title: "13. Last Mile Delivery", desc: "Distributor memproses order dan menyerahkan ke kurir." },
    "barangDikirim()": { title: "14. Status Completed", desc: "Sistem mengirim nomor resi ke Pembeli." }
};

const mermaidConfig = {
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        primaryColor: '#e0e7ff',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#6366f1',
        lineColor: '#64748b',
        secondaryColor: '#ecfdf5',
        tertiaryColor: '#fff',
        actorBorder: '#4f46e5',
        actorBkg: '#eef2ff',
        actorTextColor: '#312e81',
        noteBkgColor: '#fff7ed',
        noteBorderColor: '#fb923c',
        mainBkg: '#ffffff'
    },
    sequence: {
        diagramMarginX: 10,
        diagramMarginY: 10,
        actorMargin: 40,
        width: 140,
        height: 50,
        boxMargin: 10,
        messageMargin: 35,
        mirrorActors: false,
        showSequenceNumbers: true
    }
};

const sequenceDefinition = `
sequenceDiagram
    autonumber
    actor S as Supplier
    actor A as Admin Gudang
    participant Sys as Sistem
    participant G as Gudang (Fisik)
    actor D as Distributor
    actor P as Pembeli

    rect rgb(248, 250, 252)
        Note over S, Sys: FASE 1: INBOUND
        S->>A: Barang dikirim
        activate A
        A->>Sys: inputDataBarang()
        activate Sys
        Sys->>Sys: cekPencatatan()
        Sys-->>A: data tersimpan
        deactivate Sys
        A->>Sys: evaluasiBarang()
        activate Sys
        alt Barang Tidak Sesuai
            Sys-->>S: returnBarang()
        else Barang Sesuai (OK)
            A->>Sys: prosesPembayaran()
            rect rgb(240, 253, 244)
                Note over Sys, D: FASE 2: STORAGE & TRANSFER
                Sys->>G: barangMasuk()
                activate G
                G->>Sys: kirimBarang()
                deactivate G
                Sys->>D: notifikasiBarang()
                activate D
                D->>Sys: cekKondisiBarang()
                alt Rusak di Jalan
                    D-->>G: kembalikanBarang()
                else Kondisi Bagus (OK)
                    D->>Sys: konfirmasi()
                    rect rgb(255, 251, 235)
                        Note over D, P: FASE 3: FULFILLMENT
                        P->>D: pesanBarang()
                        activate P
                        D->>Sys: prosesPengiriman()
                        Sys-->>P: barangDikirim()
                        deactivate P
                    end
                end
                deactivate D
            end
        end
        deactivate Sys
        deactivate A
    end
`;

const erdDefinition = `
erDiagram
    SUPPLIER ||--o{ PENERIMAAN_BARANG : sends
    BARANG ||--o{ PENERIMAAN_BARANG : listed_in
    BARANG ||--o{ STOK_GUDANG : stored_in
    GUDANG ||--o{ STOK_GUDANG : contains
    BARANG ||--o{ PENGIRIMAN : included_in
    DISTRIBUTOR ||--o{ PENGIRIMAN : receives
    
    SUPPLIER {
        int id_supplier PK
        string nama_supplier
        string kontak
    }
    BARANG {
        int id_barang PK
        string nama_barang
        int jumlah
        date tanggal_masuk
        string status_pemeriksaan
        string kondisi
    }
    PENERIMAAN_BARANG {
        int id_penerimaan PK
        int id_barang FK
        int id_supplier FK
        date tanggal_penerimaan
        string status_pemeriksaan
    }
    GUDANG {
        int id_gudang PK
        string lokasi
        string penanggung_jawab
    }
    STOK_GUDANG {
        int id_stok PK
        int id_barang FK
        int id_gudang FK
        int jumlah
        string status
    }
    DISTRIBUTOR {
        int id_distributor PK
        string nama_distributor
        string kontak
    }
    PENGIRIMAN {
        int id_pengiriman PK
        int id_barang FK
        string tujuan
        date tanggal
        string status
    }
    PEMBELI {
        int id_pembeli PK
        string nama
        string kontak
    }
    USER {
        int id_user PK
        string nama
        string role
    }
`;

export async function initDiagrams(onSeqRenderSuccess) {
    mermaid.initialize(mermaidConfig);
    

    await renderDiagram('#mermaid-graph', sequenceDefinition, '#loader-seq', onSeqRenderSuccess);
    

    await renderDiagram('#mermaid-erd', erdDefinition, '#loader-erd');
}

async function renderDiagram(selector, definition, loaderSelector, callback) {
    const element = document.querySelector(selector);
    const loader = document.querySelector(loaderSelector);
    if(!element) return;

    try {
        const id = 'mermaid-svg-' + Math.random().toString(36).substr(2, 9);
        const { svg } = await mermaid.render(id, definition);
        element.innerHTML = svg;
        
        const svgElement = element.querySelector('svg');
        if (svgElement) {
            svgElement.style.height = '100%';
            svgElement.style.width = '100%';
        }

        element.classList.remove('opacity-0');
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
        if (callback) callback();
    } catch (error) {
        console.error(`Mermaid render failed for ${selector}:`, error);
        element.innerHTML = `<div class="text-red-500 text-xs p-4">Failed to render diagram.</div>`;
        if(loader) loader.remove();
    }
}
