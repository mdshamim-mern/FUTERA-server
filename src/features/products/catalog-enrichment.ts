import type {Product} from "./schema.ts";
/** Sourced market observations; never sellable inventory or an order price. */
export const catalogEnrichment:Record<string,Partial<Product>> = {
  "amd-ryzen-5-7600x": {
    "marketPrice": {
      "amountMinor": 1830000,
      "sourceUrl": "https://www.startech.com.bd/amd-ryzen-5-7600x-processor",
      "checkedAt": "2026-10-23",
      "note": "Published single-processor price (tray variant); bundle pricing differs. Retailer prices can change."
    }
  },
  "amd-ryzen-7-7700x": {
    "marketPrice": {
      "amountMinor": 2330000,
      "sourceUrl": "https://www.startech.com.bd/amd-ryzen-7-7700x-processor",
      "checkedAt": "2026-10-23",
      "note": "Published single-processor price (tray variant); bundle pricing differs. Retailer prices can change."
    }
  },
  "amd-ryzen-9-7950x": {
    "marketPrice": {
      "amountMinor": 4690000,
      "sourceUrl": "https://www.startech.com.bd/amd-ryzen-9-7950x-processor",
      "checkedAt": "2026-10-23",
      "note": "Published single-processor price (tray variant); bundle pricing differs. Retailer prices can change."
    },
    "images": [
      {
        "src": "/images/products/amd-ryzen-9-7950x/package.webp",
        "alt": "AMD Ryzen 9 7950X retail package in foreground; Ryzen 7 package in background",
        "credit": "极客湾Geekerwan · resized / WebP",
        "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ausf%C3%BChrlicher_Test_der_Ryzen_7000-Serie_(%E6%9E%81%E5%AE%A2%E6%B9%BEGeekerwan)_02.png",
        "licenseUrl": "https://creativecommons.org/licenses/by/3.0/"
      },
      {
        "src": "/images/products/amd-ryzen-9-7950x/processor-pair.webp",
        "alt": "AMD Ryzen 9 7950X on the right beside Ryzen 7 7700X on the left",
        "credit": "极客湾Geekerwan · resized / WebP",
        "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ausf%C3%BChrlicher_Test_der_Ryzen_7000-Serie_(%E6%9E%81%E5%AE%A2%E6%B9%BEGeekerwan)_03.png",
        "licenseUrl": "https://creativecommons.org/licenses/by/3.0/"
      },
      {
        "src": "/images/products/amd-ryzen-9-7950x/comparison.webp",
        "alt": "AMD Ryzen 9 7950X in the centre, between comparison processors",
        "credit": "极客湾Geekerwan · resized / WebP",
        "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ausf%C3%BChrlicher_Test_der_Ryzen_7000-Serie_(%E6%9E%81%E5%AE%A2%E6%B9%BEGeekerwan)_07.png",
        "licenseUrl": "https://creativecommons.org/licenses/by/3.0/"
      }
    ]
  }
};

catalogEnrichment["crucial-p3-plus-2000gb"] = {
  "images": [
    {
      "src": "/images/products/crucial-p3-plus-2000gb/identification-label.webp",
      "alt": "Crucial P3 Plus 2TB identification label and underside",
      "credit": "PantheraLeo1359531 · resized / WebP",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Crucial_CT20000P3PSSD8_20240302_002_OKcorr02_Kopie.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    {
      "src": "/images/products/crucial-p3-plus-2000gb/component-side.webp",
      "alt": "Crucial P3 Plus 2TB component side with Crucial label",
      "credit": "PantheraLeo1359531 · resized / WebP",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Crucial_CT20000P3PSSD8_20240302_004_OK_corr02_Kopie.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  ]
};
catalogEnrichment["crucial-p3-plus-2000gb"].marketPrice = {amountMinor:1550000,sourceUrl:"https://www.binarylogic.com.bd/crucial-p3-plus-2tb-pcie-gen-4-x4-m2-2280-ssd-ct2000p3pssd8",checkedAt:"2026-10-24",note:"Published cash price; source listing is out of stock. This is a price observation, not a stock or purchase promise."};
