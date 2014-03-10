from app.models.draft import Draft
from app.parsers.document_parser import DocumentParser

class MarkdownParser(DocumentParser):

    def __init__(self):
        super(MarkdownParser, self).__init__()
        self.export_ext = 'md'
        self.export_mime = 'text/x-markdown; charset=UTF-8'

    def parse_file(self, file_contents):
        raise NotImplementedError('Someone dun fucked up.')

    def create_file(self, draft):
        md_file = ''
        # If there's a title, print it as a heading.
        if draft.title:
            md_file = md_file + '## ' + draft.title + '\n\n'

        text = draft.text
        # Markdown doesn't count separate paragraphs unless there are blank
        # lines between text. We can double newlines to make it work.
        text = text.replace('\n', '\n\n')
        # Markdown treats leading tabs or spaces as starting a code block.
        # We should remove all tabs from the document.
        text = text.replace('\t', '')

        md_file = md_file + text
        return md_file
