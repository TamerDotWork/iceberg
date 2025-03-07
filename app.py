from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import pandas as pd
from scipy.stats import skew, kurtosis
import json
from datetime import datetime

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
LOG_FILE = 'upload_log.json'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def log_file_upload(filename):
    log_entry = {
        'filename': filename,
        'timestamp': datetime.now().isoformat()
    }
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            logs = json.load(f)
    else:
        logs = []
    logs.append(log_entry)
    with open(LOG_FILE, 'w') as f:
        json.dump(logs, f, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    last_uploaded_file = files[-1] if files else None
    return render_template('dashboard.html', files=files, last_uploaded_file=last_uploaded_file)

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and file.filename.endswith('.csv'):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        try:
            file.save(file_path)
            log_file_upload(file.filename)
            return redirect(url_for('dashboard'))  # Redirect to dashboard after upload
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return jsonify({'error': 'Invalid file format'}), 400

@app.route('/file-insights', methods=['POST'])
def file_insights():
    filename = request.json.get('filename')
    if not filename:
        return jsonify({'error': 'No filename provided'}), 400
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    
    df = pd.read_csv(file_path)
    
    insights = {
        'missing_values_per_column': df.isnull().sum().to_dict(),
        'duplicate_rows_count': int(df.duplicated().sum()),
        'columns_with_high_missing_values': df.columns[df.isnull().mean() > 0.5].tolist(),
        'columns_with_high_cardinality': [col for col in df.columns if df[col].nunique() > 50],
        'possible_categorical_columns': [col for col in df.columns if df[col].nunique() < 10],
        'outliers': {col: int(df[(df[col] < (df[col].quantile(0.25) - 1.5 * (df[col].quantile(0.75) - df[col].quantile(0.25)))) | 
                              (df[col] > (df[col].quantile(0.75) + 1.5 * (df[col].quantile(0.75) - df[col].quantile(0.25))))].shape[0]) 
                     for col in df.select_dtypes(include=['number']).columns},
        'skewness': df.select_dtypes(include=['number']).apply(lambda x: float(skew(x.dropna()))).to_dict(),
        'kurtosis': df.select_dtypes(include=['number']).apply(lambda x: float(kurtosis(x.dropna()))).to_dict()
    }
    
    return jsonify({
        'columns': df.columns.tolist(),
        'rows': df.head(5).values.tolist(),  # Preview only the first 5 rows
        'insights': insights
    })

if __name__ == '__main__':
    app.run(debug=True)
