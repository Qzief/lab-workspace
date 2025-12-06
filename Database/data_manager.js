/**
 * Handles mock data and rendering for the Database Explorer section.
 */


const db = {
    supplier: [
        { id_supplier: 101, nama_supplier: "PT. Sumber Makmur", kontak: "021-555001" },
        { id_supplier: 102, nama_supplier: "CV. Elektro Jaya", kontak: "022-889102" },
        { id_supplier: 103, nama_supplier: "Global Impor Ltd", kontak: "supplier@global.com" }
    ],
    barang: [
        { id_barang: 5001, nama_barang: "Laptop ThinkPad X1", jumlah: 50, tanggal_masuk: "2025-01-10", status_pemeriksaan: "Lulus", kondisi: "Baru" },
        { id_barang: 5002, nama_barang: "Monitor Dell 24inch", jumlah: 20, tanggal_masuk: "2025-01-12", status_pemeriksaan: "Lulus", kondisi: "Baru" },
        { id_barang: 5003, nama_barang: "Keyboard Mech Key", jumlah: 100, tanggal_masuk: "2025-01-15", status_pemeriksaan: "Pending", kondisi: "Unknown" }
    ],
    penerimaan_barang: [
        { id_penerimaan: 9001, id_barang: 5001, id_supplier: 101, tanggal_penerimaan: "2025-01-10", status_penerimaan: "Complete" },
        { id_penerimaan: 9002, id_barang: 5002, id_supplier: 102, tanggal_penerimaan: "2025-01-12", status_penerimaan: "Complete" }
    ],
    gudang: [
        { id_gudang: 1, lokasi: "Jakarta Utara (Blok A)", penanggung_jawab: "Budi Santoso" },
        { id_gudang: 2, lokasi: "Cikarang Industrial", penanggung_jawab: "Siti Aminah" }
    ],
    stok_gudang: [
        { id_stok: 701, id_barang: 5001, id_gudang: 1, jumlah: 30, status: "Ready" },
        { id_stok: 702, id_barang: 5001, id_gudang: 2, jumlah: 20, status: "Ready" },
        { id_stok: 703, id_barang: 5002, id_gudang: 1, jumlah: 20, status: "Reserved" }
    ],
    distributor: [
        { id_distributor: 301, nama_distributor: "TokoKomputer.id", kontak: "sales@tokokomputer.id" },
        { id_distributor: 302, nama_distributor: "Retail Besar Mall", kontak: "0811-234-567" }
    ],
    pengiriman: [
        { id_pengiriman: 8801, id_barang: 5001, tujuan: "TokoKomputer.id HQ", tanggal: "2025-01-20", status: "Shipped" },
        { id_pengiriman: 8802, id_barang: 5002, tujuan: "Retail Besar Mall", tanggal: "2025-01-21", status: "Packing" }
    ],
    pembeli: [
        { id_pembeli: 10001, nama: "Andi Wijaya", kontak: "andi@gmail.com" },
        { id_pembeli: 10002, nama: "Rina Sari", kontak: "0812-9999-8888" }
    ],
    user: [
        { id_user: 1, nama: "Admin Gudang 1", role: "Warehouse_Admin" },
        { id_user: 2, nama: "Manager Logistik", role: "Manager" },
        { id_user: 3, nama: "Staff Finance", role: "Finance" }
    ]
};


const tableMeta = {
    supplier: { label: "Supplier", icon: "truck" },
    barang: { label: "Barang (Master)", icon: "box" },
    penerimaan_barang: { label: "Penerimaan", icon: "clipboard-list" },
    gudang: { label: "Gudang", icon: "warehouse" },
    stok_gudang: { label: "Stok Fisik", icon: "layers" },
    distributor: { label: "Distributor", icon: "store" },
    pengiriman: { label: "Pengiriman", icon: "send" },
    pembeli: { label: "Pembeli", icon: "users" },
    user: { label: "System Users", icon: "shield" }
};



export function initDataManager() {
    renderTabs();

    switchTable('supplier');
}

function renderTabs() {
    const container = document.getElementById('table-tabs');
    if (!container) return;

    container.innerHTML = Object.keys(db).map(key => {
        const meta = tableMeta[key] || { label: key, icon: 'table' };
        return `
            <button onclick="window.loadTable('${key}')" 
                class="tab-btn group flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap border-b-2 border-transparent hover:bg-slate-100 text-slate-500"
                data-table="${key}">
                <i data-lucide="${meta.icon}" class="w-4 h-4 opacity-70 group-hover:opacity-100"></i>
                ${meta.label}
            </button>
        `;
    }).join('');
    
    lucide.createIcons();
}


window.loadTable = function(tableName) {
    switchTable(tableName);
};

function switchTable(tableName) {

    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.table === tableName) {
            btn.classList.add('border-indigo-500', 'text-indigo-600', 'bg-white');
            btn.classList.remove('border-transparent', 'text-slate-500', 'hover:bg-slate-100');
        } else {
            btn.classList.remove('border-indigo-500', 'text-indigo-600', 'bg-white');
            btn.classList.add('border-transparent', 'text-slate-500', 'hover:bg-slate-100');
        }
    });


    const meta = tableMeta[tableName] || { label: tableName };
    document.getElementById('active-table-name').textContent = meta.label;
    document.getElementById('active-table-desc').textContent = `Viewing data for table: ${tableName}`;
    
    const data = db[tableName] || [];
    document.getElementById('record-count').textContent = `${data.length} records`;


    renderTableContent(data);
}

function renderTableContent(data) {
    const thead = document.getElementById('table-header-row');
    const tbody = document.getElementById('table-body');
    const emptyState = document.getElementById('empty-state');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }


    const columns = Object.keys(data[0]);
    columns.forEach(col => {
        const th = document.createElement('th');
        th.className = 'px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200';
        th.textContent = col.replace(/_/g, ' ');
        thead.appendChild(th);
    });


    data.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.className = idx % 2 === 0 ? 'bg-white hover:bg-slate-50 transition-colors' : 'bg-slate-50/50 hover:bg-slate-100 transition-colors';
        
        columns.forEach(col => {
            const td = document.createElement('td');
            td.className = 'px-6 py-3 text-sm text-slate-700 border-b border-slate-100 whitespace-nowrap';
            

            let val = row[col];
            if (col.includes('status') || col.includes('kondisi')) {
                td.innerHTML = getBadge(val);
            } else {
                td.textContent = val;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function getBadge(value) {
    let colorClass = 'bg-slate-100 text-slate-600';
    
    const v = value.toLowerCase();
    if (v === 'lulus' || v === 'complete' || v === 'ready' || v === 'shipped' || v === 'ok') colorClass = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    else if (v === 'pending' || v === 'packing' || v === 'reserved') colorClass = 'bg-amber-100 text-amber-700 border border-amber-200';
    else if (v === 'baru') colorClass = 'bg-blue-100 text-blue-700 border border-blue-200';
    else if (v === 'unknown' || v === 'fail') colorClass = 'bg-red-100 text-red-700 border border-red-200';

    return `<span class="px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}">${value}</span>`;
}
