import zipfile
import xml.etree.ElementTree as ET
import os
import re

def extract_hwpx_text(hwpx_path):
    try:
        with zipfile.ZipFile(hwpx_path, 'r') as zf:
            xml_content = zf.read('Contents/section0.xml')
            root = ET.fromstring(xml_content)
            # The namespace for hp is usually '{http://www.hancom.co.kr/hwpml/2011/paragraph}'
            text_elements = root.iter()
            texts = []
            for elem in text_elements:
                if elem.tag.endswith('t'):
                    if elem.text:
                        texts.append(elem.text)
            return '\n'.join(texts)
    except Exception as e:
        return f"Error extracting HWPX: {e}"

def extract_hwp_text_basic(hwp_path):
    # Very basic string extraction for HWP
    try:
        with open(hwp_path, 'rb') as f:
            data = f.read()
            # Extract unicode strings
            text = re.sub(rb'[^\x20-\x7E\xA1-\xFE]', b' ', data)
            return text.decode('euc-kr', errors='ignore')
    except Exception as e:
        return f"Error extracting HWP: {e}"

hwpx_path = r'c:\Users\노기가\Desktop\webportal2\개인정보처리방침.hwpx'
hwp_path = r'c:\Users\노기가\Desktop\webportal2\이용약관 예시.hwp'

print("--- HWPX TEXT ---")
print(extract_hwpx_text(hwpx_path)[:1500])

print("\n--- HWP TEXT ---")
hwp_text = extract_hwp_text_basic(hwp_path)
# Clean up multiple spaces
cleaned_hwp = re.sub(' +', ' ', hwp_text)
print(cleaned_hwp[-1500:])

