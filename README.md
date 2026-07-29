## Project Overview

This app was built for the Fitness and Training Progress Platform (Variant 03)

Users enter their workout details through a form, and the server calculates:
- **Total Training Volume** (sets × repetitions × weight)
- **Volume per Minute** (total volume ÷ session duration)
- **Load Category** (Low / Moderate / High, based on total volume thresholds)

All calculation and validation logic is handled server-side in `controllers/workoutController.js`, separate from the view templates.

## Technologies Used

- Node.js
- Express.js
- Pug (view engine)
- Vanilla CSS

localhost:3000
