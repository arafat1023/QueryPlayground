# Test Data Files

This directory contains sample data files for testing the Import/Export functionality.

## Files

### CSV Files

#### `employees.csv`
- **Best for**: PostgreSQL
- **12 rows** of employee data
- **Columns**: id (INTEGER), name (TEXT), department (TEXT), salary (INTEGER), active (BOOLEAN), hire_date (DATE)
- Tests: Integer, Boolean, Date, and Text type inference

#### `books.csv`
- **Best for**: PostgreSQL or MongoDB
- **10 rows** of book catalog data
- **Columns**: isbn, title, author, genre, price (NUMERIC), published_year (INTEGER), rating (NUMERIC)
- Tests: ISBN handling, decimal numbers, various text formats

### JSON Files

#### `products.json`
- **Best for**: MongoDB
- **6 documents** of product data
- **Features**: Nested objects (`specs`), arrays (`tags`), mixed types, `_id` fields
- Tests: Document structure, nested data, arrays

#### `orders.json`
- **Best for**: PostgreSQL or MongoDB
- **8 documents** of order data
- **Flat structure** with all primitive types
- **Columns**: order_id, customer_name, email, total_amount (NUMERIC), status, items_count (INTEGER)
- Tests: Simple JSON to table conversion

## Testing Guide

### Test CSV Import to PostgreSQL
1. Open app, switch to PostgreSQL
2. Click "Import Data" → Upload `employees.csv` or `books.csv`
3. Verify detected types (INTEGER, TEXT, NUMERIC, BOOLEAN, DATE)
4. Import and query the table

### Test JSON Import to MongoDB
1. Open app, switch to MongoDB
2. Click "Import Data" → Upload `products.json`
3. Preview shows nested objects and arrays
4. Import and query the collection

### Test JSON Import to PostgreSQL
1. Open app, switch to PostgreSQL
2. Click "Import Data" → Upload `orders.json`
3. Verify detected schema (all TEXT columns or inferred types)
4. Import and query the table

### Test CSV Import to MongoDB
1. Open app, switch to MongoDB
2. Click "Import Data" → Upload `books.csv`
3. Preview shows flattened documents
4. Import and query the collection

### Test Workspace Export
1. Import some data using the files above
2. Click "Export" → "Export Entire Workspace"
3. Verify downloaded JSON contains all tables/collections
