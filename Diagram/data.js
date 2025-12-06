export const classData = [
    {
        name: "Supplier",
        attributes: [
            "id_supplier",
            "nama_supplier",
            "kontak"
        ],
        icon: "truck"
    },
    {
        name: "Barang",
        attributes: [
            "id_barang",
            "nama_barang",
            "jumlah",
            "tanggal_masuk",
            "status_pemeriksaan (sesuai / tidak)",
            "kondisi (baik / rusak)"
        ],
        icon: "package"
    },
    {
        name: "PenerimaanBarang",
        attributes: [
            "id_penerimaan",
            "id_barang (FK)",
            "id_supplier (FK)",
            "tanggal_penerimaan",
            "status_penerimaan"
        ],
        icon: "clipboard-check",
        relations: [
            { target: "Barang", type: "\"*\" --> \"1\"", label: "Memuat" },
            { target: "Supplier", type: "\"*\" --> \"1\"", label: "Dari" }
        ]
    },
    {
        name: "Gudang",
        attributes: [
            "id_gudang",
            "lokasi",
            "penanggung_jawab"
        ],
        icon: "warehouse"
    },
    {
        name: "StokGudang",
        attributes: [
            "id_stok",
            "id_barang (FK)",
            "id_gudang (FK)",
            "jumlah",
            "status"
        ],
        icon: "boxes",
        relations: [
            { target: "Barang", type: "\"*\" --> \"1\"", label: "Menyimpan" },
            { target: "Gudang", type: "\"*\" --> \"1\"", label: "Berada di" }
        ]
    },
    {
        name: "Distributor",
        attributes: [
            "id_distributor",
            "nama_distributor",
            "kontak"
        ],
        icon: "container"
    },
    {
        name: "Pengiriman",
        attributes: [
            "id_pengiriman",
            "id_barang (FK)",
            "tujuan",
            "tanggal",
            "status"
        ],
        icon: "send",
        relations: [
            { target: "Barang", type: "\"*\" --> \"1\"", label: "Mengirim" }
        ]
    },
    {
        name: "Pembeli",
        attributes: [
            "id_pembeli",
            "nama",
            "kontak"
        ],
        icon: "users"
    },
    {
        name: "User",
        attributes: [
            "id_user",
            "nama",
            "role (admin, gudang, distributor)"
        ],
        icon: "user-circle"
    }
];

export function generateMermaidDefinition() {
    let def = `classDiagram\n`;
    def += `    direction LR\n`; 


    classData.forEach(cls => {
        def += `    class ${cls.name} {\n`;
        cls.attributes.forEach(attr => {

            let cleanAttr = attr.replace(' (FK)', '')
                               .split('(')[0]
                               .trim();
            def += `        +${cleanAttr}\n`;
        });
        def += `    }\n`;
    });

    def += `\n`;


    classData.forEach(cls => {
        if (cls.relations) {
            cls.relations.forEach(rel => {
                def += `    ${cls.name} ${rel.type} ${rel.target} : ${rel.label}\n`;
            });
        }
    });


    def += `\n    note for Pengiriman "Tujuan Pengiriman:\\n1. Gudang -> Distributor\\n2. Distributor -> Pembeli"\n`;
    def += `    note for Barang "Status Pemeriksaan:\\n- Sesuai\\n- Tidak\\n\\nKondisi:\\n- Baik\\n- Rusak"\n`;

    return def;
}
