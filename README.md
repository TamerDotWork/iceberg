# Data Insights Dashboard

A Flask web app that lets you upload CSV files, view them in a dashboard, and get quick insights about the data (missing values, duplicates, outliers, skewness, kurtosis, etc.).

---

## Features
- Upload CSV files through a web interface
- See a list of uploaded files in the dashboard
- Preview the first 5 rows of your data
- Get automatic insights:
  - Missing values per column
  - Duplicate row count
  - Columns with high missing values
  - High cardinality columns
  - Possible categorical columns
  - Outlier counts
  - Skewness and kurtosis for numeric columns
- Keeps a log of uploaded files with timestamps

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/TamerDotWork/iceberg.git
cd iceberg
```
