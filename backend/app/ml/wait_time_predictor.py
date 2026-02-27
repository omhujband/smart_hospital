import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from datetime import datetime, timedelta

class WaitTimePredictor:
    def __init__(self):
        self.model = None
        self.dept_encoder = LabelEncoder()
        self.is_trained = False
        
    def generate_training_data(self, n_samples=5000):
        """Generate realistic hospital appointment data"""
        np.random.seed(42)
        
        departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General', 'Emergency']
        
        data = {
            'hour_of_day': np.random.randint(9, 18, n_samples),
            'day_of_week': np.random.randint(0, 7, n_samples),
            'queue_length': np.random.poisson(5, n_samples),
            'doctor_avg_time': np.random.normal(20, 5, n_samples).clip(10, 40),
            'is_emergency': np.random.choice([0, 1], n_samples, p=[0.85, 0.15]),
            'department': np.random.choice(departments, n_samples),
            'patients_before': np.random.poisson(3, n_samples),
            'doctor_utilization': np.random.uniform(0.5, 0.95, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Generate realistic wait times based on features
        wait_time = (
            df['queue_length'] * 8 +
            df['doctor_avg_time'] * 0.5 +
            df['patients_before'] * 12 +
            (df['hour_of_day'] - 9) * 2 +
            df['doctor_utilization'] * 30 +
            np.random.normal(0, 5, n_samples) -
            df['is_emergency'] * 20
        ).clip(0, 120)
        
        df['wait_time'] = wait_time
        
        return df
    
    def train(self, df=None):
        """Train the wait time prediction model"""
        if df is None:
            df = self.generate_training_data()
        
        # Encode department
        df['department_encoded'] = self.dept_encoder.fit_transform(df['department'])
        
        # Features
        X = df[['hour_of_day', 'day_of_week', 'queue_length', 'doctor_avg_time', 
                'is_emergency', 'department_encoded', 'patients_before', 'doctor_utilization']]
        y = df['wait_time']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        self.is_trained = True
        
        print(f"Model trained successfully!")
        print(f"Train R² Score: {train_score:.4f}")
        print(f"Test R² Score: {test_score:.4f}")
        
        return train_score, test_score
    
    def predict(self, features):
        """Predict wait time for given features"""
        if not self.is_trained:
            raise Exception("Model not trained yet!")
        
        # Encode department
        dept_encoded = self.dept_encoder.transform([features['department']])[0]
        
        X = np.array([[
            features['hour_of_day'],
            features['day_of_week'],
            features['queue_length'],
            features['doctor_avg_time'],
            features['is_emergency'],
            dept_encoded,
            features['patients_before'],
            features['doctor_utilization']
        ]])
        
        prediction = self.model.predict(X)[0]
        return max(0, prediction)
    
    def save_model(self, path='app/ml/models'):
        """Save trained model and encoders"""
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.model, f'{path}/wait_time_model.pkl')
        joblib.dump(self.dept_encoder, f'{path}/dept_encoder.pkl')
        print(f"Model saved to {path}")
    
    def load_model(self, path='app/ml/models'):
        """Load trained model and encoders"""
        self.model = joblib.load(f'{path}/wait_time_model.pkl')
        self.dept_encoder = joblib.load(f'{path}/dept_encoder.pkl')
        self.is_trained = True
        print("Model loaded successfully")

if __name__ == "__main__":
    predictor = WaitTimePredictor()
    predictor.train()
    predictor.save_model()
