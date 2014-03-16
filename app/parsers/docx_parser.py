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
        doc = opendocx(f)
        raw_paragraphs = getdocumenttext(doc)
        paragraphs = []
        for p in raw_paragraphs:
            paragraphs.append(p.encode('utf-8'))

        parsed_contents = {'text': '\n'.join(paragraphs)}
        return parsed_contents

    def create_file(self, draft):
        # TODO: Implement
        raise NotImplementedError('Will figure out later.')
