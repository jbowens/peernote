from app.models.essay import Essay
from app.parsers.document_parser import DocumentParser

class PlainTextParser(DocumentParser):

    def __init__(self):
        super(PlainTextParser, self).__init__()
        self.file_extensions.append('txt')

    def parse_file(self, file_contents):
        print file_contents
        return {'text': file_contents.getvalue()}

    def create_file(self, essay):
        return essay.text
