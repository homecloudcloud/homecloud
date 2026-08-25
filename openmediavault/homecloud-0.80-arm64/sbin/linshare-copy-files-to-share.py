import requests
import urllib3

# --- UPDATED CONFIGURATION ---
BASE_URL_V5 = "http://172.20.0.7:8080/linshare/webservice/rest/user/v5"
JWT_TOKEN = "eyJhbGciOiJSUzUxMiJ9.eyJkb21haW4iOiI3MmI4MTQzOS0wM2RhLTRkYzQtYWY1NS0yOTJhOTU5MzU0N2YiLCJ1dWlkIjoiYWY0ZWQxNTUtMjdkZi00OWU0LTkyZTgtZGU4ZWY4NTEyZWIyIiwic3ViIjoiYWJiZXkuY3VycnlAbGluc2hhcmUub3JnIiwiaWF0IjoxNzczODUyMTg2LCJpc3MiOiJMaW5TaGFyZSJ9.hV_yYkDfC8jouxrXT-l7QNoTzmTQ0oXecBpMvlW_WPbrJLVOeCWC3_NuzKrGhxLqJylHCbEb65bqNOAQemRAUenNEdnOkeS-jMm_2LGfVmVOJMKPSRNGPcYD4J8Pk3CO1C9zOEl9O4IsjByeMC9mmJlAOjBuesp1GqFj8UICfaz1E4mR3yZ0sPggQm7_sbz6vpkmSjxKGUEO1cdH-ibljCeQoh8pkKGgD6iFHDDf5k7IfrFPBYNELdZJX3f4rLKZLjEhLvLpIQxg6qyLgeojKuDpRnKexnmaOwo_ey2Y5KsyYO5NBDLZ_o-aXR3ABfxgIjfH2h8sGy4BpZR4-nA2zQ"

# This is the UUID from your browser URL
WG_UUID = "7f2ad75c-0984-4a17-b92e-058015e7ae03"

urllib3.disable_warnings()

HEADERS = {
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
}

def get_existing_files():
    """Indexes the Shared Space using the v5 nodes endpoint."""
    url = f"{BASE_URL_V5}/shared_spaces/{WG_UUID}/nodes"
    print(f"[*] Indexing Shared Space: {WG_UUID}")
    res = requests.get(url, headers=HEADERS)
    if res.status_code == 200:
        nodes = res.json()
        names = {node['name'] for node in nodes if 'name' in node}
        print(f"[+] Found {len(names)} files already in destination.")
        return names
    print(f"[!] Could not index Shared Space. Error: {res.status_code}")
    return set()

def run_sync():
    existing_files = get_existing_files()

    # 1. Get all Groups
    groups_res = requests.get(f"{BASE_URL_V5}/upload_request_groups?status=ENABLED&status=CLOSED", headers=HEADERS)
    if groups_res.status_code != 200: return

    for group in groups_res.json():
        group_uuid = group['uuid']
        
        # 2. Get all Upload Requests in Group
        reqs_res = requests.get(f"{BASE_URL_V5}/upload_request_groups/{group_uuid}/upload_requests", headers=HEADERS)
        if reqs_res.status_code != 200: continue

        for ur in reqs_res.json():
            ur_uuid = ur['uuid']

            # 3. Get all Entries in Request
            entries_res = requests.get(f"{BASE_URL_V5}/upload_requests/{ur_uuid}/entries", headers=HEADERS)
            if entries_res.status_code != 200: continue

            for entry in entries_res.json():
                file_name = entry['name']
                file_uuid = entry['uuid']

                if file_name in existing_files:
                    print(f"       [-] Skipping: {file_name} (Duplicate)")
                    continue

                print(f"       [+] Syncing: {file_name}")

                # Step A: Copy to Personal Space
                copy_my_files = requests.post(
                    f"{BASE_URL_V5}/documents/copy", 
                    headers=HEADERS,
                    json={"kind": "UPLOAD_REQUEST", "uuid": file_uuid, "contextUuid": ur_uuid}
                )

                if copy_my_files.status_code in [200, 201]:
                    data = copy_my_files.json()
                    new_uuid = data[0]['uuid'] if isinstance(data, list) else data['uuid']
                    
                    # Step B: Copy to Shared Space
                    shared_res = requests.post(
                        f"{BASE_URL_V5}/shared_spaces/{WG_UUID}/nodes/copy",
                        headers=HEADERS,
                        json={"kind": "PERSONAL_SPACE", "uuid": new_uuid}
                    )
                    
                    if shared_res.status_code in [200, 201]:
                        print(f"       [DONE] Successfully moved to Internal-Share.")
                        existing_files.add(file_name)
                        # Step C: Cleanup
                        requests.delete(f"{BASE_URL_V5}/documents/{new_uuid}", headers=HEADERS)
                    else:
                        print(f"       [!] Shared Space Move Failed: {shared_res.status_code}")
                else:
                    print(f"       [!] Initial Copy Failed: {copy_my_files.status_code}")

if __name__ == "__main__":
    run_sync()
