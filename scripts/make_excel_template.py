import os
import zipfile
from datetime import datetime, timezone


OUTPUT_DIR = os.path.join("data-templates")
OUTPUT_XLSX = os.path.join(OUTPUT_DIR, "mytree-template.xlsx")


SHEETS = [
    (
        "Strains",
        [
            "id",
            "name",
            "description",
        ],
    ),
    (
        "Batches",
        [
            "id",
            "batch_code",
            "description",
            "started_date",
        ],
    ),
    (
        "Images",
        [
            "id",
            "image",
            "thumbnail",
            "uploaded_at",
        ],
    ),
    (
        "Trees",
        [
            "id",
            "nickname",
            "strain_id",
            "variety",
            "generation",
            "batch_id",
            "location",
            "status",
            "created_at",
            "updated_at",
            "germination_date",
            "plant_date",
            "growth_stage",
            "harvest_date",
            "sex",
            "genotype",
            "phenotype",
            "parent_male_id",
            "parent_female_id",
            "clone_source_id",
            "pollination_date",
            "pollinated_by_id",
            "yield_amount",
            "flower_quality",
            "seed_count",
            "seed_harvest_date",
            "disease_notes",
            "document",
            "notes",
        ],
    ),
    (
        "TreeImages",
        [
            "tree_id",
            "image_id",
        ],
    ),
]


def excel_col(n: int) -> str:
    # 1-based index to Excel column letters
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def make_sheet_xml(headers):
    cells = []
    for idx, text in enumerate(headers, start=1):
        col = excel_col(idx)
        # Escape minimal XML chars
        esc = (
            text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )
        cells.append(
            f'<c r="{col}1" t="inlineStr"><is><t>{esc}</t></is></c>'
        )
    sheet = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">"
        "<sheetData><row r=\"1\">" + "".join(cells) + "</row></sheetData>"
        "</worksheet>"
    )
    return sheet


def build_xlsx(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    content_types = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>",
        "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">",
        "  <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>",
        "  <Default Extension=\"xml\" ContentType=\"application/xml\"/>",
        "  <Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>",
        "  <Override PartName=\"/xl/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\"/>",
        "  <Override PartName=\"/docProps/core.xml\" ContentType=\"application/vnd.openxmlformats-package.core-properties+xml\"/>",
        "  <Override PartName=\"/docProps/app.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.extended-properties+xml\"/>",
    ]
    for i in range(len(SHEETS)):
        content_types.append(
            f"  <Override PartName=\"/xl/worksheets/sheet{i+1}.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>"
        )
    content_types.append("</Types>")
    content_types_xml = "\n".join(content_types)

    rels_root = ("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
                 "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                 "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/>"
                 "<Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties\" Target=\"docProps/core.xml\"/>"
                 "<Relationship Id=\"rId3\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties\" Target=\"docProps/app.xml\"/>"
                 "</Relationships>")

    workbook_xml = [
        "<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\" standalone=\\\"yes\\\"?>",
        "<workbook xmlns=\\\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\\\" xmlns:r=\\\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\\\">",
        "  <sheets>",
    ]
    for i, (name, _) in enumerate(SHEETS, start=1):
        # Escape XML for sheet name
        esc_name = name.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        workbook_xml.append(
            f"    <sheet name=\\\"{esc_name}\\\" sheetId=\\\"{i}\\\" r:id=\\\"rId{i}\\\"/>"
        )
    workbook_xml.extend(["  </sheets>", "</workbook>"])
    workbook_xml_str = "\n".join(workbook_xml)

    workbook_rels = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>",
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">",
    ]
    for i in range(len(SHEETS)):
        workbook_rels.append(
            f"  <Relationship Id=\"rId{i+1}\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet{i+1}.xml\"/>"
        )
    workbook_rels.append(
        "  <Relationship Id=\"rIdStyles\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/>"
    )
    workbook_rels.append("</Relationships>")
    workbook_rels_xml = "\n".join(workbook_rels)

    styles_xml = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">"
        "<fonts count=\"1\"><font><sz val=\"11\"/><name val=\"Calibri\"/></font></fonts>"
        "<fills count=\"1\"><fill><patternFill patternType=\"none\"/></fill></fills>"
        "<borders count=\"1\"><border/></borders>"
        "<cellStyleXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellStyleXfs>"
        "<cellXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellXfs>"
        "<cellStyles count=\"1\"><cellStyle name=\"Normal\" xfId=\"0\" builtinId=\"0\"/></cellStyles>"
        "</styleSheet>"
    )

    core_props = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<cp:coreProperties xmlns:cp=\"http://schemas.openxmlformats.org/package/2006/metadata/core-properties\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\" xmlns:dcmitype=\"http://purl.org/dc/dcmitype/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">"
        "<dc:title>mytree-journal template</dc:title>"
        "<dc:creator>Codex CLI</dc:creator>"
        "<cp:lastModifiedBy>Codex CLI</cp:lastModifiedBy>"
        f"<dcterms:created xsi:type=\"dcterms:W3CDTF\">{now}</dcterms:created>"
        f"<dcterms:modified xsi:type=\"dcterms:W3CDTF\">{now}</dcterms:modified>"
        "</cp:coreProperties>"
    )

    app_props = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<Properties xmlns=\"http://schemas.openxmlformats.org/officeDocument/2006/extended-properties\" xmlns:vt=\"http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes\">"
        "<Application>Microsoft Excel</Application>"
        "</Properties>"
    )

    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types_xml)
        z.writestr("_rels/.rels", rels_root)
        z.writestr("docProps/core.xml", core_props)
        z.writestr("docProps/app.xml", app_props)
        z.writestr("xl/workbook.xml", workbook_xml_str)
        z.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml)
        z.writestr("xl/styles.xml", styles_xml)
        for i, (_, headers) in enumerate(SHEETS, start=1):
            z.writestr(f"xl/worksheets/sheet{i}.xml", make_sheet_xml(headers))


if __name__ == "__main__":
    build_xlsx(OUTPUT_XLSX)
    print(f"Wrote {OUTPUT_XLSX}")

