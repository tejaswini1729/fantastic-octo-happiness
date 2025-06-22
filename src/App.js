import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Image as ImageIcon, 
  TableChart as TableChartIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import ImageMarkerApp from './ImageMarkerApp';
import PartsManagementTable from './PartsManagementTable';
import PositionMarkingInterface from './components/PositionMarkingInterface';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Navigation */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Image Marker Project
          </Typography>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{
              style: { backgroundColor: 'white' }
            }}
            sx={{ ml: 2 }}
          >
            <Tab 
              icon={<ImageIcon />} 
              label="Image Marker" 
              sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }}
            />
            <Tab 
              icon={<TableChartIcon />} 
              label="Parts Management" 
              sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }}
            />
            <Tab 
              icon={<LocationOnIcon />} 
              label="Position Marking" 
              sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }}
            />
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <ImageMarkerApp />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <PartsManagementTable />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <PositionMarkingInterface />
      </TabPanel>
    </Box>
  );
}

export default App;