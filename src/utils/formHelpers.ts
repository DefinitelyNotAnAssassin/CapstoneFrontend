/**
 * This utility file helps with form styling and fixes any inconsistencies
 * in form elements across the application.
 */

// Apply consistent styling to form labels and inputs
export const applyFormStyles = () => {
  // Add CSS variables to :root for consistent form styling
  const style = document.createElement('style');
  style.innerHTML = `
    ion-label[position="stacked"] {
      margin-bottom: 10px !important;
      font-weight: 500 !important;
      padding-left: 4px !important;
    }
    
    ion-item.form-item {
      --padding-start: 0 !important;
      --inner-padding-end: 0 !important;
      margin-bottom: 12px !important;
    }
    
    ion-input, ion-textarea, ion-select, ion-datetime {
      --padding-start: 8px !important;
      border: 1px solid #ddd !important;
      border-radius: 4px !important;
      margin-top: 4px !important;
      --background: #ffffff !important;
    }
    
    ion-card {
      border-radius: 8px !important;
    }
  `;
  document.head.appendChild(style);
};

// Helper function to format form fields consistently
export const getFormItemStyle = () => {
  return {
    '--padding-start': '0',
    '--inner-padding-end': '0',
    marginBottom: '12px',
  };
};

// Helper function to format form labels consistently
export const getLabelStyle = () => {
  return {
    marginBottom: '10px',
    fontWeight: '500',
    paddingLeft: '4px',
  };
};
