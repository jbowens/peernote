from app.models.essay import Essay
from app.parsers.document_parser import DocumentParser

class PlainTextParser(DocumentParser):

    def __init__(self):
        super(PlainTextParser, self).__init__()
        self.file_extensions.append('txt')
        self.export_ext = 'txt'
        self.export_mime = 'text/plain'

    def parse_file(self, file_contents):
        return {'text': file_contents.getvalue()}

    def create_file(self, draft):
        return draft.text
