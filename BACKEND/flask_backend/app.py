import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify, render_template, Response, abort
from db import log_test_run, init_db, get_dashboard_stats, get_test_trends, get_coverage_data, get_recent_tests
# from db import init_db, get_dashboard_stats, get_test_trends, get_coverage_data
from test_generator.fixer import TestFixer
from test_generator.generator import TestGenerator
from test_generator.smart_suggester import SmartContextSuggester
from chat_assistant import ChatAssistant
import os
import uuid
import zipfile
import shutil
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import sqlite3
from pathlib import Path
from flask_cors import CORS
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
import requests
import base64
from urllib.parse import urljoin
from dotenv import load_dotenv

# Try to import rarfile for RAR support
try:
    import rarfile
    RAR_SUPPORT = True
except ImportError:
    RAR_SUPPORT = False

# Try to import py7zr as fallback for 7z files
try:
    import py7zr
    PY7ZR_SUPPORT = True
except ImportError:
    PY7ZR_SUPPORT = False

# Try to import patool for universal archive extraction
try:
    import patoolib
    PATOOL_SUPPORT = True
except ImportError:
    PATOOL_SUPPORT = False

# Load environment variables from .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

# Debug: Check if environment variables are loaded
print(f"🔧 [ENV] GEMINI_API_KEY loaded: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")
print(f"🔧 [ENV] USE_GEMINI: {os.getenv('USE_GEMINI', 'Not set')}")

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

UPLOAD_DIR = "uploads"
GENERATED_DIR = "generated_tests"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)

init_db()
chat_assistant = ChatAssistant()

