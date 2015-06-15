# ##########################################################################################################
# GTFS DATA EXTRACTOR
# Created by Jon Kostyniuk on 28MAY2015
# Last modified by Jon Kostyniuk on 28MAY2015
# Property of JK Enterprises
# v0.01a
# ##########################################################################################################
#
# Version History:
# ----------------
# 28MAY2015 v0.01a - JK
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

#!/usr/bin/python

# STANDARD MODULES
# ----------------

#import csv
import json
import os
import pandas as pd
import StringIO
import requests
import uuid
import zipfile

# CUSTOM MODULES
# --------------

# n/a

# GLOBAL CONSTANT VARIABLES
# -------------------------

# Initialize
global DATA_FOLDER		   # GTFS Server Side Data Folder

# Define
DATA_FOLDER = "./data/"

# DEFINITIONS
# -----------

# SQLite Database Variables
#dbConn = None

testdata = {
  "success": "true",
  "uuid": "4f7698c38c734c249ecf9aa5a3c6e0ca",
  "data": [
    {
      "timestamp": 1434328453,
      "agency_name": "York Region Transit"
    }
  ]
}

# General Transit Feed Specification (GTFS) Variables
#gtfsSource = "http://gtfs.winnipegtransit.com/google_transit.zip"	# GTFS Source File
gtfsSource = "google_transit.zip"	# GTFS Source File

# External API Links
GTFS_API = "http://www.gtfs-data-exchange.com/api/agencies" # GTFS Exchange API Data


# ##########################################################################################################
# DEFINED CLASSES AND FUNCTIONS
# ##########################################################################################################

# MODULE CLASSES
# --------------

# n/a

# MODULE FUNCTIONS
# ----------------

# Function to Create Unique User ID
def createUUID():
  return str(uuid.uuid4().hex)

# Function to Get Preloaded Agencies
def getAgencies(uuid):
  # Define UUID Folder Path Variables
  uuidpath = DATA_FOLDER + str(uuid)
  jsondata = {}
  jsondata["uuid"] = str(uuid)
  jsondata["data"] = []  
  # Check if server-side UUID directory exists
  if os.path.isdir(uuidpath):
    # Get preset folders for UUID
    listPreset = os.listdir(uuidpath)
    # Populate preset data list
    for listitem in listPreset:
      itemdata = {}
      itemdata["timestamp"] = int(listitem)
      itemdata["agency_name"] = readAgency(uuidpath + "/" + listitem + "/")
      jsondata["data"].append(itemdata)
  # Create directory for UUID
  else:
    os.makedirs(uuidpath)
  # Indicate JSON Data Success
  jsondata["success"] = "true"
  
  return json.dumps(jsondata)

# Function to Get GTFS Exchange API Data
def getGTFS():
  return requests.get(GTFS_API).text

# Function to Get Routes List
def getRoutes():


  return 'Routes'

# HELPER (MONKEY) FUNCTIONS
# -------------------------

# Function to Read Agency File
def readAgency(filepath):
  pdAgency = pd.read_csv(filepath + "agency.txt")
  return pdAgency["agency_name"][0]

# Function to Extract GTFS ZIP to Temporary Folder
def unzipGTFS(fileloc):
  # Open ZIP Archive Location
  zf = zipfile.ZipFile(gtfsSource)

  # Loop through ZIP File Names
  #for filename in zf.namelist():






# ##########################################################################################################
# MAIN PROGRAM
# ##########################################################################################################

# Function to handle Main Program (Not Used)
#def main():
#  return

# Call Main Program (Not Used)
#if __name__ == "__main__":
#  main()






"""
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





# ##########################################################################################################
# END OF SCRIPT
# ##########################################################################################################