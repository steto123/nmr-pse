from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import os
import json

app = Flask(__name__, static_folder='static')
CORS(app)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, float) and (obj != obj or obj == float('inf') or obj == float('-inf')):
            return None
        return super().default(obj)

app.json_encoder = CustomJSONEncoder
# For newer Flask versions (3.x+), use app.json_provider_class
if hasattr(app, 'json_provider_class'):
    from flask.json.provider import DefaultJSONProvider
    class CustomJSONProvider(DefaultJSONProvider):
        def dumps(self, obj, **kwargs):
            kwargs['allow_nan'] = False # This forces an error or null depending on implementation
            # Actually, the simplest way is to clean the dictionary
            return super().dumps(obj, **kwargs)
    # app.json = CustomJSONProvider(app) # Switching to a simpler dictionary cleaning instead

EXCEL_FILE = 'daten/PTE-deutsch.xlsx'

def clean_value(v, np):
    if isinstance(v, (np.float64, np.float32, float)):
        if v != v or v == float('inf') or v == float('-inf'):
            return None
        return float(v)
    if isinstance(v, (np.int64, np.int32, int)):
        return int(v)
    if isinstance(v, (np.bool_, bool)):
        return bool(v)
    if pd.isna(v):
        return None
    return v

def load_data():
    if not os.path.exists(EXCEL_FILE):
        return []
    try:
        import numpy as np
        # Load main element data
        df_elements = pd.read_excel(EXCEL_FILE, sheet_name='Elemente')
        elements_data = df_elements.to_dict(orient='records')
        
        # Load NMR data if exists
        nmr_dict = {}
        try:
            df_nmr = pd.read_excel(EXCEL_FILE, sheet_name='NMR')
            for row in df_nmr.to_dict(orient='records'):
                oz = row.get('Ordnungszahl')
                if oz:
                    oz = int(oz)
                    if oz not in nmr_dict:
                        nmr_dict[oz] = []
                    
                    # Clean the NMR row
                    clean_nmr = {k: clean_value(v, np) for k, v in row.items() if k not in ['Ordnungszahl', 'Symbol']}
                    nmr_dict[oz].append(clean_nmr)
        except Exception as e:
            print(f"NMR sheet error (expected if missing): {e}")

        # Final merge
        final_data = []
        for row in elements_data:
            clean_row = {k: clean_value(v, np) for k, v in row.items()}
            oz = clean_row.get('Atomnummer')
            
            # Attach NMR data if available
            if oz in nmr_dict:
                clean_row['NMR_Daten'] = nmr_dict[oz]
            
            final_data.append(clean_row)
        return final_data
    except Exception as e:
        print(f"Error loading Excel: {e}")
        return []

@app.route('/api/elements')
def get_elements():
    data = load_data()
    return jsonify(data)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    # Use environment variable for port or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
