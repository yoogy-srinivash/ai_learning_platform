"""add role and profile fields

Revision ID: 5f7e3a8c9f4e
Revises: 1ff8d23268ec
Create Date: 2026-02-09 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5f7e3a8c9f4e'
down_revision: Union[str, Sequence[str], None] = '1ff8d23268ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add role column with default 'user'
    op.add_column('users', sa.Column('role', sa.Enum('user', 'admin', name='userrole'), nullable=False, server_default='user'))
    
    # Add goal column (optional learning goal)
    op.add_column('users', sa.Column('goal', sa.String(length=500), nullable=True))
    
    # Add preferred_roadmap_date column (optional date)
    op.add_column('users', sa.Column('preferred_roadmap_date', sa.Date(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'preferred_roadmap_date')
    op.drop_column('users', 'goal')
    op.drop_column('users', 'role')
    # Drop the enum type if exists
    op.execute('DROP TYPE IF EXISTS userrole')
