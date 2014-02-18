from app.models.essay import Essay
from app.parsers.document_parser import DocumentParser

class PlainTextParser(DocumentParser):

    def __init__(self):
        self.file_extensions.append('txt')

    def parse_file(self, file_contents):
        essay = Essay()
        # TODO: Figure out the title
        essay.title = 'Untitled'
        essay.text = file_contents
        return essay

    def create_file(self, essay):
        return essay.text
