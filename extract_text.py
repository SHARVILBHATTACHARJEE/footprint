import zipfile
import re

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as z:
            xml_content = z.read('word/document.xml').decode('utf-8')
            # Extract text from XML tags
            text_with_empty_lines = re.sub('<[^<]+>', '\n', xml_content)
            # Remove redundant blank lines
            text = '\n'.join([line.strip() for line in text_with_empty_lines.splitlines() if line.strip()])
            return text
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    text = extract_text_from_docx('Images.docx')
    print("--- DOCX TEXT ---")
    print(text)
