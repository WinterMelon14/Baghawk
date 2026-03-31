# Baghawk
* A YOLO-powered X-ray Contraband detector that can accurately detect various types of restricted items in X-ray scans of various luggages like suitcases and backpacks

### Categories
* Baton
* Pliers
* Hammer
* Powerbank
* Scissors
* Wrench
* Gun
* Bullet
* Sprayer
* Handcuffs
* Knife
* Lighter

[Test it out live!](baghawk.vercel.app)

## Run it yourself:
`cd frontend && npm run dev`
`cd backend`
`pip install -r requirements.txt`
`uvicorn main:app --reload`

Verify that in frontend/lib/api.js the FAST_URL is set to the right address (for running locally it should be port 8000)

## Todo

I plan to experiment with more models like RT-DETR and changing around layers to see what gives the best results
