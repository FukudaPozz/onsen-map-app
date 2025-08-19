from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/spring_water")
def get_spring_water():
    bbox = request.args.get("bbox")
    if not bbox:
        return jsonify({"error": "bbox parameter required"}), 400

    south, west, north, east = bbox.split(",")

    query = f"""
    [out:json];
    node["natural"="spring"]({south},{west},{north},{east});
    out;
    """
    res = requests.post("https://overpass-api.de/api/interpreter", data=query)
    data = res.json().get("elements", [])

    result = [
        {
            "name": el.get("tags", {}).get("name", "名称不明な湧水"),
            "lat": el["lat"],
            "lon": el["lon"],
            "description": el.get("tags", {}).get("description", ""),
            "drinkable": el.get("tags", {}).get("drinking_water", "unknown")
        } for el in data
    ]

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)