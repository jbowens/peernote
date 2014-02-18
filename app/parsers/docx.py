from app.models.essay import Essay
from app.parsers.document_parser import DocumentParser
from docx import *
from cStringIO import StringIO

class DocxParser(DocumentParser):

    def parse_file(self, file_contents):
        essay = Essay()

        f = StringIO(file_contents)
        doc = opendocx(f)
        paragraphs = getdocumenttext(doc)
        essay.text = '\n'.join(paragraphs)

        # TODO: Handle title

        return essay

    def create_file(self, essay):
        # TODO: Implement
        raise NotImplementedError('Will figure out later.')
