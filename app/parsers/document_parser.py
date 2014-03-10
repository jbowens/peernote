class DocumentParser(object):

    file_extensions = []
    export_ext = None
    export_mime = None

    def __init__(self):
        self.file_extensions = []

    def get_file_extensions(self):
        return self.file_extensions

    def accepts_extension(self, extension):
        return extension in self.file_extensions

    def parse_file(self, file_contents):
        raise NotImplementedError('Someone dun fucked up.')

    def create_file(self, draft):
        raise NotImplementedError('Someone dun fucked up.')
