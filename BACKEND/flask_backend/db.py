import sqlite3
from datetime import datetime, timedelta
import random
import os
import requests

def init_db():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(""" 
        CREATE TABLE IF NOT EXISTS test_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                java_file TEXT,
                test_file TEXT,
                test_code TEXT,
                success BOOLEAN,
                errors TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                generation_time REAL DEFAULT 0,
                coverage_percentage REAL DEFAULT 0,
                methods_tested INTEGER DEFAULT 0,
                total_methods INTEGER DEFAULT 0
                )
        """)
    
    # Create analytics tables
    cur.execute("""
        CREATE TABLE IF NOT EXISTS test_coverage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_name TEXT,
            coverage_percentage REAL,
            methods_total INTEGER,
            methods_tested INTEGER,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS daily_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            tests_generated INTEGER,
            tests_successful INTEGER,
            tests_failed INTEGER,
            avg_generation_time REAL,
            avg_coverage REAL
        )
    """)
    
    conn.commit()
    conn.close()

# def log_test_run(java_file, test_file, test_code, success=True, errors="", generation_time=0, coverage=0, methods_tested=0, total_methods=0):
#     base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
#     db_path = os.path.join(base_dir, 'data', 'test_logs.db')
#     conn = sqlite3.connect(db_path)
#     cur = conn.cursor()
#     cur.execute(""" 
#         INSERT INTO test_runs (java_file, test_file, test_code, success, errors, generation_time, coverage_percentage, methods_tested, total_methods)
#         VALUES (?,?,?,?,?,?,?,?,?)      
#     """, (java_file, test_file, test_code, success, errors, generation_time, coverage, methods_tested, total_methods))
#     conn.commit()
#     conn.close()

def log_test_run(java_file, test_file, test_code, success=True, errors="", generation_time=0, coverage=0, methods_tested=0, total_methods=0):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(""" 
        INSERT INTO test_runs (java_file, test_file, test_code, success, errors, generation_time, coverage_percentage, methods_tested, total_methods)
        VALUES (?,?,?,?,?,?,?,?,?)      
    """, (java_file, test_file, test_code, success, errors, generation_time, coverage, methods_tested, total_methods))
    conn.commit()
    conn.close()

