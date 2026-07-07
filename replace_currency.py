import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # 1. Price ($) -> Price (₹)
    content = content.replace("($)", "(₹)")
    content = content.replace("Cost ($)", "Cost (₹)")
    
    # 2. JSX text: >${ -> >₹{
    content = re.sub(r'>\$(\{)', r'>₹\1', content)
    
    # 3. Text with $: "Raw: $" -> "Raw: ₹"
    content = content.replace("Raw: $", "Raw: ₹")
    content = content.replace("Fixed: $", "Fixed: ₹")
    content = content.replace("Discount: $", "Discount: ₹")
    
    # 4. Template literals with currency: `$${ -> `₹${
    content = content.replace("`$$", "`₹$")
    # also standard string concat: "$ " -> "₹ " (maybe not safe)
    
    # 5. JSX text like > $10 or >$10
    content = re.sub(r'>\s*\$(\d)', r'> ₹\1', content)
    
    # 6. Fallbacks for strings like "$0.00" inside JSX
    content = re.sub(r'"\$(\d)', r'"₹\1', content)
    content = re.sub(r"'\$(\d)", r"'₹\1", content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))
