import sqlite3
import os
from datetime import datetime, timedelta
import random

def add_recent_data():
    # Connect to database
    base_dir = os.path.abspath('.')
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    print('📝 Adding recent test data...')
    
    sample_files = [
        'com/example/service/UserService.java',
        'com/example/controller/AuthController.java', 
        'com/example/model/Product.java',
        'com/example/util/DateUtils.java',
        'com/example/repository/OrderRepository.java'
    ]

    for i in range(15):  # Add 15 recent records
        java_file = random.choice(sample_files)
        test_file = java_file.replace('.java', 'Test.java')
        success = random.choice([True, True, True, False])  # 75% success
        generation_time = round(random.uniform(2.0, 12.0), 2)
        coverage = round(random.uniform(50.0, 90.0), 1)
        total_methods = random.randint(5, 15)
        methods_tested = int(total_methods * (coverage / 100))
        
        # Random date within last 7 days
        days_ago = random.randint(0, 6)
        hours_ago = random.randint(0, 23)
        created_at = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
        
        test_code = f'// Test for {java_file}'
        errors = '' if success else 'Mock compilation error'
        
        cur.execute('''
            INSERT INTO test_runs 
            (java_file, test_file, test_code, success, errors, created_at, generation_time, coverage_percentage, methods_tested, total_methods)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (java_file, test_file, test_code, success, errors, created_at.isoformat(), generation_time, coverage, methods_tested, total_methods))
        
        print(f'  📝 Added: {java_file} - Success: {success}, Coverage: {coverage}%, Date: {created_at.date()}')

    conn.commit()
    conn.close()
    print('✅ Recent test data added successfully!')

if __name__ == "__main__":
    add_recent_data()
