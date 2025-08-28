#!/usr/bin/env python3
"""
Debug script to check database contents and add sample data if needed
"""

import sqlite3
import os
import sys
from datetime import datetime, timedelta
import random

def check_database():
    """Check if database exists and what data it contains"""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '.'))
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    
    print(f"🔍 [DEBUG] Checking database at: {db_path}")
    print(f"🔍 [DEBUG] Database exists: {os.path.exists(db_path)}")
    
    if not os.path.exists(db_path):
        print(f"❌ [DEBUG] Database file doesn't exist!")
        print(f"🔧 [DEBUG] Creating database...")
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Initialize database
        sys.path.append(os.path.join(os.path.dirname(__file__), 'flask_backend'))
        from db import init_db
        init_db()
        print(f"✅ [DEBUG] Database created and initialized")
    
    # Connect and check contents
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Check if test_runs table exists
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='test_runs'")
    table_exists = cur.fetchone()
    print(f"🔍 [DEBUG] test_runs table exists: {table_exists is not None}")
    
    if table_exists:
        # Count total records
        cur.execute("SELECT COUNT(*) FROM test_runs")
        total_count = cur.fetchone()[0]
        print(f"🔍 [DEBUG] Total records in test_runs: {total_count}")
        
        if total_count > 0:
            # Show recent records
            cur.execute("SELECT java_file, success, created_at FROM test_runs ORDER BY created_at DESC LIMIT 5")
            recent_records = cur.fetchall()
            print(f"🔍 [DEBUG] Recent records:")
            for i, record in enumerate(recent_records):
                print(f"  {i+1}. File: {record[0]}, Success: {record[1]}, Date: {record[2]}")
            
            # Show date range
            cur.execute("SELECT MIN(created_at), MAX(created_at) FROM test_runs")
            date_range = cur.fetchone()
            print(f"🔍 [DEBUG] Data date range: {date_range[0]} to {date_range[1]}")
        else:
            print(f"⚠️ [DEBUG] No data found in test_runs table!")
    
    conn.close()
    return db_path, total_count if table_exists else 0

def add_sample_data(db_path, num_records=20):
    """Add sample test data to the database"""
    print(f"📝 [DEBUG] Adding {num_records} sample records...")
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    sample_java_files = [
        "com/example/service/UserService.java",
        "com/example/controller/AuthController.java", 
        "com/example/model/Product.java",
        "com/example/util/DateUtils.java",
        "com/example/repository/OrderRepository.java",
        "com/example/service/PaymentService.java",
        "com/example/validator/EmailValidator.java",
        "com/example/config/DatabaseConfig.java"
    ]
    
    for i in range(num_records):
        # Generate random data
        java_file = random.choice(sample_java_files)
        test_file = java_file.replace('.java', 'Test.java').replace('com/example', 'test/java/com/example')
        success = random.choice([True, True, True, False])  # 75% success rate
        generation_time = round(random.uniform(2.0, 15.0), 2)
        coverage = round(random.uniform(45.0, 95.0), 1)
        total_methods = random.randint(5, 20)
        methods_tested = int(total_methods * (coverage / 100))
        
        # Random date within last 14 days
        days_ago = random.randint(0, 14)
        hours_ago = random.randint(0, 23)
        created_at = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
        
        test_code = f"// Generated test for {java_file.split('/')[-1]}\npublic class TestClass {{\n    // Test methods here\n}}"
        errors = "" if success else "Compilation error: missing import"
        
        cur.execute("""
            INSERT INTO test_runs 
            (java_file, test_file, test_code, success, errors, created_at, generation_time, coverage_percentage, methods_tested, total_methods)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (java_file, test_file, test_code, success, errors, created_at.isoformat(), generation_time, coverage, methods_tested, total_methods))
        
        print(f"  📝 Added: {java_file} - Success: {success}, Coverage: {coverage}%, Date: {created_at.date()}")
    
    conn.commit()
    conn.close()
    print(f"✅ [DEBUG] Added {num_records} sample records successfully!")

def check_jenkins_settings():
    """Check if Jenkins settings exist"""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '.'))
    settings_db_path = os.path.join(base_dir, 'data', 'settings.db')
    
    print(f"🔍 [DEBUG] Checking Jenkins settings at: {settings_db_path}")
    print(f"🔍 [DEBUG] Settings database exists: {os.path.exists(settings_db_path)}")
    
    if os.path.exists(settings_db_path):
        conn = sqlite3.connect(settings_db_path)
        cur = conn.cursor()
        
        cur.execute("SELECT url, username, job_name FROM jenkins_settings ORDER BY id DESC LIMIT 1")
        result = cur.fetchone()
        
        if result:
            print(f"🔍 [DEBUG] Jenkins configured: URL={result[0]}, Job={result[2]}, User={result[1]}")
        else:
            print(f"⚠️ [DEBUG] No Jenkins configuration found")
        
        conn.close()
    else:
        print(f"⚠️ [DEBUG] Jenkins settings database doesn't exist")

def main():
    print("🚀 [DEBUG] Starting database debug script...")
    
    # Check database
    db_path, record_count = check_database()
    
    # Check Jenkins settings
    check_jenkins_settings()
    
    # Add sample data if database is empty
    if record_count == 0:
        response = input("\n❓ Database is empty. Add sample data? (y/N): ").lower().strip()
        if response == 'y':
            add_sample_data(db_path)
            print("\n✅ Sample data added! Try refreshing your dashboard now.")
        else:
            print("\n💡 To add sample data later, run this script again.")
    else:
        print(f"\n✅ Database has {record_count} records. Data should be visible in dashboard.")
    
    print("\n🔧 [DEBUG] Debug complete!")

if __name__ == "__main__":
    main()