def get_dashboard_stats(time_range='7d'):
    print(f"📊 [DASHBOARD STATS] Starting fetch for time range: {time_range}")
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    print(f"📊 [DATABASE] Database path: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Calculate date range
    if time_range == '24h':
        start_date = datetime.now() - timedelta(hours=24)
    elif time_range == '7d':
        start_date = datetime.now() - timedelta(days=7)
    elif time_range == '30d':
        start_date = datetime.now() - timedelta(days=30)
    elif time_range == 'all':
        start_date = datetime(1900, 1, 1)  # Very old date to get all records
    else:
        start_date = datetime.now() - timedelta(days=7)
    
    print(f"📊 [DATABASE] Querying data from: {start_date.isoformat()} to now")
    
    # Get basic stats from database
    cur.execute("""
        SELECT 
            COUNT(*) as total_tests,
            SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_tests,
            SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_tests,
            AVG(generation_time) as avg_generation_time,
            AVG(coverage_percentage) as avg_coverage
        FROM test_runs 
        WHERE created_at >= ?
    """, (start_date.isoformat(),))
    
    db_result = cur.fetchone()
    print(f"📊 [DATABASE] Raw query result: {db_result}")
    
    # Get today's stats
    today = datetime.now().date()
    cur.execute("""
        SELECT COUNT(*) FROM test_runs 
        WHERE DATE(created_at) = ?
    """, (today.isoformat(),))
    tests_today = cur.fetchone()[0]
    print(f"📊 [DATABASE] Tests today: {tests_today}")
    
    # Get this week's stats
    week_start = datetime.now() - timedelta(days=7)
    cur.execute("""
        SELECT COUNT(*) FROM test_runs 
        WHERE created_at >= ?
    """, (week_start.isoformat(),))
    tests_this_week = cur.fetchone()[0]
    print(f"📊 [DATABASE] Tests this week: {tests_this_week}")
    
    # Get active projects (unique java files)
    cur.execute("""
        SELECT COUNT(DISTINCT java_file) FROM test_runs 
        WHERE created_at >= ?
    """, (start_date.isoformat(),))
    active_projects = cur.fetchone()[0]
    print(f"📊 [DATABASE] Active projects: {active_projects}")
    
    conn.close()
    
    # Try to get Jenkins test coverage data for enhanced metrics
    jenkins_coverage = 0
    print(f"🏗️ [JENKINS] Attempting to fetch Jenkins coverage data...")
    
    try:
        from app import get_jenkins_config
        
        jenkins_config = get_jenkins_config()
        print(f"🏗️ [JENKINS] Jenkins config retrieved: {jenkins_config is not None}")
        
        if jenkins_config:
            jenkins_url = jenkins_config['url'].rstrip('/')
            job_name = jenkins_config['jobName']
            auth = (jenkins_config['username'], jenkins_config['token'])
            
            print(f"🏗️ [JENKINS] Connecting to: {jenkins_url}")
            print(f"🏗️ [JENKINS] Job name: {job_name}")
            print(f"🏗️ [JENKINS] Username: {jenkins_config['username']}")
            
            # Get latest coverage from Jenkins
            jacoco_url = f"{jenkins_url}/job/{job_name}/lastSuccessfulBuild/jacoco/api/json"
            print(f"🏗️ [JENKINS] JaCoCo URL: {jacoco_url}")
            
            response = requests.get(jacoco_url, auth=auth, timeout=10)
            print(f"🏗️ [JENKINS] Response status code: {response.status_code}")
            
            if response.status_code == 200:
                jacoco_data = response.json()
                jenkins_coverage = jacoco_data.get('lineCoverage', {}).get('percentage', 0)
                print(f"🏗️ [JENKINS] ✅ Successfully fetched Jenkins coverage: {jenkins_coverage}%")
                print(f"🏗️ [JENKINS] Full JaCoCo data keys: {list(jacoco_data.keys())}")
            else:
                print(f"🏗️ [JENKINS] ❌ Failed to get coverage - Status: {response.status_code}")
                print(f"🏗️ [JENKINS] Response text: {response.text[:200]}...")
        else:
            print(f"🏗️ [JENKINS] ⚠️ Jenkins not configured")
            
    except Exception as e:
        print(f"🏗️ [JENKINS] ❌ Error fetching Jenkins coverage: {e}")
        import traceback
        print(f"🏗️ [JENKINS] Full error traceback:")
        traceback.print_exc()
    
    # Use Jenkins coverage if available, otherwise fall back to database average
    final_coverage = jenkins_coverage if jenkins_coverage > 0 else (db_result[4] or 0)
    print(f"📊 [FINAL] Coverage source: {'Jenkins' if jenkins_coverage > 0 else 'Database'}")
    print(f"📊 [FINAL] Final coverage value: {final_coverage}%")
    
    final_stats = {
        'totalTests': db_result[0] or 0,
        'successfulTests': db_result[1] or 0,
        'failedTests': db_result[2] or 0,
        'avgGenerationTime': round(db_result[3] or 0, 2),
        'testCoverage': round(final_coverage, 1),
        'activeProjects': active_projects,
        'testsToday': tests_today,
        'testsThisWeek': tests_this_week
    }
    
    print(f"📊 [FINAL] Complete dashboard stats: {final_stats}")
    return final_stats

def get_test_trends(time_range='7d'):
    print(f"📈 [TRENDS] Starting trends fetch for time range: {time_range}")
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Calculate date range
    if time_range == '24h':
        days = 1
        date_format = '%Y-%m-%d %H:00:00'
    elif time_range == '7d':
        days = 7
        date_format = '%Y-%m-%d'
    elif time_range == '30d':
        days = 30
        date_format = '%Y-%m-%d'
    else:
        days = 7
        date_format = '%Y-%m-%d'
    
    start_date = datetime.now() - timedelta(days=days)
    print(f"📈 [TRENDS] Querying trends from: {start_date.isoformat()} ({days} days)")
    
    cur.execute("""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as total,
            SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
            SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed
        FROM test_runs 
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date
    """, (start_date.isoformat(),))
    
    results = cur.fetchall()
    print(f"📈 [TRENDS] Raw database results: {len(results)} days with data")
    
    for result in results:
        print(f"📈 [TRENDS] Date: {result[0]} | Total: {result[1]} | Success: {result[2]} | Failed: {result[3]}")
    
    conn.close()
    
    trends = []
    for result in results:
        trends.append({
            'date': result[0],
            'total': result[1],
            'successful': result[2],
            'failed': result[3]
        })
    
    # Fill in missing dates with zero values
    current_date = start_date.date()
    end_date = datetime.now().date()
    
    existing_dates = {trend['date'] for trend in trends}
    filled_dates = 0
    
    while current_date <= end_date:
        date_str = current_date.isoformat()
        if date_str not in existing_dates:
            trends.append({
                'date': date_str,
                'total': 0,
                'successful': 0,
                'failed': 0
            })
            filled_dates += 1
        current_date += timedelta(days=1)
    
    print(f"📈 [TRENDS] Filled {filled_dates} missing dates with zero values")
    
    # Sort by date
    trends.sort(key=lambda x: x['date'])
    
    print(f"📈 [TRENDS] Final trends data: {len(trends)} total entries")
    print(f"📈 [TRENDS] Date range: {trends[0]['date'] if trends else 'None'} to {trends[-1]['date'] if trends else 'None'}")
    
    return trends

def get_coverage_data():
    print(f"📋 [COVERAGE] Starting coverage data fetch...")
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get coverage data from test_runs, grouped by java_file
    cur.execute("""
        SELECT 
            java_file as className,
            AVG(coverage_percentage) as coverage,
            AVG(total_methods) as methods,
            AVG(methods_tested) as testedMethods,
            MAX(created_at) as lastUpdated
        FROM test_runs 
        WHERE java_file IS NOT NULL AND java_file != ''
        GROUP BY java_file
        ORDER BY coverage DESC
    """)
    
    results = cur.fetchall()
    print(f"📋 [COVERAGE] Database query returned {len(results)} records")
    
    conn.close()
    
    coverage_data = []
    for i, result in enumerate(results):
        # Extract class name from file path
        class_name = result[0].split('/')[-1].replace('.java', '') if result[0] else 'Unknown'
        
        coverage_entry = {
            'className': class_name,
            'coverage': round(result[1] or 0, 1),
            'methods': int(result[2] or 0),
            'testedMethods': int(result[3] or 0),
            'lastUpdated': result[4] or datetime.now().isoformat()
        }
        
        coverage_data.append(coverage_entry)
        print(f"📋 [COVERAGE] Record {i+1}: {class_name} - {coverage_entry['coverage']}% coverage")
    
    # If no real data, generate some sample data
    if not coverage_data:
        print(f"📋 [COVERAGE] ⚠️ No real data found, generating sample data...")
        sample_classes = [
            'UserService', 'PaymentProcessor', 'DataValidator', 
            'EmailService', 'AuthenticationManager', 'DatabaseConnection',
            'FileUploader', 'ReportGenerator', 'CacheManager', 'LoggingService'
        ]
        
        for class_name in sample_classes:
            coverage = random.randint(45, 95)
            total_methods = random.randint(8, 25)
            tested_methods = int(total_methods * (coverage / 100))
            
            coverage_data.append({
                'className': class_name,
                'coverage': coverage,
                'methods': total_methods,
                'testedMethods': tested_methods,
                'lastUpdated': (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d %H:%M:%S')
            })
        
        print(f"📋 [COVERAGE] Generated {len(coverage_data)} sample coverage entries")
    else:
        print(f"📋 [COVERAGE] ✅ Using {len(coverage_data)} real coverage entries from database")
    
    return coverage_data

def get_recent_tests(limit=10):
    """Get recent test runs for chat context"""
    print(f"🔍 [RECENT TESTS] Fetching last {limit} test runs...")
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            id,
            java_file,
            test_file,
            success,
            errors,
            created_at,
            generation_time,
            coverage_percentage
        FROM test_runs 
        ORDER BY created_at DESC 
        LIMIT ?
    """, (limit,))
    
    results = cur.fetchall()
    print(f"🔍 [RECENT TESTS] Found {len(results)} recent test runs")
    
    recent_tests = []
    for row in results:
        recent_tests.append({
            'id': row[0],
            'java_file': row[1],
            'test_file': row[2],
            'success': bool(row[3]),
            'errors': row[4],
            'created_at': row[5],
            'generation_time': row[6],
            'coverage_percentage': row[7]
        })
    
    conn.close()
    return recent_tests