# Image Point Marker App

A React application for marking points on images with Material-UI design.

## Features

- 📷 **Image Upload**: Upload any image file
- 🎯 **Point Marking**: Click anywhere on the image to mark points
- 📝 **Form Input**: Add Number, Name, and Part (dropdown) for each point
- 🔴 **Visual Markers**: Red circles with numbers displayed on the image
- 📋 **Points Summary**: Card-based display of all marked points
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Required Dependencies

- `@mui/material` - Material-UI core components
- `@emotion/react` - Required for Material-UI
- `@emotion/styled` - Required for Material-UI
- `@mui/icons-material` - Material-UI icons
- `react` - React library
- `react-dom` - React DOM library

## How to Use

1. **Upload Image**: Click "Choose Image File" and select an image
2. **Mark Points**: Click anywhere on the uploaded image
3. **Fill Form**: Enter Number, Name, and select Part from dropdown
4. **Save Point**: Click "Save Point" to add the marker
5. **View Summary**: See all marked points in cards below the image

## Part Options

The dropdown includes common parts:
- Engine
- Transmission
- Brake System
- Suspension
- Electrical System
- Cooling System
- Fuel System
- Exhaust System
- Steering System
- Body Panel
- Interior Component
- Safety Equipment
- Other

## File Structure

```
src/
├── components/
│   └── ImageMarkerApp.jsx  ← Main component
├── App.js                  ← Include the component here
└── index.js               ← React entry point
```

## Usage in App.js

```javascript
import React from 'react';
import ImageMarkerApp from './components/ImageMarkerApp';

function App() {
  return (
    <div className="App">
      <ImageMarkerApp />
    </div>
  );
}

export default App;
```

## Technologies Used

- React 18
- Material-UI 5
- JavaScript ES6+
- HTML5 Canvas (for coordinate detection)

## Author

Created with Material-UI design system for a professional, modern look.