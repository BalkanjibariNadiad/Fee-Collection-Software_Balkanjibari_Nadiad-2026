#!/usr/bin/env python3
"""
Create comprehensive backups of database and project
"""
import os
import json
import shutil
import zipfile
from datetime import datetime
from pathlib import Path

def create_project_backup():
    """Create ZIP backup of entire project excluding large directories"""
    timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')
    backup_name = f'PROJECT_BACKUP_{timestamp}.zip'
    backup_path = os.path.join(os.path.dirname(os.getcwd()), backup_name)
    
    # Directories and files to exclude
    exclude = {
        'node_modules',
        '.next',
        '__pycache__',
        '.venv',
        '.git',
        '.pytest_cache',
        'dist',
        'build',
        '.egg-info',
        '.DS_Store',
        'Thumbs.db',
        '.env',
        '.env.local'
    }
    
    print(f"Creating project backup: {backup_name}")
    
    def should_exclude(path):
        """Check if path should be excluded"""
        parts = Path(path).parts
        return any(part in exclude for part in parts)
    
    with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude]
            
            for file in files:
                file_path = os.path.join(root, file)
                if not should_exclude(file_path):
                    arcname = os.path.relpath(file_path, '.')
                    zipf.write(file_path, arcname)
    
    # Get file size
    size_mb = os.path.getsize(backup_path) / (1024 * 1024)
    print(f"✅ Backup created: {backup_name}")
    print(f"   Size: {size_mb:.2f} MB")
    print(f"   Location: {backup_path}")
    
    return backup_path

def verify_database_backup():
    """Verify database backup was created"""
    backup_dir = os.path.dirname(os.getcwd())
    backups = sorted(Path(backup_dir).glob('BACKUP_DATABASE_*.json'), 
                    key=lambda x: x.stat().st_mtime, reverse=True)
    
    if backups:
        latest = backups[0]
        size_mb = latest.stat().st_size / (1024 * 1024)
        print(f"✅ Database backup verified: {latest.name}")
        print(f"   Size: {size_mb:.2f} MB")
        
        # Verify it's valid JSON
        try:
            with open(latest, 'r') as f:
                data = json.load(f)
                print(f"   Records: {len(data)} entries")
            return True
        except Exception as e:
            print(f"   ⚠️  Warning: Could not parse JSON - {e}")
            return False
    else:
        print("❌ No database backup found")
        return False

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print("=" * 60)
    print("BACKUP SYSTEM - Starting backup process")
    print("=" * 60)
    
    # Verify database backup
    print("\n1. Verifying Database Backup...")
    db_ok = verify_database_backup()
    
    # Create project backup
    print("\n2. Creating Project Backup...")
    project_path = create_project_backup()
    
    print("\n" + "=" * 60)
    print("✅ BACKUP COMPLETE")
    print("=" * 60)
    print("\nBackup files are stored in:")
    print(f"  Parent directory: {os.path.dirname(os.getcwd())}")
