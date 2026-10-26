"""Convert the Adriatica catalogue Excel into catalogue.json for import.ts.

Usage: python3 -I tools/product-meta/xlsx-to-json.py <catalogue.xlsx> tools/product-meta/catalogue.json
Requires openpyxl. Only the columns used by the product filter are exported, raw
(normalisation happens in import.ts via src/lib/products/productMeta.ts).
"""
import json
import sys

import openpyxl

COLUMNS = {
    "Produit": "produit",
    "Type": "type",
    "Famille": "famille",
    "Sous-catégorie": "sousCategorie",
    "Cultures": "cultures",
}


def main(src: str, dest: str) -> None:
    ws = openpyxl.load_workbook(src, data_only=True, read_only=True)["Produits"]
    rows = list(ws.iter_rows(values_only=True))
    header = [str(h).strip() if h is not None else "" for h in rows[0]]
    missing = [c for c in COLUMNS if c not in header]
    if missing:
        sys.exit(f"Missing columns in sheet 'Produits': {missing}")
    idx = {key: header.index(col) for col, key in COLUMNS.items()}
    out = []
    for r in rows[1:]:
        if not any(v not in (None, "") for v in r):
            continue
        out.append({k: ("" if r[i] is None else str(r[i]).strip()) for k, i in idx.items()})
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Wrote {len(out)} rows to {dest}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
