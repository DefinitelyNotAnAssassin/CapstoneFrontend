import React from 'react';
import { IonItem, IonLabel, IonText } from '@ionic/react';

// Styled form item component with proper spacing between label and input
export const FormItem: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => {
  const formItemStyles = {
    labelSpacing: {
      marginBottom: '12px',
    },
    item: {
      '--padding-start': '0',
      '--inner-padding-end': '0',
      marginBottom: '8px',
    },
  };

  return (
    <IonItem style={formItemStyles.item}>
      <IonLabel position="stacked" style={formItemStyles.labelSpacing}>
        {label} {required && <IonText color="danger">*</IonText>}
      </IonLabel>
      {children}
    </IonItem>
  );
};
