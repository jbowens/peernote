import os, sys, PIL.Image

size = 200, 200
for filename in os.listdir('.'):
    if filename.endswith('.png'):
        try: 
            im = PIL.Image.open(filename)
            im.thumbnail(size, PIL.Image.ANTIALIAS)
            im.save(filename, 'png')
        except IOError:
            print "Could not create thumbnail for '%s'", filename
