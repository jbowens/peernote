"""empty message

Revision ID: 45ba0db89a30
Revises: 39e409021994
Create Date: 2014-04-27 14:29:06.102905

"""

# revision identifiers, used by Alembic.
revision = '45ba0db89a30'
down_revision = '39e409021994'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('teacher',
    sa.Column('tid', sa.Integer(), nullable=False),
    sa.Column('uid', sa.Integer(), nullable=False),
    sa.Column('school', sa.String(length=80), nullable=True),
    sa.ForeignKeyConstraint(['uid'], ['user.uid'], ondelete='cascade'),
    sa.PrimaryKeyConstraint('tid')
    )
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('teacher')
    ### end Alembic commands ###