# Initialize Jenkins settings database
def init_settings_db():
    """Initialize settings database for Jenkins configuration"""
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    db_path = os.path.join(data_dir, 'settings.db')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS jenkins_settings (
        id INTEGER PRIMARY KEY,
        url TEXT NOT NULL,
        username TEXT NOT NULL,
        token TEXT NOT NULL,
        job_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def get_jenkins_config():
    """Get Jenkins configuration from database"""
    print(f"🔧 [CONFIG] Getting Jenkins configuration...")
    
    try:
        data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
        db_path = os.path.join(data_dir, 'settings.db')
        
        print(f"🔧 [CONFIG] Settings database path: {db_path}")
        print(f"🔧 [CONFIG] Settings database exists: {os.path.exists(db_path)}")
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT url, username, token, job_name FROM jenkins_settings ORDER BY id DESC LIMIT 1')
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            config = {
                'url': result[0],
                'username': result[1],
                'token': result[2],
                'jobName': result[3]
            }
            print(f"🔧 [CONFIG] ✅ Jenkins config found: URL={config['url']}, Job={config['jobName']}, User={config['username']}")
            return config
        else:
            print(f"🔧 [CONFIG] ⚠️ No Jenkins configuration found in database")
            return None
        
    except Exception as e:
        print(f"🔧 [CONFIG] ❌ Error getting Jenkins config: {e}")
        import traceback
        traceback.print_exc()
        return None

# Initialize settings DB
init_settings_db()

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


@app.route("/generate-tests", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        # print("📥 Incoming JSON:", data)

        code = data.get("code")
        path = data.get("fileName")
        file_name = os.path.basename(path)
        context = data.get("context")

        if not code or not file_name:
            return jsonify({"error": "Missing code or fileName"}), 400

        safe_file_name = Path(file_name).as_posix()  
        if safe_file_name.startswith("uploads/"):
            safe_file_name = safe_file_name[len("uploads/"):]

        java_file_path = os.path.join(UPLOAD_DIR, safe_file_name)

        os.makedirs(os.path.dirname(java_file_path), exist_ok=True)

        with open(java_file_path, "w", encoding="utf-8") as f:
            f.write(code)

        context_paths = []
        if context and isinstance(context, dict):
            for ctx_name, ctx_code in context.items():
                ctx_path = os.path.join(UPLOAD_DIR, ctx_name)
                os.makedirs(os.path.dirname(ctx_path), exist_ok=True)
                with open(ctx_path, "w", encoding="utf-8") as f:
                    f.write(ctx_code)
                context_paths.append(ctx_path)

        # Create Args and run generator as before
        class Args:
            file = java_file_path
            model = data.get("llm")
            framework = data.get("framework")
            api_url = "http://localhost:11434"
            junit_jar = "test_jars/junit-platform-console-standalone-1.13.0-RC1.jar"
            context_files = context_paths 

        generator = TestGenerator(Args)
        output = generator.run()
        # print(f"Generator output: {output}")

        test_file_path = os.path.join(
            GENERATED_DIR,
            f"{generator.class_parser.class_name}Test.java"
        )

        test_file = os.path.basename(test_file_path)

        with open(test_file_path, "r", encoding="utf-8") as f:
            test_code = f.read()

        log_test_run(file_name, test_file, test_code, success=True)

        return Response(test_code, mimetype="text/plain; charset=utf-8")

    except Exception as e:
        import traceback
        print("🔥 EXCEPTION in /generate-tests")
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    

@app.route("/tests", methods=["GET"])
def list_tests():
    import sqlite3
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    print(f"Database path:",db_path)
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT id, java_file, test_file, created_at FROM test_runs ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    return jsonify(rows)


@app.route("/tests/<int:test_id>", methods=["GET", "POST", "DELETE"])
def view_or_edit(test_id):
    import sqlite3
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'test_logs.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    if request.method == "GET":
        cur.execute("SELECT test_code FROM test_runs WHERE id=?", (test_id,))
        test = cur.fetchone()
        conn.close()
        return jsonify({"code": test[0] if test else ""})

    elif request.method == "POST":
        new_code = request.json.get("code", "")
        cur.execute("UPDATE test_runs SET test_code = ? WHERE id=?", (new_code, test_id))
        conn.commit()
        conn.close()
        return jsonify({"status": "updated"})

    elif request.method == "DELETE":
        cur.execute("DELETE FROM test_runs WHERE id=?", (test_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "deleted"})


@app.route("/history", methods=["GET"])
def history_page():
    return render_template("test_history.html")


@app.route("/tests/<int:test_id>/view", methods=["GET"])
def view_test_page(test_id):
    import sqlite3
    conn = sqlite3.connect("data/test_logs.db")
    cur = conn.cursor()
    cur.execute("SELECT test_code FROM test_runs WHERE id=?", (test_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return render_template("view_tests.html", test_id=test_id, code=row[0])
    return "Test not found", 404


# ----- Upload & Repo Utilities ----- #

def extract_zip(file_path, extract_to):
    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)


def extract_rar(file_path, extract_to):
    """Extract RAR files using multiple fallback methods"""
    print(f"📁 [RAR] Attempting to extract: {file_path}")
    
    # Method 1: Try patool first (universal extractor)
    if PATOOL_SUPPORT:
        try:
            print(f"📁 [RAR] Trying patool extraction...")
            patoolib.extract_archive(file_path, outdir=extract_to)
            print(f"📁 [RAR] ✅ Successfully extracted RAR file using patool")
            return
        except Exception as e:
            print(f"📁 [RAR] ❌ patool failed: {e}")
    
    # Method 2: Try using subprocess with 7-Zip if installed
    try:
        print(f"📁 [RAR] Trying 7-Zip command line...")
        import subprocess
        
        # Try common 7-Zip installation paths
        seven_zip_paths = [
            r"C:\Program Files\7-Zip\7z.exe",
            r"C:\Program Files (x86)\7-Zip\7z.exe",
            "7z.exe",  # If in PATH
            "7za.exe"  # Standalone version
        ]
        
        for seven_zip_path in seven_zip_paths:
            try:
                result = subprocess.run([
                    seven_zip_path, 'x', file_path, f'-o{extract_to}', '-y'
                ], capture_output=True, text=True, timeout=60)
                
                if result.returncode == 0:
                    print(f"📁 [RAR] ✅ Successfully extracted using 7-Zip: {seven_zip_path}")
                    return
                else:
                    print(f"📁 [RAR] 7-Zip failed with return code {result.returncode}: {result.stderr}")
            except FileNotFoundError:
                continue
            except Exception as e:
                print(f"📁 [RAR] 7-Zip attempt failed: {e}")
                continue
                
    except Exception as e:
        print(f"📁 [RAR] ❌ Subprocess method failed: {e}")
    
    # Method 3: Try rarfile with unrar tool (last resort)
    if RAR_SUPPORT:
        try:
            print(f"📁 [RAR] Trying rarfile extraction...")
            with rarfile.RarFile(file_path, 'r') as rar_ref:
                rar_ref.extractall(extract_to)
            print(f"📁 [RAR] ✅ Successfully extracted RAR file using rarfile")
            return
        except Exception as e:
            print(f"📁 [RAR] ❌ rarfile failed: {e}")
    
    # If all methods fail, raise an error with helpful instructions
    raise Exception(
        "Cannot extract RAR file. Please install 7-Zip (https://www.7-zip.org/) or convert your RAR file to ZIP format."
    )


def is_rar_file(file_path):
    """Check if file is a RAR file"""
    # First check by file extension
    if file_path.lower().endswith('.rar'):
        print(f"📁 [RAR] File detected as RAR by extension: {file_path}")
        return True
    
    # Then try rarfile library if available
    if not RAR_SUPPORT:
        print(f"📁 [RAR] RAR_SUPPORT is False")
        return False
    try:
        result = rarfile.is_rarfile(file_path)
        print(f"📁 [RAR] is_rar_file({file_path}) = {result}")
        return result
    except Exception as e:
        print(f"📁 [RAR] ❌ Error checking if file is RAR: {e}")
        return False


def clone_repo(url, extract_to):
    if "github.com" in url and not url.endswith(".zip"):
        if url.endswith("/"):
            url = url[:-1]
        url += "/archive/refs/heads/main.zip"
    r = requests.get(url)
    if r.status_code == 200:
        zip_path = os.path.join(extract_to, "repo.zip")
        with open(zip_path, "wb") as f:
            f.write(r.content)
        extract_zip(zip_path, extract_to)
        os.remove(zip_path)
    else:
        raise Exception("Failed to download repo")


def build_file_tree(base_path, uploads_base=None):
    """Build file tree with paths relative to uploads directory"""
    if uploads_base is None:
        uploads_base = base_path
    
    tree = {}
    for item in os.listdir(base_path):
        full_path = os.path.join(base_path, item)
        if os.path.isdir(full_path):
            tree[item] = build_file_tree(full_path, uploads_base)
        else:
            # Create relative path from uploads directory
            relative_path = os.path.relpath(full_path, uploads_base)
            tree[item] = relative_path.replace(os.sep, '/')  # Normalize separators
    return tree


@app.route("/upload", methods=["POST"])
def upload():
    temp_dir = os.path.join(UPLOAD_DIR, str(uuid.uuid4()))
    os.makedirs(temp_dir, exist_ok=True)

    uploaded_file = request.files.get("zipFile")
    repo_url = request.form.get("repoUrl")

    try:
        if uploaded_file:
            filename = secure_filename(uploaded_file.filename)
            file_path = os.path.join(temp_dir, filename)
            uploaded_file.save(file_path)
            
            print(f"📁 [UPLOAD] Uploaded file: {filename}")
            print(f"📁 [UPLOAD] File path: {file_path}")
            print(f"📁 [UPLOAD] RAR support available: {RAR_SUPPORT}")

            if zipfile.is_zipfile(file_path):
                print(f"📁 [UPLOAD] Detected ZIP file, extracting...")
                extract_zip(file_path, temp_dir)
                os.remove(file_path)
            elif is_rar_file(file_path):
                print(f"📁 [UPLOAD] Detected RAR file, extracting...")
                extract_rar(file_path, temp_dir)
                os.remove(file_path)
            else:
                print(f"📁 [UPLOAD] Unknown file type, keeping as-is")
                shutil.move(file_path, os.path.join(temp_dir, filename))

        elif repo_url:
            print(f"📁 [UPLOAD] Cloning repository: {repo_url}")
            clone_repo(repo_url, temp_dir)

        print(f"📁 [UPLOAD] Building file tree...")
        tree = build_file_tree(temp_dir, UPLOAD_DIR)
        print(f"📁 [UPLOAD] File tree built successfully")
        return jsonify(tree)

    except Exception as e:
        print(f"📁 [UPLOAD] ❌ Error during upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')


@app.route("/read-file")
def read_file():
    path = request.args.get("path")
    
    # If path is relative, make it relative to UPLOAD_FOLDER
    if not os.path.isabs(path):
        abs_path = os.path.join(UPLOAD_FOLDER, path)
    else:
        abs_path = path
    
    abs_path = os.path.abspath(abs_path)

    # Prevent directory traversal
    if not abs_path.startswith(os.path.abspath(UPLOAD_FOLDER)):
        abort(403)

    if not os.path.exists(abs_path):
        abort(404)

    with open(abs_path, "r", encoding="utf-8") as f:
        content = f.read()

    return jsonify({"code": content})


@app.route('/suggest-context', methods=['POST'])
def suggest_context():
    """Suggest relevant context files for a target Java file using AI analysis"""
    try:
        data = request.get_json()
        target_file_path = data.get('filePath')
        
        if not target_file_path:
            return jsonify({'error': 'filePath is required'}), 400
        
        # Convert relative path to absolute path in uploads directory
        if not os.path.isabs(target_file_path):
            abs_target_path = os.path.join(UPLOAD_FOLDER, target_file_path)
        else:
            abs_target_path = target_file_path
        
        if not os.path.exists(abs_target_path):
            return jsonify({'error': 'Target file not found'}), 404
        
        # Initialize both rule-based and AI-powered suggesters
        suggester = SmartContextSuggester(UPLOAD_FOLDER)
        rule_based_suggestions = suggester.suggest_context_files(abs_target_path, max_suggestions=20)
        
        # Get available files for AI analysis
        available_files = [s['path'] for s in rule_based_suggestions]
        available_files = [os.path.join(UPLOAD_FOLDER, f) if not os.path.isabs(f) else f for f in available_files]
        
        # Create a simple args object for AI client
        class SimpleArgs:
            model = "gemini-pro"  # or get from request
            api_url = "http://localhost:11434"
        
        # Use AI analyzer for smarter suggestions
        from test_generator.ai_client_factory import AIClientFactory
        from test_generator.ai_context_analyzer import AIContextAnalyzer
        
        ai_client = AIClientFactory.create_client(SimpleArgs())
        ai_analyzer = AIContextAnalyzer(UPLOAD_FOLDER, ai_client)
        
        try:
            ai_analysis = ai_analyzer.analyze_dependencies_with_ai(abs_target_path, available_files)
            
            # Combine AI analysis with rule-based suggestions
            enhanced_suggestions = []
            seen_files = set()  # Track files to avoid duplicates
            recommended_context = ai_analysis.get('recommended_context', {})
            
            for file_name, info in recommended_context.items():
                # Convert to relative path for frontend
                file_path = file_name + '.java'
                if file_path not in seen_files:
                    seen_files.add(file_path)
                    enhanced_suggestions.append({
                        'path': file_path,
                        'name': file_name + '.java',
                        'score': info['score'],
                        'reason': f"AI: {info['reason']}",
                        'priority': info['priority'],
                        'should_mock': info.get('should_mock', False)
                    })
            
            # Add rule-based suggestions that weren't covered by AI
            ai_file_names = set(recommended_context.keys())
            for suggestion in rule_based_suggestions:
                file_name_without_ext = os.path.splitext(suggestion['name'])[0]
                suggestion_path = suggestion['path']
                if suggestion_path.startswith(UPLOAD_FOLDER):
                    suggestion_path = os.path.relpath(suggestion_path, UPLOAD_FOLDER)
                suggestion_path = suggestion_path.replace(os.sep, '/')
                
                # Only add if not already seen and not covered by AI
                if (file_name_without_ext not in ai_file_names and 
                    suggestion_path not in seen_files and 
                    suggestion['name'] not in seen_files):
                    seen_files.add(suggestion_path)
                    seen_files.add(suggestion['name'])
                    suggestion['path'] = suggestion_path
                    suggestion['reason'] = f"Rule-based: {suggestion['reason']}"
                    suggestion['priority'] = 'low'
                    suggestion['should_mock'] = False
                    enhanced_suggestions.append(suggestion)
            
            # Sort by score (AI suggestions should be higher)
            enhanced_suggestions.sort(key=lambda x: x['score'], reverse=True)
            
            return jsonify({
                'suggestions': enhanced_suggestions[:15],  # Top 15 suggestions
                'count': len(enhanced_suggestions),
                'ai_enhanced': True,
                'mock_strategy': ai_analysis.get('mock_strategy', {})
            })
            
        except Exception as ai_error:
            logger.warning(f"AI analysis failed, falling back to rule-based: {ai_error}")
            # Fallback to rule-based suggestions
            seen_files = set()  # Track files to avoid duplicates
            deduplicated_suggestions = []
            
            for suggestion in rule_based_suggestions:
                suggestion_path = suggestion['path']
                if suggestion_path.startswith(UPLOAD_FOLDER):
                    suggestion_path = os.path.relpath(suggestion_path, UPLOAD_FOLDER)
                suggestion_path = suggestion_path.replace(os.sep, '/')
                
                # Only add if not already seen
                if suggestion_path not in seen_files and suggestion['name'] not in seen_files:
                    seen_files.add(suggestion_path)
                    seen_files.add(suggestion['name'])
                    suggestion['path'] = suggestion_path
                    suggestion['reason'] = f"Rule-based: {suggestion['reason']}"
                    suggestion['priority'] = 'medium'
                    suggestion['should_mock'] = 'Service' in suggestion['name'] or 'Repository' in suggestion['name']
                    deduplicated_suggestions.append(suggestion)
            
            return jsonify({
                'suggestions': deduplicated_suggestions,
                'count': len(deduplicated_suggestions),
                'ai_enhanced': False
            })
        
    except Exception as e:
        logger.error(f"Error suggesting context files: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/fix-code', methods=['POST'])
def fix_code():
    try:
        data = request.get_json()
        
        class Args:
            file_name = data.get('fileName')
            model = data.get('llm')
            framework = data.get('framework')
            api_url = "http://localhost:11434"
        original_code = data.get('code')
        error_message = data.get('error')
        
        fixer = TestFixer(Args, original_code, error_message)
        
        # Generate fixed code using the same LLM service
        fixed_code = fixer.attempt_fix()
        
        return fixed_code, 200, {'Content-Type': 'text/plain'}
        
    except Exception as e:
        print(f"Error fixing code: {str(e)}")
        return jsonify({'error': f'Failed to fix code: {str(e)}'}), 500


# ----- Dashboard Analytics APIs ----- #

@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    time_range = request.args.get('timeRange', '7d')
    print(f"🌐 [API] Dashboard stats requested with timeRange: {time_range}")
    
    try:
        # Get basic stats from database
        stats = get_dashboard_stats(time_range)
        print(f"🌐 [API] Initial stats from database: {stats}")
        
        # Enhance with Jenkins data if available
        try:
            jenkins_config = get_jenkins_config()
            print(f"🌐 [API] Jenkins config check: {jenkins_config is not None}")
            
            if jenkins_config:
                print(f"🌐 [API] Attempting to enhance stats with Jenkins data...")
                # Get Jenkins test results for additional metrics
                jenkins_url = jenkins_config['url'].rstrip('/')
                job_name = jenkins_config['jobName']
                auth = (jenkins_config['username'], jenkins_config['token'])
                
                print(f"🌐 [API] Jenkins URL: {jenkins_url}, Job: {job_name}")
                
                # Get recent builds for test counts
                job_url = f"{jenkins_url}/job/{job_name}/api/json"
                job_response = requests.get(job_url, auth=auth, timeout=10)
                
                print(f"🌐 [API] Jenkins job API response: {job_response.status_code}")
                
                if job_response.status_code == 200:
                    job_data = job_response.json()
                    builds = job_data.get('builds', [])[:5]  # Last 5 builds
                    print(f"🌐 [API] Found {len(builds)} recent builds")
                    
                    jenkins_total_tests = 0
                    jenkins_failed_tests = 0
                    build_count = 0
                    
                    for i, build in enumerate(builds):
                        try:
                            test_url = f"{build['url']}testReport/api/json"
                            print(f"🌐 [API] Fetching test data for build {build.get('number')}: {test_url}")
                            
                            test_response = requests.get(test_url, auth=auth, timeout=10)
                            print(f"🌐 [API] Build {i+1} test response: {test_response.status_code}")
                            
                            if test_response.status_code == 200:
                                test_data = test_response.json()
                                total_count = test_data.get('totalCount', 0)
                                fail_count = test_data.get('failCount', 0)
                                
                                jenkins_total_tests += total_count
                                jenkins_failed_tests += fail_count
                                build_count += 1
                                
                                print(f"🌐 [API] Build {i+1} - Total: {total_count}, Failed: {fail_count}")
                        except Exception as build_error:
                            print(f"🌐 [API] Error processing build {i+1}: {build_error}")
                            continue
                    
                    # Update stats with Jenkins data if we got any
                    if build_count > 0:
                        original_total = stats['totalTests']
                        original_failed = stats['failedTests']
                        
                        # Add Jenkins test counts to database counts
                        stats['totalTests'] += jenkins_total_tests
                        stats['failedTests'] += jenkins_failed_tests
                        stats['successfulTests'] = stats['totalTests'] - stats['failedTests']
                        
                        print(f"🌐 [API] Enhanced stats - Original total: {original_total} -> New total: {stats['totalTests']}")
                        print(f"🌐 [API] Enhanced stats - Original failed: {original_failed} -> New failed: {stats['failedTests']}")
                else:
                    print(f"🌐 [API] ❌ Jenkins job API failed with status: {job_response.status_code}")
                    print(f"🌐 [API] Response text: {job_response.text[:200]}...")
                        
        except Exception as e:
            print(f"🌐 [API] ❌ Error enhancing stats with Jenkins data: {e}")
            import traceback
            print(f"🌐 [API] Full traceback:")
            traceback.print_exc()
            # Continue with database-only stats
        
        print(f"🌐 [API] ✅ Final dashboard stats being returned: {stats}")
        return jsonify(stats)
    except Exception as e:
        print(f"🌐 [API] ❌ Error getting dashboard stats: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route("/api/dashboard/trends", methods=["GET"])
def dashboard_trends():
    time_range = request.args.get('timeRange', '7d')
    print(f"🌐 [API] Dashboard trends requested with timeRange: {time_range}")
    
    try:
        # Get basic trends from database
        trends = get_test_trends(time_range)
        print(f"🌐 [API] Base trends from database: {len(trends)} entries")
        
        # Enhance with Jenkins build data if available
        try:
            jenkins_config = get_jenkins_config()
            if jenkins_config:
                print(f"🌐 [API] Enhancing trends with Jenkins build data...")
                jenkins_url = jenkins_config['url'].rstrip('/')
                job_name = jenkins_config['jobName']
                auth = (jenkins_config['username'], jenkins_config['token'])
                
                # Get recent builds
                job_url = f"{jenkins_url}/job/{job_name}/api/json"
                job_response = requests.get(job_url, auth=auth, timeout=10)
                
                if job_response.status_code == 200:
                    job_data = job_response.json()
                    builds = job_data.get('builds', [])[:10]  # Last 10 builds
                    print(f"🌐 [API] Processing {len(builds)} Jenkins builds for trends")
                    
                    # Group builds by date and add to trends
                    jenkins_trends = {}
                    
                    for i, build in enumerate(builds):
                        try:
                            build_url = f"{build['url']}api/json"
                            build_response = requests.get(build_url, auth=auth, timeout=10)
                            
                            if build_response.status_code == 200:
                                build_data = build_response.json()
                                timestamp = build_data.get('timestamp', 0) / 1000
                                build_date = datetime.fromtimestamp(timestamp).date().isoformat()
                                
                                print(f"🌐 [API] Processing build {build_data.get('number')} from {build_date}")
                                
                                # Get test results for this build
                                test_url = f"{build['url']}testReport/api/json"
                                test_response = requests.get(test_url, auth=auth, timeout=10)
                                
                                if test_response.status_code == 200:
                                    test_data = test_response.json()
                                    
                                    if build_date not in jenkins_trends:
                                        jenkins_trends[build_date] = {
                                            'total': 0,
                                            'successful': 0,
                                            'failed': 0
                                        }
                                    
                                    jenkins_trends[build_date]['total'] += test_data.get('totalCount', 0)
                                    jenkins_trends[build_date]['successful'] += test_data.get('passCount', 0)
                                    jenkins_trends[build_date]['failed'] += test_data.get('failCount', 0)
                        except Exception as build_error:
                            print(f"🌐 [API] Error processing build {i+1}: {build_error}")
                            continue
                    
                    print(f"🌐 [API] Jenkins trends data: {jenkins_trends}")
                    
                    # Merge Jenkins data with database trends
                    jenkins_dates_merged = 0
                    for trend in trends:
                        if trend['date'] in jenkins_trends:
                            jenkins_data = jenkins_trends[trend['date']]
                            original_total = trend['total']
                            
                            trend['total'] += jenkins_data['total']
                            trend['successful'] += jenkins_data['successful']  
                            trend['failed'] += jenkins_data['failed']
                            
                            jenkins_dates_merged += 1
                            print(f"🌐 [API] Enhanced {trend['date']}: {original_total} -> {trend['total']} total tests")
                    
                    print(f"🌐 [API] Enhanced {jenkins_dates_merged} dates with Jenkins data")
                else:
                    print(f"🌐 [API] Jenkins job API failed: {job_response.status_code}")
            else:
                print(f"🌐 [API] Jenkins not configured, using database trends only")
                            
        except Exception as e:
            print(f"🌐 [API] Error enhancing trends with Jenkins data: {e}")
            import traceback
            traceback.print_exc()
        
        print(f"🌐 [API] ✅ Returning {len(trends)} trend entries")
        return jsonify(trends)
    except Exception as e:
        print(f"🌐 [API] ❌ Error getting test trends: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route("/api/dashboard/coverage", methods=["GET"])
def dashboard_coverage():
    print(f"🌐 [API] Dashboard coverage data requested")
    
    try:
        # Get basic coverage from database
        coverage = get_coverage_data()
        print(f"🌐 [API] Base coverage from database: {len(coverage)} entries")
        
        # Enhance with Jenkins coverage data if available
        try:
            jenkins_config = get_jenkins_config()
            if jenkins_config:
                print(f"🌐 [API] Enhancing coverage with Jenkins JaCoCo data...")
                jenkins_url = jenkins_config['url'].rstrip('/')
                job_name = jenkins_config['jobName']
                auth = (jenkins_config['username'], jenkins_config['token'])
                
                # Get latest coverage from Jenkins
                jacoco_url = f"{jenkins_url}/job/{job_name}/lastSuccessfulBuild/jacoco/api/json"
                print(f"🌐 [API] Fetching JaCoCo data from: {jacoco_url}")
                
                response = requests.get(jacoco_url, auth=auth, timeout=10)
                print(f"🌐 [API] JaCoCo response status: {response.status_code}")
                
                if response.status_code == 200:
                    jacoco_data = response.json()
                    print(f"🌐 [API] JaCoCo data keys: {list(jacoco_data.keys())}")
                    
                    line_coverage = jacoco_data.get('lineCoverage', {})
                    method_coverage = jacoco_data.get('methodCoverage', {})
                    
                    # Add Jenkins coverage as an entry if we have it
                    jenkins_coverage_entry = {
                        'className': 'Jenkins Overall Coverage',
                        'coverage': round(line_coverage.get('percentage', 0), 1),
                        'methods': method_coverage.get('total', 0),
                        'testedMethods': method_coverage.get('covered', 0),
                        'lastUpdated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    }
                    
                    print(f"🌐 [API] Jenkins coverage entry: {jenkins_coverage_entry}")
                    
                    # Insert Jenkins data at the beginning
                    coverage.insert(0, jenkins_coverage_entry)
                    print(f"🌐 [API] ✅ Added Jenkins coverage to the beginning of the list")
                else:
                    print(f"🌐 [API] ❌ JaCoCo data not available - Status: {response.status_code}")
                    print(f"🌐 [API] Response text: {response.text[:200]}...")
            else:
                print(f"🌐 [API] Jenkins not configured, using database coverage only")
                    
        except Exception as e:
            print(f"🌐 [API] ❌ Error enhancing coverage with Jenkins data: {e}")
            import traceback
            traceback.print_exc()
        
        print(f"🌐 [API] ✅ Returning {len(coverage)} coverage entries")
        return jsonify(coverage)
    except Exception as e:
        print(f"🌐 [API] ❌ Error getting coverage data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ----- Chat Assistant APIs ----- #

@app.route("/api/chat/coverage-insights", methods=["GET"])
def coverage_insights():
    try:
        insights = chat_assistant.get_coverage_insights()
        return jsonify(insights)
    except Exception as e:
        print(f"Error getting coverage insights: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route("/api/chat/message", methods=["POST"])
def chat_message():
    try:
        data = request.get_json()
        message = data.get('message', '')
        context = data.get('context', [])
        
        response = chat_assistant.process_message(message, context)
        return jsonify(response)
    except Exception as e:
        print(f"Error processing chat message: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/chat/code", methods=["POST"])
def chat_with_code():
    """Enhanced chat endpoint for code-focused conversations"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        context = data.get('context', {})
        conversation_history = data.get('conversationHistory', [])
        
        # Extract context information
        current_file = context.get('currentFile', '')
        selected_code = context.get('selectedCode', '')
        project_files = context.get('projectFiles', [])
        database_context = context.get('databaseContext', False)
        
        # Get database context if requested
        db_context = None
        if database_context:
            try:
                # Get recent test runs and stats for context
                recent_tests = get_recent_tests(limit=10)
                stats = get_dashboard_stats('all')
                db_context = {
                    'recent_tests': recent_tests,
                    'stats': stats
                }
            except Exception as e:
                print(f"Error getting database context: {str(e)}")
        
        # Process the enhanced chat message
        response = chat_assistant.process_code_message(
            message=message,
            current_file=current_file,
            selected_code=selected_code,
            project_files=project_files,
            database_context=db_context,
            conversation_history=conversation_history
        )
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error processing code chat message: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ----- Settings Management APIs ----- #

@app.route("/api/settings", methods=["GET", "POST"])
def settings():
    settings_file = os.path.join(os.path.dirname(__file__), 'settings.json')
    
    if request.method == "GET":
        try:
            if os.path.exists(settings_file):
                with open(settings_file, 'r') as f:
                    settings_data = json.load(f)
                return jsonify(settings_data)
            else:
                # Return default settings
                default_settings = {
                    "jenkins": {"url": "", "username": "", "token": "", "jobName": ""},
                    "database": {"host": "localhost", "port": 5432, "database": "test_coverage", "username": "", "password": ""},
                    "ollama": {"url": "http://localhost:11434", "model": "starchat2:15b"}
                }
                return jsonify(default_settings)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == "POST":
        try:
            settings_data = request.get_json()
            
            # Save to file
            with open(settings_file, 'w') as f:
                json.dump(settings_data, f, indent=2)
            
            return jsonify({'status': 'saved'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500


@app.route("/api/test-jenkins", methods=["POST"])
def test_jenkins():
    try:
        data = request.get_json()
        jenkins_url = data.get('url')
        auth_header = data.get('auth')
        job_name = data.get('jobName')
        
        # Test Jenkins connection
        headers = {'Authorization': f'Basic {auth_header}'}
        
        # Try to get Jenkins version info
        response = requests.get(f"{jenkins_url}/api/json", headers=headers, timeout=10)
        
        if response.status_code == 200:
            jenkins_info = response.json()
            
            # If job name is provided, check if it exists
            if job_name:
                job_response = requests.get(f"{jenkins_url}/job/{job_name}/api/json", headers=headers, timeout=10)
                if job_response.status_code != 200:
                    return jsonify({'error': f'Job "{job_name}" not found'}), 400
            
            return jsonify({
                'status': 'success',
                'version': jenkins_info.get('version', 'Unknown'),
                'url': jenkins_url
            })
        else:
            return jsonify({'error': f'Connection failed: {response.status_code}'}), 400
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Connection error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/api/test-database", methods=["POST"])
def test_database():
    try:
        data = request.get_json()
        
        # For now, we'll just test our SQLite database
        # In a real application, you'd test the PostgreSQL connection with the provided credentials
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        db_path = os.path.join(base_dir, 'data', 'test_logs.db')
        
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM test_runs")
        count = cur.fetchone()[0]
        conn.close()
        
        return jsonify({
            'status': 'success',
            'type': 'SQLite',
            'records': count,
            'path': db_path
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/api/test-ollama", methods=["POST"])
def test_ollama():
    try:
        data = request.get_json()
        ollama_url = data.get('url')
        model_name = data.get('model')
        
        # Test Ollama connection
        response = requests.get(f"{ollama_url}/api/tags", timeout=10)
        
        if response.status_code == 200:
            models = response.json()
            available_models = [model['name'] for model in models.get('models', [])]
            
            # Check if the specified model is available
            model_available = model_name in available_models
            
            return jsonify({
                'status': 'success',
                'url': ollama_url,
                'available_models': available_models,
                'model_available': model_available,
                'specified_model': model_name
            })
        else:
            return jsonify({'error': f'Ollama not accessible: {response.status_code}'}), 400
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Connection error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/api/jenkins/trigger", methods=["POST"])
def trigger_jenkins_job():
    """Trigger a Jenkins job with test generation parameters"""
    try:
        # Load settings
        settings_file = os.path.join(os.path.dirname(__file__), 'settings.json')
        if not os.path.exists(settings_file):
            return jsonify({'error': 'Jenkins not configured. Please configure in settings.'}), 400
        
        with open(settings_file, 'r') as f:
            settings = json.load(f)
        
        jenkins_config = settings.get('jenkins', {})
        if not all([jenkins_config.get('url'), jenkins_config.get('username'), jenkins_config.get('token'), jenkins_config.get('jobName')]):
            return jsonify({'error': 'Incomplete Jenkins configuration'}), 400
        
        # Get request data
        data = request.get_json()
        
        # Prepare Jenkins job parameters
        job_params = {
            'SOURCE_REPO': data.get('repoUrl', ''),
            'TEST_FRAMEWORK': data.get('framework', 'junit'),
            'LLM_MODEL': data.get('model', 'starchat2:15b'),
            'FILES_TO_TEST': ','.join(data.get('files', []))
        }
        
        # Create auth header
        auth = (jenkins_config['username'], jenkins_config['token'])
        
        # Trigger job
        jenkins_url = jenkins_config['url'].rstrip('/')
        job_name = jenkins_config['jobName']
        
        trigger_url = f"{jenkins_url}/job/{job_name}/buildWithParameters"
        
        response = requests.post(trigger_url, data=job_params, auth=auth, timeout=30)
        
        if response.status_code in [200, 201]:
            return jsonify({'status': 'triggered', 'job': job_name})
        else:
            return jsonify({'error': f'Failed to trigger job: {response.status_code}'}), 400
    
    except Exception as e:
        return jsonify({'error': f'Failed to trigger Jenkins job: {str(e)}'}), 500

# Jenkins Integration Endpoints
@app.route('/api/jenkins/builds', methods=['GET'])
def get_jenkins_builds():
    """Get recent build information from Jenkins"""
    try:
        jenkins_config = get_jenkins_config()
        
        if not jenkins_config:
            return jsonify({'error': 'Jenkins not configured'}), 400
            
        # Jenkins API endpoint for job builds
        jenkins_url = jenkins_config['url'].rstrip('/')
        job_name = jenkins_config['jobName']
        url = f"{jenkins_url}/job/{job_name}/api/json"
        
        auth = (jenkins_config['username'], jenkins_config['token'])
        
        response = requests.get(url, auth=auth, timeout=30)
        response.raise_for_status()
        
        job_data = response.json()
        
        # Get recent builds (last 10)
        builds = []
        for build in job_data.get('builds', [])[:10]:
            build_url = f"{build['url']}api/json"
            build_response = requests.get(build_url, auth=auth, timeout=30)
            
            if build_response.status_code == 200:
                build_data = build_response.json()
                
                # Convert timestamp from milliseconds to seconds
                timestamp = build_data.get('timestamp', 0) / 1000
                
                builds.append({
                    'number': build_data.get('number'),
                    'result': build_data.get('result'),
                    'timestamp': datetime.fromtimestamp(timestamp).isoformat() if timestamp else None,
                    'duration': build_data.get('duration', 0),
                    'url': build_data.get('url'),
                    'building': build_data.get('building', False),
                    'displayName': build_data.get('displayName')
                })
        
        return jsonify({'builds': builds})
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Jenkins connection failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Failed to fetch builds: {str(e)}'}), 500

@app.route('/api/jenkins/test-connection', methods=['POST'])
def test_jenkins_connection():
    """Test Jenkins connection with provided settings"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'No settings provided'}), 400
        
        # Check for minimum required fields
        url = data.get('url', '').strip()
        username = data.get('username', '').strip()
        token = data.get('token', '').strip()
        job_name = data.get('jobName', '').strip()
        
        if not url:
            return jsonify({'success': False, 'message': 'Jenkins URL is required'}), 400
        
        if not username or not token:
            return jsonify({'success': False, 'message': 'Jenkins username and token are required'}), 400
        
        jenkins_url = url.rstrip('/')
        auth = (username, token)
        
        # Test basic Jenkins connection
        try:
            response = requests.get(f"{jenkins_url}/api/json", auth=auth, timeout=10)
            if response.status_code == 401:
                return jsonify({'success': False, 'message': 'Invalid Jenkins credentials'}), 200
            elif response.status_code != 200:
                return jsonify({'success': False, 'message': f'Jenkins server error: {response.status_code}'}), 200
        except requests.exceptions.ConnectionError:
            return jsonify({'success': False, 'message': 'Cannot connect to Jenkins server'}), 200
        except requests.exceptions.Timeout:
            return jsonify({'success': False, 'message': 'Connection to Jenkins server timed out'}), 200
        
        # Test job access (optional - only if job name is provided)
        if job_name:
            try:
                job_url = f"{jenkins_url}/job/{job_name}/api/json"
                job_response = requests.get(job_url, auth=auth, timeout=10)
                
                if job_response.status_code == 404:
                    return jsonify({
                        'success': True, 
                        'message': 'Jenkins connection successful, but specified job not found',
                        'warning': f'Job "{job_name}" not found on Jenkins server'
                    })
                elif job_response.status_code != 200:
                    return jsonify({
                        'success': True, 
                        'message': 'Jenkins connection successful, but cannot access specified job',
                        'warning': f'Cannot access job "{job_name}" (HTTP {job_response.status_code})'
                    })
                else:
                    return jsonify({'success': True, 'message': 'Jenkins connection and job access successful'})
            except Exception as job_error:
                return jsonify({
                    'success': True, 
                    'message': 'Jenkins connection successful, but job test failed',
                    'warning': f'Job test error: {str(job_error)}'
                })
        else:
            return jsonify({'success': True, 'message': 'Jenkins connection successful (no job specified)'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Connection test failed: {str(e)}'}), 500

@app.route('/api/jenkins/coverage', methods=['GET'])
def get_jenkins_coverage():
    """Get test coverage data from Jenkins"""
    try:
        jenkins_config = get_jenkins_config()
        
        if not jenkins_config:
            return jsonify({'error': 'Jenkins not configured'}), 400
            
        jenkins_url = jenkins_config['url'].rstrip('/')
        job_name = jenkins_config['jobName']
        auth = (jenkins_config['username'], jenkins_config['token'])
        
        coverage_data = []
        
        # Get coverage from last 5 successful builds
        for i in range(5):
            try:
                if i == 0:
                    build_id = 'lastSuccessfulBuild'
                else:
                    # Get build numbers from job info first
                    job_url = f"{jenkins_url}/job/{job_name}/api/json"
                    job_response = requests.get(job_url, auth=auth, timeout=30)
                    
                    if job_response.status_code == 200:
                        job_data = job_response.json()
                        builds = job_data.get('builds', [])
                        
                        if len(builds) > i:
                            build_id = builds[i]['number']
                        else:
                            continue
                    else:
                        continue
                
                # Try to get JaCoCo coverage report
                jacoco_url = f"{jenkins_url}/job/{job_name}/{build_id}/jacoco/api/json"
                
                response = requests.get(jacoco_url, auth=auth, timeout=30)
                
                if response.status_code == 200:
                    jacoco_data = response.json()
                    
                    coverage_data.append({
                        'build_number': build_id,
                        'line_coverage': jacoco_data.get('lineCoverage', {}).get('percentage', 0),
                        'branch_coverage': jacoco_data.get('branchCoverage', {}).get('percentage', 0),
                        'class_coverage': jacoco_data.get('classCoverage', {}).get('percentage', 0),
                        'method_coverage': jacoco_data.get('methodCoverage', {}).get('percentage', 0),
                        'timestamp': datetime.now().isoformat()
                    })
                    
            except Exception as e:
                print(f"Error getting coverage for build {i}: {e}")
                continue
        
        return jsonify({'coverage': coverage_data})
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch coverage: {str(e)}'}), 500

@app.route('/api/jenkins/test-results', methods=['GET'])
def get_jenkins_test_results():
    """Get test results from Jenkins"""
    try:
        jenkins_config = get_jenkins_config()
        
        if not jenkins_config:
            return jsonify({'error': 'Jenkins not configured'}), 400
            
        jenkins_url = jenkins_config['url'].rstrip('/')
        job_name = jenkins_config['jobName']
        auth = (jenkins_config['username'], jenkins_config['token'])
        
        test_results = []
        
        # Get test results from recent builds
        job_url = f"{jenkins_url}/job/{job_name}/api/json"
        job_response = requests.get(job_url, auth=auth, timeout=30)
        
        if job_response.status_code == 200:
            job_data = job_response.json()
            builds = job_data.get('builds', [])[:10]  # Last 10 builds
            
            for i, build in enumerate(builds):
                try:
                    test_url = f"{build['url']}testReport/api/json"
                    
                    response = requests.get(test_url, auth=auth, timeout=30)
                    
                    if response.status_code == 200:
                        test_data = response.json()
                        
                        # Get build details for timestamp
                        build_details_url = f"{build['url']}api/json"
                        build_details = requests.get(build_details_url, auth=auth, timeout=30)
                        
                        timestamp = None
                        if build_details.status_code == 200:
                            build_info = build_details.json()
                            timestamp_ms = build_info.get('timestamp', 0)
                            if timestamp_ms:
                                timestamp = datetime.fromtimestamp(timestamp_ms / 1000).isoformat()
                        
                        test_results.append({
                            'build_number': build.get('number', i + 1),
                            'total_tests': test_data.get('totalCount', 0),
                            'failed_tests': test_data.get('failCount', 0),
                            'skipped_tests': test_data.get('skipCount', 0),
                            'passed_tests': test_data.get('passCount', 0),
                            'duration': test_data.get('duration', 0),
                            'timestamp': timestamp or (datetime.now() - timedelta(days=i)).isoformat()
                        })
                        
                except Exception as e:
                    print(f"Error getting test results for build {i}: {e}")
                    continue
        
        return jsonify({'test_results': test_results})
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch test results: {str(e)}'}), 500

@app.route('/api/settings/jenkins', methods=['POST'])
def save_jenkins_settings():
    """Save Jenkins settings - allows partial configuration"""
    try:
        data = request.json
        print(f"🔧 [JENKINS] Received data: {data}")
        
        # Check if data is None
        if not data:
            print(f"🔧 [JENKINS] ❌ No JSON data received")
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Get field values with defaults for missing fields
        url = data.get('url', '').strip()
        username = data.get('username', '').strip()
        token = data.get('token', '').strip()
        job_name = data.get('jobName', '').strip()
        
        print(f"🔧 [JENKINS] Processing fields: url={bool(url)}, username={bool(username)}, token={bool(token)}, jobName={bool(job_name)}")
        
        # Only require URL if any Jenkins settings are provided
        if not url and (username or token or job_name):
            print(f"🔧 [JENKINS] ❌ URL is required when other Jenkins fields are provided")
            return jsonify({'error': 'Jenkins URL is required when other Jenkins settings are provided'}), 400
        
        # If all fields are empty, delete existing settings
        if not any([url, username, token, job_name]):
            print(f"🔧 [JENKINS] Clearing Jenkins settings (all fields empty)")
            
            data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
            db_path = os.path.join(data_dir, 'settings.db')
            
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM jenkins_settings')
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Jenkins settings cleared successfully'})
        
        data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
        db_path = os.path.join(data_dir, 'settings.db')
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Delete existing settings
        cursor.execute('DELETE FROM jenkins_settings')
        
        # Insert new settings (allow empty fields except URL)
        cursor.execute('''
        INSERT INTO jenkins_settings (url, username, token, job_name)
        VALUES (?, ?, ?, ?)
        ''', (url, username, token, job_name))
        
        conn.commit()
        conn.close()
        
        print(f"🔧 [JENKINS] ✅ Settings saved successfully")
        return jsonify({'message': 'Jenkins settings saved successfully'})
        
    except Exception as e:
        print(f"🔧 [JENKINS] ❌ Error saving settings: {str(e)}")
        return jsonify({'error': f'Failed to save settings: {str(e)}'}), 500

@app.route('/api/settings/jenkins', methods=['GET'])
def get_jenkins_settings():
    """Get Jenkins settings (without token for security)"""
    try:
        data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
        db_path = os.path.join(data_dir, 'settings.db')
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT url, username, job_name FROM jenkins_settings ORDER BY id DESC LIMIT 1')
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            return jsonify({
                'url': result[0],
                'username': result[1],
                'jobName': result[2]
            })
        else:
            return jsonify({'error': 'No Jenkins settings found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Failed to get settings: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5005)