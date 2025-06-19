# Image Marker Project

A React application with Material-UI that provides two main functionalities:

1. **Image Point Marker** - Upload images and mark specific points with labels
2. **Parts Management Table** - Manage parts data with image visualization and markup points

## Features

### Image Point Marker
- Upload images and mark specific points
- Add labels and categorize marked points
- Interactive tooltips showing point information
- Organized summary of all marked points

### Parts Management Table
- Data table showing parts with various attributes
- Search and filter functionality
- Interactive image viewer with markup points
- Dropdown actions for each part (Edit/Delete)
- Real-time part selection and visualization

## Installation & Setup

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

## Dependencies

- React 18.2.0
- Material-UI 5.15.0
- @emotion/react & @emotion/styled
- Material-UI Icons

## Project Structure

```
src/
├── App.js                    # Main app with tab navigation
├── ImageMarkerApp.jsx        # Image point marking functionality
├── PartsManagementTable.jsx  # Parts management table
└── index.js                  # App entry point

public/
├── index.html               # HTML template
└── manifest.json           # PWA manifest
```

## Usage

### Image Marker Tab
1. Click "Choose Image File" to upload an image
2. Click anywhere on the image to add a point marker
3. Fill in the point details (Number, Name, Part)
4. View all marked points in the summary section

### Parts Management Tab
1. Browse the parts table with search functionality
2. Check any row's checkbox to view the part image
3. See markup points overlaid on the selected part image
4. Use the kebab menu (⋮) for edit/delete actions

## Development

- Built with Create React App
- Uses Material-UI's styled components API
- Responsive design for mobile and desktop
- Modern React hooks and functional components

## Git Commands

To push changes to your repository:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```
