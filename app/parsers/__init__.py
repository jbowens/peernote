from plain_text import PlainTextParser
from app.parsers.docx_parser import DocxParser
from app.parsers.markdown import MarkdownParser

parsers = [PlainTextParser(), DocxParser(), MarkdownParser()]
