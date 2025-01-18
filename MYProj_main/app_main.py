from flask import Flask, render_template

app = Flask(__name__)

# Route for the main page (index.html)
@app.route('/')
def index():
    return render_template('index.html')

# Route for the Home page (home.html)
@app.route('/home')
def home():
    return render_template('home.html')

if __name__ == '__main__':
    app.run(debug=True)
