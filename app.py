from flask import Flask, session, request, jsonify, send_from_directory, render_template, make_response, g
from flask_cors import CORS
from math import gcd
import random
import os

# Only ONE Flask app configuration
base_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__,
    static_folder=os.path.join(base_dir, 'static'),
    template_folder=os.path.join(base_dir, 'templates'),
    static_url_path='/static')
app.secret_key = 'pizza_fraction_party_secret'
CORS(app)

QUESTIONS = [
    {
        "id": 1,
        "n1": 1, "d1": 2, "topping1": "🫑",  # capsicum
        "n2": 1, "d2": 4, "topping2": "🥓"   # bacon
    },
    {
        "id": 2,
        "n1": 2, "d1": 3, "topping1": "🍄",  # mushroom
        "n2": 1, "d2": 6, "topping2": "🧀"   # cheese
    }
]
@app.route('/')
def landing():
    return render_template('intro.html')

@app.route('/game')
def game():
    session['question_index'] = 0  # Reset question index when starting a new game
    session.modified = True
    return render_template('index.html')

@app.route('/celebration')
def celebration():
    return render_template('celebration.html')

# Fallback route should be last
@app.route('/<path:text>', methods=['GET', 'POST'])
def all_routes(text):
    if text.startswith('static/'):
        return send_from_directory(app.static_folder, text[7:])
    # Only fallback if not a known route
    if text not in ['game']:
        return render_template('intro.html')
    # Optionally, you could return a 404 for truly unknown paths
    return '', 404

@app.route('/question', methods=['GET'])
def get_question():
    global QUESTIONS
    session.pop('conversion_done', None)  # Reset conversion state for new question

    idx = session.get('question_index', 0)

    if idx >= len(QUESTIONS):
        # All questions done, return a JSON flag
        return jsonify({"done": True})

    q = QUESTIONS[idx]
    session['question_index'] = idx + 1
    session.modified = True
    return jsonify(q)

@app.route('/lcm', methods=['POST'])
def calc_lcm():
    data = request.json
    d1 = int(data['d1'])
    d2 = int(data['d2'])
    result = (d1 * d2) // gcd(d1, d2)
    return jsonify({'lcm': result})

@app.route('/validate', methods=['POST'])
def validate_toppings():
    
    data = request.json
    question_id = data.get('question_id')
    pizza_slices = data['pizza_slices']

    # Check if conversion was completed
    # Replace the 'conversion_done' check with:
    if not session.get('conversion_done'):
        return jsonify({
            "error": "Please complete the fraction conversion first",
            "correct": False
        }), 400

    # Find the question by id
    question = next((q for q in QUESTIONS if q["id"] == question_id), None)
    if not question:
        return jsonify({"error": "Invalid question_id"}), 400

    n1, d1, topping1 = question['n1'], question['d1'], question['topping1']
    n2, d2, topping2 = question['n2'], question['d2'], question['topping2']

    # Only allow topping validation after conversion is done
    if 'conversion_done' not in session:
        return jsonify({
            "error": "Please complete the fraction conversion first",
            "correct": False
        }), 400

    lcm_val = (d1 * d2) // gcd(d1, d2)
    expected1 = (lcm_val // d1) * n1
    expected2 = (lcm_val // d2) * n2

    count1 = sum(1 for toppings in pizza_slices if topping1 in toppings)
    count2 = sum(1 for toppings in pizza_slices if topping2 in toppings)

    correct = (count1 == expected1) and (count2 == expected2)
    return jsonify({
        'expected': {topping1: expected1, topping2: expected2},
        'actual': {topping1: count1, topping2: count2},
        'correct': correct
    })

# Add a new endpoint to validate conversion
@app.route('/validate_conversion', methods=['POST'])
def validate_conversion():
    data = request.json
    if not data or 'num1' not in data or 'num2' not in data:
        return jsonify({"error": "Missing conversion data"}), 400
    
    session['conversion_done'] = True  # Store in session
    session.modified = True  # Ensure session changes are saved
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)

