import os
import zipfile

def zip_project():
    source_dir = r"c:\Users\darsh\Downloads\Fee-Collection-Software latest 22 april"
    output_path = r"c:\Users\darsh\Downloads\Fee-Collection-Software_Backup.zip"
    
    # Exclude common large/unnecessary directories
    exclude_dirs = {'.git', 'node_modules', '.next', '__pycache__', '.venv', 'venv', 'env', '.pytest_cache'}
    
    print(f"Creating zip archive at {output_path}...")
    
    # Count files to estimate progress
    total_files = 0
    for root, dirs, files in os.walk(source_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        total_files += len(files)
        
    print(f"Found {total_files} files to zip.")
    
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        current_file = 0
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file == 'Fee-Collection-Software_Backup.zip':
                    continue  # we will add db_backup.json separately if needed, or it might be in backend
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(source_dir))
                zipf.write(file_path, arcname)
                
                current_file += 1
                if current_file % 1000 == 0:
                    print(f"Zipped {current_file}/{total_files} files...")
                    
    print(f"Project successfully zipped to {output_path}")

if __name__ == "__main__":
    zip_project()
