import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

class MLService:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self._train_mock_model()

    def _train_mock_model(self):
        """
        Trains a simple classifier on dummy data to demonstrate the ML capability.
        Features: [CGPA (0-10), Math_Interest (0/1), Design_Interest (0/1), Systems_Interest (0/1)]
        Labels: ['Frontend', 'Backend', 'Data Science', 'DevOps']
        """
        # Dummy Dataset
        X = np.array([
            [9.0, 1, 0, 0], # High CGPA, Math -> Data Science
            [7.5, 0, 1, 0], # Design -> Frontend
            [8.0, 1, 0, 1], # Math + Systems -> Backend
            [7.0, 0, 0, 1], # Systems -> DevOps
            [8.5, 1, 1, 0], # Math + Design -> Data/Frontend -> Data
            [6.5, 0, 1, 0], # Design -> Frontend
            [9.5, 1, 0, 1], # High CGPA + Systems -> Backend/ML -> Data Science
            [7.2, 0, 0, 1], # Systems -> DevOps
        ])
        y = np.array(['Data Science', 'Frontend', 'Backend', 'DevOps', 'Data Science', 'Frontend', 'Backend', 'DevOps'])

        self.model = RandomForestClassifier(n_estimators=10, random_state=42)
        self.model.fit(X, y)
        self.is_trained = True
        print("ML Model (RandomForest) trained on dummy data.")

    def predict_domain(self, cgpa: float, interests: dict) -> str:
        """
        Predicts the suitable domain based on student profile.
        interests: {'math': bool, 'design': bool, 'systems': bool}
        """
        if not self.is_trained:
            return "General Software Engineering"

        # Convert input to feature vector
        features = np.array([[
            cgpa,
            1 if interests.get('math') else 0,
            1 if interests.get('design') else 0,
            1 if interests.get('systems') else 0
        ]])

        prediction = self.model.predict(features)[0]
        return prediction
