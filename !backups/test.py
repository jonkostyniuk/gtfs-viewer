#!flask/bin/python
from flask import Flask, jsonify, request

app = Flask(__name__)

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

@app.route('/gtfs-viewer/api/v0.1/tasks', methods=['GET'])
def get_tasks():
    return jsonify({'tasks': tasks})

@app.route('/gtfs-viewer/api/v0.1/request', methods=['GET'])
def get_request():
	return request.args['x']
	#return len(request.arg)



if __name__ == '__main__':
    app.run(debug=True)