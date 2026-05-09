import pandas as pd
import sys
import io

file_path = "運命_システム仕様書(一).xlsx"

try:
    xl = pd.ExcelFile(file_path)
    with open("excel_output.txt", "w", encoding="utf-8") as f:
        target_sheet = '画面設計書'
        if target_sheet in xl.sheet_names:
            f.write(f"\n--- Content of sheet: {target_sheet} ---\n")
            df = pd.read_excel(file_path, sheet_name=target_sheet)
            f.write(df.to_string())
        else:
            f.write("Sheet not found")
                
except Exception as e:
    with open("excel_output.txt", "w", encoding="utf-8") as f:
        f.write(f"Error reading Excel file: {e}")

