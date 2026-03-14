"""add subscription and payments

Revision ID: 8a2f3c5d7e9b
Revises: 4ff7b0c45788
Create Date: 2025-12-24 23:25:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8a2f3c5d7e9b'
down_revision = '4ff7b0c45788'
branch_labels = None
depends_on = None


def upgrade():
    # Add subscription fields to users table
    op.add_column('users', sa.Column('subscription_plan', sa.String(20), server_default='free', nullable=True))
    op.add_column('users', sa.Column('subscription_started_at', sa.DateTime(), nullable=True))
    
    # Create payments table
    op.create_table('payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('razorpay_order_id', sa.String(100), nullable=False),
        sa.Column('razorpay_payment_id', sa.String(100), nullable=True),
        sa.Column('razorpay_signature', sa.String(255), nullable=True),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(10), server_default='INR', nullable=True),
        sa.Column('status', sa.String(20), server_default='created', nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('paid_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payments_id'), 'payments', ['id'], unique=False)
    op.create_index(op.f('ix_payments_razorpay_order_id'), 'payments', ['razorpay_order_id'], unique=False)


def downgrade():
    # Drop payments table
    op.drop_index(op.f('ix_payments_razorpay_order_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_id'), table_name='payments')
    op.drop_table('payments')
    
    # Remove subscription fields from users
    op.drop_column('users', 'subscription_started_at')
    op.drop_column('users', 'subscription_plan')
