import re
import json
import os

workspace = "/Users/tahmid_23/Codex Workspace/Luna Ravintola"

with open(os.path.join(workspace, 'index.html'), 'r', encoding='utf-8') as f:
    content = f.read()

categories = re.findall(r'<div class="menu-category(?: active)?" id="([^"]+)">([\s\S]*?)<!-- =====', content)
last_cat = re.search(r'<div class="menu-category" id="drinks">([\s\S]*?)</section>', content)
if last_cat:
    categories.append(('drinks', last_cat.group(1)))

catalog = {}
for cat_id, cat_html in categories:
    items = re.finditer(r'<h3 data-en="([^"]+)" data-fi="([^"]+)">.*?</h3>', cat_html)
    for match in items:
        name_en = match.group(1)
        name_fi = match.group(2)
        
        item_id = name_en.lower().replace(' ', '_').replace(',', '').replace('ä', 'a').replace('ö', 'o').replace('/', '_')
        
        start_pos = match.end()
        end_match = re.search(r'<h3', cat_html[start_pos:])
        chunk = cat_html[start_pos:start_pos + end_match.start()] if end_match else cat_html[start_pos:]
        
        desc_match = re.search(r'<p data-en="([^"]+)" data-fi="([^"]+)">', chunk)
        desc_en = desc_match.group(1) if desc_match else ""
        desc_fi = desc_match.group(2) if desc_match else ""
        
        dual_price = re.search(r'<div class="dual-price"><span class="price">Norm\. €([0-9.]+)</span><span[^>]*>Perhe €([0-9.]+)</span></div>', chunk)
        single_price = re.search(r'<span class="price">€([0-9.]+)</span>', chunk)
        if not single_price:
             single_price = re.search(r'<span class="price">€([0-9.]+)</span>', cat_html[match.start()-50:match.start()])
             
        sizes = {}
        if dual_price:
            sizes["norm"] = {"label_en": "Normal", "label_fi": "Normaali", "price": int(float(dual_price.group(1)) * 100)}
            sizes["family"] = {"label_en": "Family", "label_fi": "Perhe", "price": int(float(dual_price.group(2)) * 100)}
        elif single_price:
            sizes["norm"] = {"label_en": "Normal", "label_fi": "Normaali", "price": int(float(single_price.group(1)) * 100)}
        else:
             sizes["norm"] = {"label_en": "Normal", "label_fi": "Normaali", "price": 0}
             
        catalog[item_id] = {
            "id": item_id,
            "category": cat_id,
            "name_en": name_en,
            "name_fi": name_fi,
            "desc_en": desc_en,
            "desc_fi": desc_fi,
            "sizes": sizes
        }

os.makedirs(os.path.join(workspace, 'menu'), exist_ok=True)
with open(os.path.join(workspace, 'menu', 'catalog.js'), 'w', encoding='utf-8') as f:
    f.write('const catalog = ' + json.dumps(catalog, indent=2, ensure_ascii=False) + ';\n')
