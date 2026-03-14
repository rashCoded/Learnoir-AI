"""
Manual migration script for subscription and payments tables
Run this once to apply payment schema changes
"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'pathpilot.db')
print(f"Database path: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if columns exist
cursor.execute("PRAGMA table_info(users)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Existing user columns: {columns}")

# Add subscription_plan if not exists
if 'subscription_plan' not in columns:
    print("Adding subscription_plan column...")
    cursor.execute('ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(20) DEFAULT "free"')
else:
    print("subscription_plan column already exists")

# Add subscription_started_at if not exists
if 'subscription_started_at' not in columns:
    print("Adding subscription_started_at column...")
    cursor.execute('ALTER TABLE users ADD COLUMN subscription_started_at DATETIME')
else:
    print("subscription_started_at column already exists")

# Create payments table if not exists
print("Creating payments table if not exists...")
cursor.execute('''
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    razorpay_order_id VARCHAR(100) NOT NULL,
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'created',
    created_at DATETIME,
    paid_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
''')

# Create index on order_id
try:
    cursor.execute('CREATE INDEX IF NOT EXISTS ix_payments_razorpay_order_id ON payments (razorpay_order_id)')
except Exception as e:
    print(f"Index may already exist: {e}")

conn.commit()
conn.close()

print("✅ Migration complete!")
