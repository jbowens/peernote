"""empty message

Revision ID: 440539ad7715
Revises: 29e8ca56ebca
Create Date: 2014-03-17 13:12:24.232930

"""

# revision identifiers, used by Alembic.
revision = '440539ad7715'
down_revision = '29e8ca56ebca'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('draft', sa.Column('modifiers', sa.UnicodeText(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('draft', 'modifiers')
    ### end Alembic commands ###
