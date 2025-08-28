from werkzeug.utils import secure_filename
import zipfile



# --- UTILITY FUNCTIONS --- #

def extract_zip(file_path, extract_to):
    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)


def clone_repo(url, extract_to):
    # Simple .zip download approach for GitHub public repos
    if "github.com" in url:
        if not url.endswith(".zip"):
            if url.endswith("/"):
                url = url[:-1]
            url += "/archive/refs/heads/main.zip"  # default branch
    r = requests.get(url)
    if r.status_code == 200:
        zip_path = os.path.join(extract_to, "repo.zip")
        with open(zip_path, "wb") as f:
            f.write(r.content)
        extract_zip(zip_path, extract_to)
        os.remove(zip_path)
    else:
        raise Exception("Failed to download repo")


def build_file_tree(base_path):
    tree = {}
    for item in os.listdir(base_path):
        full_path = os.path.join(base_path, item)
        if os.path.isdir(full_path):
            tree[item] = build_file_tree(full_path)
        else:
            rel_path = os.path.relpath(full_path, base_path)
            tree[item] = os.path.join(base_path, rel_path)
    return tree