import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

/**
 * Comprehensive descriptions for the consolidated flow.
 */
export const stepDescriptions = {
    "Barang dikirim": {
        title: "1. Pengiriman Awal",
        desc: "Supplier mengirimkan stok fisik dan dokumen jalan (DO) ke Gudang Penerimaan."
    },
    "inputDataBarang()": {
        title: "2. Digitalisasi Data",
        desc: "Admin Gudang memindai atau menginput manual detail barang ke dalam WMS (Warehouse Management System)."
    },
    "cekPencatatan()": {
        title: "3. Validasi Sistem",
        desc: "Sistem memverifikasi kelengkapan data dan mencegah duplikasi SKU sebelum penyimpanan."
    },
    "data tersimpan": {
        title: "4. Data Staging",
        desc: "Data masuk ke status 'Pending QC'. Belum masuk stok aktif."
    },
    "evaluasiBarang()": {
        title: "5. Quality Control (QC 1)",
        desc: "Pemeriksaan fisik oleh Admin Gudang terhadap cacat, kadaluarsa, atau kerusakan kemasan."
    },
    "returnBarang()": {
        title: "6a. Retur Supplier",
        desc: "[Kondisi Fail] Barang ditolak. Dokumen retur dicetak otomatis dan barang dikembalikan ke truk Supplier."
    },
    "prosesPembayaran()": {
        title: "6b. Approval Pembayaran",
        desc: "[Kondisi Pass] Barang diterima. Sistem memicu notifikasi ke Finance untuk pembayaran invoice."
    },
    "barangMasuk()": {
        title: "7. Stock Put-away",
        desc: "Barang dipindahkan ke rak penyimpanan. Status stok berubah menjadi 'On-Hand' di Sistem."
    },
    "kirimBarang()": {
        title: "8. Outbound Gudang",
        desc: "Gudang melakukan picking & packing sesuai permintaan Distributor, lalu menyerahkan ke armada logistik."
    },
    "notifikasiBarang()": {
        title: "9. Advance Shipping Notice",
        desc: "Sistem mengirim sinyal elektronik ke Distributor bahwa barang incoming (sedang jalan)."
    },
    "cekKondisiBarang()": {
        title: "10. QC Distributor (Inbound)",
        desc: "Distributor memeriksa kesesuaian fisik barang dengan notifikasi sistem saat barang tiba."
    },
    "kembalikanBarang()": {
        title: "11a. Retur ke Gudang Pusat",
        desc: "[Kondisi Fail] Barang rusak dalam perjalanan gudang-distributor. Dikembalikan untuk klaim asuransi/ganti."
    },
    "konfirmasi()": {
        title: "11b. GRN (Goods Receipt Note)",
        desc: "[Kondisi Pass] Distributor mengonfirmasi penerimaan. Stok kini tersedia untuk dijual ke end-user."
    },
    "pesanBarang()": {
        title: "12. Order Pelanggan",
        desc: "Pembeli melakukan checkout via aplikasi/web Distributor."
    },
    "prosesPengiriman()": {
        title: "13. Last Mile Delivery",
        desc: "Distributor memproses order, packing individual, dan menyerahkan ke kurir ekspedisi."
    },
    "barangDikirim()": {
        title: "14. Status Completed",
        desc: "Sistem mengirim nomor resi ke Pembeli dan menutup siklus transaksi."
    }
};

/**
 * Mermaid config optimized for embedding in a document.
 */
const mermaidConfig = {
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px',
        primaryColor: '#e0e7ff',       // Indigo-100
        primaryTextColor: '#1e293b',   // Slate-800
        primaryBorderColor: '#6366f1', // Indigo-500
        lineColor: '#64748b',          // Slate-500
        secondaryColor: '#ecfdf5',     // Emerald-50
        tertiaryColor: '#fff',
        
        actorBorder: '#4f46e5',        // Indigo-600
        actorBkg: '#eef2ff',           // Indigo-50
        actorTextColor: '#312e81',     // Indigo-900
        
        activationBorderColor: '#94a3b8',
        activationBkgColor: '#f8fafc',
        
        noteBkgColor: '#fff7ed',       // Orange-50
        noteBorderColor: '#fb923c',    // Orange-400
        noteTextColor: '#9a3412',      // Orange-800
        
        signalColor: '#334155',
        sequenceNumberColor: '#ffffff',
        
        mainBkg: '#ffffff'
    },
    sequence: {
        diagramMarginX: 20,
        diagramMarginY: 20,
        actorMargin: 50,
        width: 150,
        height: 55,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 40,
        mirrorActors: false,       // Cleaner look for report
        bottomMarginAdj: 1,
        useMaxWidth: false,
        showSequenceNumbers: true
    }
};

/**
 * Combined Sequence Diagram Definition.
 * Connects Supplier -> Gudang -> Distributor -> Pembeli seamlessly.
 */
const diagramDefinition = `
sequenceDiagram
    autonumber
    
    actor S as Supplier
    actor A as Admin Gudang
    participant Sys as Sistem
    participant G as Gudang (Fisik)
    actor D as Distributor
    actor P as Pembeli

    rect rgb(248, 250, 252)
        Note over S, Sys: FASE 1: INBOUND (SUPPLIER → GUDANG)
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
            Note right of S: Proses Berhenti
        else Barang Sesuai (OK)
            A->>Sys: prosesPembayaran()
            
            rect rgb(240, 253, 244)
                Note over Sys, D: FASE 2: STORAGE & TRANSFER (GUDANG → DISTRIBUTOR)
                Sys->>G: barangMasuk()
                activate G
                G->>Sys: kirimBarang()
                deactivate G
                
                Sys->>D: notifikasiBarang()
                activate D
                D->>Sys: cekKondisiBarang()
                
                alt Rusak di Jalan
                    D-->>G: kembalikanBarang()
                    Note right of D: Retur Internal
                else Kondisi Bagus (OK)
                    D->>Sys: konfirmasi()
                    
                    rect rgb(255, 251, 235)
                        Note over D, P: FASE 3: FULFILLMENT (DISTRIBUTOR → PEMBELI)
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

export async function initDiagram(onRenderSuccess) {
    mermaid.initialize(mermaidConfig);
    
    const element = document.querySelector('#mermaid-graph');
    const loader = document.querySelector('#loader');
    
    try {

        const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), diagramDefinition);
        element.innerHTML = svg;
        

        const svgElement = element.querySelector('svg');
        if (svgElement) {
            svgElement.style.height = 'auto';
            svgElement.style.width = '100%';
            svgElement.style.minWidth = '800px'; // Ensure readability
        }

        element.classList.remove('opacity-0');
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500); // Remove from DOM after fade
        
        if (onRenderSuccess) {
            onRenderSuccess();
        }
        
    } catch (error) {
        console.error('Mermaid render failed:', error);
        element.innerHTML = `
            <div class="text-red-600 p-6 text-center bg-red-50 rounded-lg">
                <p class="font-bold">Gagal memuat diagram</p>
                <p class="text-sm font-mono mt-2">${error.message}</p>
            </div>
        `;
        if(loader) loader.remove();
    }
}
