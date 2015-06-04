# ##########################################################################################################
# GTFS FLASK API APPLICATION
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

#!flask/bin/python

# STANDARD MODULES
# ----------------
import flask as fl

# CUSTOM MODULES
# --------------

import gtfsviewer as gv

# GLOBAL CONSTANT VARIABLES
# -------------------------

# Initialize
# n/a

# Define
# n/a

# DEFINITIONS
# -----------

# Flask Variables
app = fl.Flask(__name__)            # Define Application Name
appPath = '/gtfs-viewer/api/v0.1/'  # Define Application Path

# Test Data
tasks = [
    {
        'id': 1,
        'title': u'Buy groceries',
        'description': u'Milk, Cheese, Pizza, Fruit, Tylenol', 
        'done': False
    },
    {
        'id': 2,
        'title': u'Learn Python',
        'description': u'Need to find a good Python tutorial on the web', 
        'done': False
    }
]


# ##########################################################################################################
# DEFINED CLASSES AND FUNCTIONS
# ##########################################################################################################

# MODULE CLASSES
# --------------

# n/a

# MODULE FUNCTIONS
# ----------------

# Function to Get Routes List
@app.route(appPath + 'routes', methods=['GET'])
def get_routes():
    return gv.getRoutes()

# Function to Get GTFS Exchange API Agencies [NOT CURRENTLY CONNECTED]
@app.route(appPath + 'gtfs', methods=['GET'])
def get_gtfs():
    return gv.getGTFS()


########### EXAMPLES TO BE DELETED
@app.route(appPath + 'tasks', methods=['GET'])
def get_tasks():
    return fl.jsonify({'tasks': tasks})
@app.route(appPath + 'request', methods=['GET'])
def get_request():
    return fl.request.args['x']

# HELPER (MONKEY) FUNCTIONS
# -------------------------

# n/a


# ##########################################################################################################
# MAIN PROGRAM
# ##########################################################################################################

# Run Application with Debugging On
if __name__ == '__main__':
    app.run(debug=True)