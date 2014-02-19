class DocumentParser(object):

    file_extensions = []

    def __init__(self):
        self.file_extensions = []

    def get_file_extensions(self):
        return self.file_extensions

    def accepts_extension(self, extension):
        return extension in self.file_extensions

    def get_file_extensions(self):
        raise NotImplementedError('Someone dun fucked up.')

    def parse_file(self, file_contents):
        raise NotImplementedError('Someone dun fucked up.')

    def create_file(self, essay):
        raise NotImplementedError('Someone dun fucked up.')
