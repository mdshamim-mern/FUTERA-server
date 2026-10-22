import {productSchema,categoryCodes,categoryLabels} from "./schema.ts";
const records = [
  {
    "slug": "amd-ryzen-5-7600x",
    "name": "AMD Ryzen 5 7600X",
    "brand": "AMD",
    "category": "cpu",
    "sku": "REF-RYZEN-5-7600X",
    "description": "6-core AM5 desktop processor. Compare the published core count and power specification; no local retail offer is supplied.",
    "specs": {
      "socket": "AM5",
      "cores": 6,
      "threads": 12,
      "boostGHz": 5.3,
      "tdp": 105,
      "integratedGraphics": null
    },
    "sourceUrl": "https://www.amd.com/en/partner/articles/amd-ryzen-7000-series-desktop-processors.html",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/cpu.svg",
        "alt": "Original cpu category diagram; not a photograph of AMD Ryzen 5 7600X"
      }
    ]
  },
  {
    "slug": "amd-ryzen-7-7700x",
    "name": "AMD Ryzen 7 7700X",
    "brand": "AMD",
    "category": "cpu",
    "sku": "REF-RYZEN-7-7700X",
    "description": "8-core AM5 desktop processor. Compare the published core count and power specification; no local retail offer is supplied.",
    "specs": {
      "socket": "AM5",
      "cores": 8,
      "threads": 16,
      "boostGHz": 5.4,
      "tdp": 105,
      "integratedGraphics": null
    },
    "sourceUrl": "https://www.amd.com/en/partner/articles/amd-ryzen-7000-series-desktop-processors.html",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/cpu.svg",
        "alt": "Original cpu category diagram; not a photograph of AMD Ryzen 7 7700X"
      }
    ]
  },
  {
    "slug": "amd-ryzen-9-7900x",
    "name": "AMD Ryzen 9 7900X",
    "brand": "AMD",
    "category": "cpu",
    "sku": "REF-RYZEN-9-7900X",
    "description": "12-core AM5 desktop processor. Compare the published core count and power specification; no local retail offer is supplied.",
    "specs": {
      "socket": "AM5",
      "cores": 12,
      "threads": 24,
      "boostGHz": 5.6,
      "tdp": 170,
      "integratedGraphics": null
    },
    "sourceUrl": "https://www.amd.com/en/partner/articles/amd-ryzen-7000-series-desktop-processors.html",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/cpu.svg",
        "alt": "Original cpu category diagram; not a photograph of AMD Ryzen 9 7900X"
      }
    ]
  },
  {
    "slug": "amd-ryzen-9-7950x",
    "name": "AMD Ryzen 9 7950X",
    "brand": "AMD",
    "category": "cpu",
    "sku": "REF-RYZEN-9-7950X",
    "description": "16-core AM5 desktop processor. Compare the published core count and power specification; no local retail offer is supplied.",
    "specs": {
      "socket": "AM5",
      "cores": 16,
      "threads": 32,
      "boostGHz": 5.7,
      "tdp": 170,
      "integratedGraphics": null
    },
    "sourceUrl": "https://www.amd.com/en/partner/articles/amd-ryzen-7000-series-desktop-processors.html",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/cpu.svg",
        "alt": "Original cpu category diagram; not a photograph of AMD Ryzen 9 7950X"
      }
    ]
  },
  {
    "slug": "crucial-p3-plus-500gb",
    "name": "Crucial P3 Plus 500GB",
    "brand": "Crucial",
    "category": "ssd",
    "sku": "CT500P3PSSD8",
    "description": "M.2 NVMe storage reference. Sequential read figures are manufacturer maxima, not measurements from a FUTERA test.",
    "specs": {
      "capacityGb": 500,
      "interface": "NVMe",
      "formFactor": "M.2 2280",
      "readMBps": 4700
    },
    "sourceUrl": "https://www.crucial.com/content/dam/crucial/ssd-products/p3-plus/flyers/b2c/crucial-p3plus-productflyer-consumer.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/ssd.svg",
        "alt": "Original ssd category diagram; not a photograph of Crucial P3 Plus 500GB"
      }
    ]
  },
  {
    "slug": "crucial-p3-plus-1000gb",
    "name": "Crucial P3 Plus 1TB",
    "brand": "Crucial",
    "category": "ssd",
    "sku": "CT1000P3PSSD8",
    "description": "M.2 NVMe storage reference. Sequential read figures are manufacturer maxima, not measurements from a FUTERA test.",
    "specs": {
      "capacityGb": 1000,
      "interface": "NVMe",
      "formFactor": "M.2 2280",
      "readMBps": 5000
    },
    "sourceUrl": "https://www.crucial.com/content/dam/crucial/ssd-products/p3-plus/flyers/b2c/crucial-p3plus-productflyer-consumer.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/ssd.svg",
        "alt": "Original ssd category diagram; not a photograph of Crucial P3 Plus 1TB"
      }
    ]
  },
  {
    "slug": "crucial-p3-plus-2000gb",
    "name": "Crucial P3 Plus 2TB",
    "brand": "Crucial",
    "category": "ssd",
    "sku": "CT2000P3PSSD8",
    "description": "M.2 NVMe storage reference. Sequential read figures are manufacturer maxima, not measurements from a FUTERA test.",
    "specs": {
      "capacityGb": 2000,
      "interface": "NVMe",
      "formFactor": "M.2 2280",
      "readMBps": 5000
    },
    "sourceUrl": "https://www.crucial.com/content/dam/crucial/ssd-products/p3-plus/flyers/b2c/crucial-p3plus-productflyer-consumer.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/ssd.svg",
        "alt": "Original ssd category diagram; not a photograph of Crucial P3 Plus 2TB"
      }
    ]
  },
  {
    "slug": "crucial-p3-plus-4000gb",
    "name": "Crucial P3 Plus 4TB",
    "brand": "Crucial",
    "category": "ssd",
    "sku": "CT4000P3PSSD8",
    "description": "M.2 NVMe storage reference. Sequential read figures are manufacturer maxima, not measurements from a FUTERA test.",
    "specs": {
      "capacityGb": 4000,
      "interface": "NVMe",
      "formFactor": "M.2 2280",
      "readMBps": 4800
    },
    "sourceUrl": "https://www.crucial.com/content/dam/crucial/ssd-products/p3-plus/flyers/b2c/crucial-p3plus-productflyer-consumer.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/ssd.svg",
        "alt": "Original ssd category diagram; not a photograph of Crucial P3 Plus 4TB"
      }
    ]
  },
  {
    "slug": "corsair-rm650-2021",
    "name": "Corsair RM650 (2021)",
    "brand": "Corsair",
    "category": "psu",
    "sku": "REF-RM650-2021",
    "description": "Fully modular ATX power supply from the 2021 RM series. Connector counts are not entered here; check the exact regional package before choosing cables.",
    "specs": {
      "wattage": 650,
      "formFactor": "ATX",
      "efficiency": null,
      "connectors": null,
      "modular": true
    },
    "sourceUrl": "https://assets.corsair.com/image/upload/corsairmedia/sys_master/productcontent/WW_RM_Series_2021_QSG_Web_AA.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/psu.svg",
        "alt": "Original psu category diagram; not a photograph of Corsair RM650 (2021)"
      }
    ]
  },
  {
    "slug": "corsair-rm750-2021",
    "name": "Corsair RM750 (2021)",
    "brand": "Corsair",
    "category": "psu",
    "sku": "REF-RM750-2021",
    "description": "Fully modular ATX power supply from the 2021 RM series. Connector counts are not entered here; check the exact regional package before choosing cables.",
    "specs": {
      "wattage": 750,
      "formFactor": "ATX",
      "efficiency": null,
      "connectors": null,
      "modular": true
    },
    "sourceUrl": "https://assets.corsair.com/image/upload/corsairmedia/sys_master/productcontent/WW_RM_Series_2021_QSG_Web_AA.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/psu.svg",
        "alt": "Original psu category diagram; not a photograph of Corsair RM750 (2021)"
      }
    ]
  },
  {
    "slug": "corsair-rm850-2021",
    "name": "Corsair RM850 (2021)",
    "brand": "Corsair",
    "category": "psu",
    "sku": "REF-RM850-2021",
    "description": "Fully modular ATX power supply from the 2021 RM series. Connector counts are not entered here; check the exact regional package before choosing cables.",
    "specs": {
      "wattage": 850,
      "formFactor": "ATX",
      "efficiency": null,
      "connectors": null,
      "modular": true
    },
    "sourceUrl": "https://assets.corsair.com/image/upload/corsairmedia/sys_master/productcontent/WW_RM_Series_2021_QSG_Web_AA.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/psu.svg",
        "alt": "Original psu category diagram; not a photograph of Corsair RM850 (2021)"
      }
    ]
  },
  {
    "slug": "kf552c40bbk2-32",
    "name": "Kingston KF552C40BBK2-32",
    "brand": "Kingston",
    "category": "ram",
    "sku": "KF552C40BBK2-32",
    "description": "32GB DDR5 kit containing two 16GB modules. Advertised profile speed depends on motherboard and processor support.",
    "specs": {
      "ramType": "DDR5",
      "capacityGb": 32,
      "modules": 2,
      "speedMts": 5200
    },
    "sourceUrl": "https://www.kingston.com/datasheets/KF552C40BBK2-32.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/ram.svg",
        "alt": "Original ram category diagram; not a photograph of Kingston KF552C40BBK2-32"
      }
    ]
  },
  {
    "slug": "kf556c40bbk2-32",
    "name": "Kingston KF556C40BBK2-32",
    "brand": "Kingston",
    "category": "ram",
    "sku": "KF556C40BBK2-32",
    "description": "32GB DDR5 kit containing two 16GB modules. Advertised profile speed depends on motherboard and processor support.",
    "specs": {
      "ramType": "DDR5",
      "capacityGb": 32,
      "modules": 2,
      "speedMts": 5600
    },
    "sourceUrl": "https://www.kingston.com/datasheets/KF556C40BBK2-32.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/ram.svg",
        "alt": "Original ram category diagram; not a photograph of Kingston KF556C40BBK2-32"
      }
    ]
  },
  {
    "slug": "kvr48u40bd8-32",
    "name": "Kingston KVR48U40BD8-32",
    "brand": "Kingston",
    "category": "ram",
    "sku": "KVR48U40BD8-32",
    "description": "Single 32GB DDR5 module with a 4800 MT/s specification. Check board support and remaining memory slots.",
    "specs": {
      "ramType": "DDR5",
      "capacityGb": 32,
      "modules": 1,
      "speedMts": 4800
    },
    "sourceUrl": "https://www.kingston.com/datasheets/KVR48U40BD8-32.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/ram.svg",
        "alt": "Original ram category diagram; not a photograph of Kingston KVR48U40BD8-32"
      }
    ]
  },
  {
    "slug": "msi-b650-gaming-plus-wifi",
    "name": "MSI B650 GAMING PLUS WIFI",
    "brand": "MSI",
    "category": "motherboard",
    "sku": "REF-B650-GAMING-PLUS-WIFI",
    "description": "AM5 motherboard with four DDR5 slots and two M.2 slots. Memory limits and BIOS support must be confirmed for the exact CPU and board revision.",
    "specs": {
      "socket": "AM5",
      "chipset": "B650",
      "ramType": "DDR5",
      "ramSlots": 4,
      "maxRamGb": null,
      "maxRamSpeedMts": null,
      "formFactor": "ATX",
      "m2Slots": 2,
      "m2Interfaces": [
        "NVMe"
      ],
      "sataPorts": 4,
      "biosNote": "Check the manufacturer CPU support list and installed BIOS.",
      "biosStatus": null,
      "powerConnectors": null
    },
    "sourceUrl": "https://storage-asset.msi.com/datasheet/mb/vn/B650-GAMING-PLUS-WIFI.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/motherboard.svg",
        "alt": "Original motherboard category diagram; not a photograph of MSI B650 GAMING PLUS WIFI"
      }
    ]
  },
  {
    "slug": "msi-b650m-gaming-plus-wifi",
    "name": "MSI B650M GAMING PLUS WIFI",
    "brand": "MSI",
    "category": "motherboard",
    "sku": "REF-B650M-GAMING-PLUS-WIFI",
    "description": "AM5 motherboard with four DDR5 slots and two M.2 slots. Memory limits and BIOS support must be confirmed for the exact CPU and board revision.",
    "specs": {
      "socket": "AM5",
      "chipset": "B650",
      "ramType": "DDR5",
      "ramSlots": 4,
      "maxRamGb": null,
      "maxRamSpeedMts": null,
      "formFactor": null,
      "m2Slots": 2,
      "m2Interfaces": [
        "NVMe"
      ],
      "sataPorts": 4,
      "biosNote": "Check the manufacturer CPU support list and installed BIOS.",
      "biosStatus": null,
      "powerConnectors": null
    },
    "sourceUrl": "https://storage-asset.msi.com/datasheet/mb/in/B650M-GAMING-PLUS-WIFI.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/motherboard.svg",
        "alt": "Original motherboard category diagram; not a photograph of MSI B650M GAMING PLUS WIFI"
      }
    ]
  },
  {
    "slug": "noctua-nh-u12s",
    "name": "Noctua NH-U12S",
    "brand": "Noctua",
    "category": "cpu-cooler",
    "sku": "REF-NH-U12S",
    "description": "Air cooler reference with published overall height. Mounting accessories vary by package age; thermal suitability remains unknown without an applicable manufacturer rating.",
    "specs": {
      "sockets": null,
      "coolerHeightMm": 158,
      "tdp": null,
      "radiatorMm": 0,
      "type": "Air"
    },
    "sourceUrl": "https://cdn.noctua.at/media/noctua_nh_u12s_infosheet_en_web.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/cpu-cooler.svg",
        "alt": "Original cpu-cooler category diagram; not a photograph of Noctua NH-U12S"
      }
    ]
  },
  {
    "slug": "noctua-nh-d15s",
    "name": "Noctua NH-D15S",
    "brand": "Noctua",
    "category": "cpu-cooler",
    "sku": "REF-NH-D15S",
    "description": "Air cooler reference with published overall height. Mounting accessories vary by package age; thermal suitability remains unknown without an applicable manufacturer rating.",
    "specs": {
      "sockets": null,
      "coolerHeightMm": 160,
      "tdp": null,
      "radiatorMm": 0,
      "type": "Air"
    },
    "sourceUrl": "https://noctua.at/pub/media/blfa_files/infosheet/noctua_nh_d15s_datasheet_en.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/cpu-cooler.svg",
        "alt": "Original cpu-cooler category diagram; not a photograph of Noctua NH-D15S"
      }
    ]
  },
  {
    "slug": "fractal-pop-air",
    "name": "Fractal Design Pop Air",
    "brand": "Fractal Design",
    "category": "case",
    "sku": "REF-POP-AIR",
    "description": "ATX-compatible case reference. GPU clearance is the published baseline; installed radiators, fans and cable routing can reduce usable space.",
    "specs": {
      "formFactor": "ATX",
      "supportedBoards": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      "gpuClearanceMm": 405,
      "coolerHeightMm": 170,
      "radiatorSupportMm": null
    },
    "sourceUrl": "https://www.fractal-design.com/app/uploads/2023/02/Pop-Manual-V2.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/case.svg",
        "alt": "Original case category diagram; not a photograph of Fractal Design Pop Air"
      }
    ]
  },
  {
    "slug": "fractal-pop-silent",
    "name": "Fractal Design Pop Silent",
    "brand": "Fractal Design",
    "category": "case",
    "sku": "REF-POP-SILENT",
    "description": "ATX-compatible case reference. GPU clearance is the published baseline; installed radiators, fans and cable routing can reduce usable space.",
    "specs": {
      "formFactor": "ATX",
      "supportedBoards": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      "gpuClearanceMm": 380,
      "coolerHeightMm": 170,
      "radiatorSupportMm": null
    },
    "sourceUrl": "https://www.fractal-design.com/app/uploads/2023/02/Pop-Manual-V2.pdf",
    "reviewedAt": "2026-10-23",
    "isReference": true,
    "priceMinor": 0,
    "stock": 0,
    "active": true,
    "isSample": false,
    "featured": true,
    "images": [
      {
        "src": "/illustrations/case.svg",
        "alt": "Original case category diagram; not a photograph of Fractal Design Pop Silent"
      }
    ]
  }
];
export const referenceProducts=records.map(p=>productSchema.parse(p));
export const referenceCategories=categoryCodes.filter(c=>referenceProducts.some(p=>p.category===c)).map((slug,sortOrder)=>({slug,name:categoryLabels[slug],description:`Manufacturer-sourced ${categoryLabels[slug]} references; no retail offer.`,sortOrder,active:true,isSample:false}));
