from flask import current_app
from app.models.essay import Essay
from app.parsers.document_parser import DocumentParser
from cStringIO import StringIO
from docx import opendocx,  getdocumenttext

class DocxParser(DocumentParser):

    def __init__(self):
        super(DocxParser, self).__init__()
        self.file_extensions.append('docx')

    def parse_file(self, f):
        essay = Essay()

        doc = opendocx(f)
        raw_paragraphs = getdocumenttext(doc)
        paragraphs = []
        for p in raw_paragraphs:
            paragraphs.append(p.encode('utf-8'))
        essay.text = '\n'.join(paragraphs)

        # TODO: Handle title

        return essay

    def create_file(self, essay):
        # TODO: Implement
        raise NotImplementedError('Will figure out later.')
