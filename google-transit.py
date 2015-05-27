# ##########################################################################################################
# GOOGLE TRANSIT ROUTE EXTRACTOR
# Created by Jon Kostyniuk on 09MAY2015
# Last modified by Jon Kostyniuk on 09MAY2015
# Property of JK Enterprises
# v0.01a
# ##########################################################################################################
#
# Version History:
# ----------------
# 09MAY2015 v0.01a - JK
#   - Initial Version.
#
# Usage:
# ------
# Describe usage.
#
# Instructions:
# -------------
# None currently.
#

# ##########################################################################################################
# MODULES AND DEFINITIONS
# ##########################################################################################################

# STANDARD MODULES
# ----------------

#import csv
import pandas as pd
import StringIO
import zipfile

# CUSTOM MODULES
# --------------

# n/a

# GLOBAL CONSTANT VARIABLES
# -------------------------

# Initialize
global ABC		# Global Constant Description #1
global XYZ		# Global Constant Description #2

# Define
ABC = ""
XYZ = ""

# DEFINITIONS
# -----------

# SQLite Database Variables
dbConn = None	# Data Base Connection - Initialize to None

# General Transit Feed Specification (GTFS) Variables
#gtfsSource = "http://gtfs.winnipegtransit.com/google_transit.zip"	# GTFS Source File
gtfsSource = "google_transit.zip"	# GTFS Source File
var4 = ""		# Variable Description #4


# ##########################################################################################################
# DEFINED CLASSES AND FUNCTIONS
# ##########################################################################################################

# MODULE CLASSES
# --------------

# n/a

# MODULE FUNCTIONS
# ----------------

# n/a

# HELPER (MONKEY) FUNCTIONS
# -------------------------

# n/a


# ##########################################################################################################
# MAIN PROGRAM
# ##########################################################################################################

# Function to handle Main Program
def main():
	# Open ZIP Archive Location
	zf = zipfile.ZipFile(gtfsSource)

	# Loop through ZIP File Names
	for filename in zf.namelist():
		# Find Transit Route Shape File
		if filename == "shapes.txt":
			# Read Data Model into Pandas
			shapes = pd.read_csv(zf.open(filename))



			# Test Outputs
			#print shapes.head()
			#print shapes[["shape_pt_sequence","shape_pt_lat","shape_pt_lon"]]

			# Grab by ID and sort by PT Sequence
			curShape = shapes[shapes['shape_id'] == 36099].sort_index(by = 'shape_pt_sequence')[["shape_pt_lat","shape_pt_lon"]]


"""
try:
    data = zf.read(filename)
except KeyError:
    print "ERROR: Did not find %s in zip file" % filename
else:
    #print filename
"""


"""
TRY USING PANDAS HERE
http://bokeh.pydata.org/en/latest/
https://github.com/datalit/pythonworkshop

train[(train['Age'] == 34) & (train['Sex']== 'female')]
train[(train['Name'].str.contains('Lily'))]
train[(train['Name'].str.startswith('Futrelle'))]
sorting available... train.sort_index(by = 'Age')
train.sort_index(by = ['Age', 'Pclass'], ascending = [False, True]).head()
add fields to data frame... train['FareToAge'] = train['Fare'] / train['Age']
pivot tables... pd.pivot_table(train, values = 'Age', index = ['Sex'], columns = ['Pclass'], aggfunc = 'mean')
save... train.to_csv('./data/train-new.csv')
"""


"""
JSON--

{
  "shape_id": 36099,
  "shape_pt_number": 91,
  "shape_pt_sequence": [
    {
      "id": 1,
      "lat": 43.809785,
      "lon": -79.454099,
      "dist": 0.0
    },
    {
      "id": 2,
      "lat": 43.8098,
      "lon": -79.453994,
      "dist": 0.0082
    },
    {
      "id": 3,
      "lat": 43.809784,
      "lon": -79.45389,
      "dist": 0.0175
    }
  ]
}
"""



# Call Main Program
if __name__ == "__main__":
	main()


# ##########################################################################################################
# END OF SCRIPT
# ##########################################################################################################