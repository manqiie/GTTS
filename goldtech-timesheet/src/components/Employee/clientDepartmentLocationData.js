// src/components/Employee/clientDepartmentLocationData.js
// Hierarchical data for Client -> Department -> Location
// You can easily update this with your own data later

export const CLIENT_DEPARTMENT_LOCATION_DATA = {
  "Fujitsu": {
    "3PP": [
      "SAP",
      "FeDC",
      "DBS",
      "COINS",
      "GEL"
  
    ],
    "PS": [
      "SAFRA",
      "ITE CC",
      "ITE CE",
      "ITE CW",
      "DBS",
      "ASTAR",
      "RWS",
      "CAG",
      "NYP",
      "TP",
      "RP",
      "NP",
      "McDonalds",
      "KUOK",
      "PSA"
    ]
  },

  "RWS": {
    "-": [
      "CIT",
      "GC"
    ],
    "Application Development": [
      "GC"
    ]
  },

  "Singlife": {
    "-": [
      "Singlife"
    ]
  },

  "GT":{
    "-":[
      "GT"
    ]
  },

  "Unisys":{
    "-":[
      "Unisys"
    ]
  },

  "NTT":{
    "3PP":[
      "SAP",
      "NTT"
    ]
  },

  "NEC":{
    "MSBU":[
      "NEC HQ",
      "PA",
      "MOM",
      "KTPH",
      "CGH",
      "CAG",
      "MSF",
      "ATFM",
      "Nparks",
      "WHC"
    ],
    "FSBU":[
      "NEC HQ"
    ]
  },

  "Hitachi":{
    "-":[
      "LDG"
     ]
  }
};

// Get all unique clients
export const getAllClients = () => {
  return Object.keys(CLIENT_DEPARTMENT_LOCATION_DATA);
};

// Get departments for a specific client
export const getDepartmentsByClient = (client) => {
  if (!client || client === "Others") {
    // If no client or "Others", return all unique departments
    const allDepartments = new Set();
    Object.values(CLIENT_DEPARTMENT_LOCATION_DATA).forEach(clientData => {
      Object.keys(clientData).forEach(dept => allDepartments.add(dept));
    });
    return Array.from(allDepartments).sort();
  }
  const clientData = CLIENT_DEPARTMENT_LOCATION_DATA[client];
  return clientData ? Object.keys(clientData).sort() : [];
};

// Get locations for a specific client and department
export const getLocationsByClientAndDepartment = (client, department) => {
  if (!client || client === "Others" || !department || department === "Others") {
    // If no client/department or "Others", return all unique locations
    const allLocations = new Set();
    Object.values(CLIENT_DEPARTMENT_LOCATION_DATA).forEach(clientData => {
      Object.values(clientData).forEach(locations => {
        locations.forEach(loc => allLocations.add(loc));
      });
    });
    return Array.from(allLocations).sort();
  }
  
  const clientData = CLIENT_DEPARTMENT_LOCATION_DATA[client];
  if (!clientData) return [];
  
  const locations = clientData[department];
  return locations ? [...locations].sort() : [];
};

// Get all unique departments across all clients
export const getAllDepartments = () => {
  const allDepartments = new Set();
  Object.values(CLIENT_DEPARTMENT_LOCATION_DATA).forEach(clientData => {
    Object.keys(clientData).forEach(dept => allDepartments.add(dept));
  });
  return Array.from(allDepartments).sort();
};

// Get all unique locations across all clients
export const getAllLocations = () => {
  const allLocations = new Set();
  Object.values(CLIENT_DEPARTMENT_LOCATION_DATA).forEach(clientData => {
    Object.values(clientData).forEach(locations => {
      locations.forEach(loc => allLocations.add(loc));
    });
  });
  return Array.from(allLocations).sort();
};