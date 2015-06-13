from setuptools import setup

setup(name='GTFS Viewer',
	version='0.1a',
	description='A GTFS viewer to display transit route data in a web browser.',
	author='Jon Kostyniuk',
	author_email='jon.kostyniuk@gmail.com',
	url='http://gtfsviewer-jonkostyniuk.rhcloud.com/',
	install_requires=['Flask>=0.10.1','numpy>=1.9.2','pandas>=0.16.1'],
	)
