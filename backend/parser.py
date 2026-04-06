import pdfplumber
import json
import os
import re

def parse_tnea_pdf(pdf_path):
    """
    Parses a TNEA college PDF and extracts department-wise cutoff, rank, and seat availability.
    """
    college_data = {
        "name": "",
        "code": "",
        "departments": []
    }
    
    with pdfplumber.open(pdf_path) as pdf:
        # Extract college name and code from the first page
        first_page_text = pdf.pages[0].extract_text()
        # Example pattern: "2702 - Bannari Amman Institute of Technology"
        name_code_match = re.search(r"(\d{4})\s*-\s*([^\n]+)", first_page_text)
        if name_code_match:
            college_data["code"] = name_code_match.group(1)
            college_data["name"] = name_code_match.group(2).strip()

        for page in pdf.pages:
            table = page.extract_table()
            if not table:
                continue
            
            # Find the header row to identify columns
            # Headers usually: Branch Name, Code, OC, BC, BCM, MBC, SC, SCA, ST, Total
            for row in table:
                if not row or len(row) < 5:
                    continue
                
                # Check if this looks like a department row
                # A department row usually has a branch name in the first column and a numeric code in the second
                branch_name = row[0]
                branch_code = row[1]
                
                if branch_name and branch_code and len(branch_code) <= 3:
                    dept = {
                        "branchName": branch_name,
                        "code": branch_code,
                        "cutoffs": {},
                        "ranks": {},
                        "seats": {}
                    }
                    
                    # Mapping communities (index might vary depending on PDF format)
                    communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"]
                    start_idx = 2
                    
                    for i, community in enumerate(communities):
                        if start_idx + i < len(row):
                            cell_val = row[start_idx + i]
                            if cell_val:
                                # Cell might contain: "185.5\n22791\n54/54"
                                parts = cell_val.split('\n')
                                if len(parts) >= 1:
                                    dept["cutoffs"][community] = parts[0]
                                if len(parts) >= 2:
                                    dept["ranks"][community] = parts[1]
                                if len(parts) >= 3:
                                    dept["seats"][community] = parts[2]
                                else:
                                    # Fallback if seats is just one number
                                    dept["seats"][community] = "0/0"

                    college_data["departments"].append(dept)
                    
    return college_data

def process_all_pdfs(directory_path, output_json):
    all_colleges = []
    for filename in os.listdir(directory_path):
        if filename.endswith(".pdf"):
            path = os.path.join(directory_path, filename)
            try:
                print(f"Processing {filename}...")
                data = parse_tnea_pdf(path)
                all_colleges.append(data)
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                
    with open(output_json, 'w') as f:
        json.dump(all_colleges, f, indent=4)
    print(f"Successfully processed {len(all_colleges)} PDFs into {output_json}")

if __name__ == "__main__":
    # Example usage:
    # process_all_pdfs("./pdfs", "tnea_data.json")
    pass
