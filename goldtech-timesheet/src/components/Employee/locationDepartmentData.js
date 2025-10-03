// src/components/Employee/locationDepartmentData.js
// Mock data for Location-Department hierarchy
// You can easily update this with your own data later

export const LOCATION_DEPARTMENT_DATA = {
  "Marina Bay Project": [
    "Project Management",
    "Development",
    "Quality Assurance",
    "Engineering",
    "Design"
  ],
  "CBD Tower Complex": [
    "Design",
    "Engineering",
    "Project Management",
    "Safety & Compliance"
  ],
  "Orchard Road Development": [
    "Development",
    "Design",
    "Engineering",
    "Project Management"
  ],
  "Sentosa Resort": [
    "Quality Assurance",
    "Engineering",
    "Project Management",
    "Hospitality Services"
  ],
  "Head Office": [
    "Administration",
    "Human Resources",
    "Finance",
    "IT Support",
    "Legal"
  ],
  "Woodlands Industrial Park": [
    "Manufacturing",
    "Engineering",
    "Quality Control",
    "Logistics"
  ],
  "Changi Business Hub": [
    "Business Development",
    "Sales & Marketing",
    "Customer Service",
    "Project Management"
  ]
};

// Get all unique locations
export const getAllLocations = () => {
  return Object.keys(LOCATION_DEPARTMENT_DATA);
};

// Get departments for a specific location
export const getDepartmentsByLocation = (location) => {
  if (!location || location === "Others") {
    // If no location or "Others", return all unique departments
    const allDepartments = new Set();
    Object.values(LOCATION_DEPARTMENT_DATA).forEach(depts => {
      depts.forEach(dept => allDepartments.add(dept));
    });
    return Array.from(allDepartments).sort();
  }
  return LOCATION_DEPARTMENT_DATA[location] || [];
};

// Get all unique departments across all locations
export const getAllDepartments = () => {
  const allDepartments = new Set();
  Object.values(LOCATION_DEPARTMENT_DATA).forEach(depts => {
    depts.forEach(dept => allDepartments.add(dept));
  });
  return Array.from(allDepartments).sort();
};