import os
import joblib
from preprocessing_pipeline import PreprocessingPipeline


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Predictor:

    def __init__(self):

        self.pipeline = PreprocessingPipeline()

        self.scaler = joblib.load(
            os.path.join(BASE_DIR, "model/scaler.pkl")
        )

        self.rul_model = joblib.load(
            os.path.join(BASE_DIR, "model/rul_model.pkl")
        )

        self.failure_model = joblib.load(
            os.path.join(BASE_DIR, "model/failure_model.pkl")
        )

        self.label_encoder = joblib.load(
            os.path.join(BASE_DIR, "model/label_encoder.pkl")
        )

    def predict(self, sensor_data):

        is_valid, error_msg = self.pipeline.validate_input(sensor_data)

        if not is_valid:
            return {
                "status": "error",
                "error": error_msg,
                "sensor_id": sensor_data.get("id")
            }

        features = self.pipeline.transform_single(sensor_data)
        features = self.scaler.transform(features)


        rul_hours = float(self.rul_model.predict(features)[0])
        rul_days = rul_hours / 24


        failure_type = None
        failure_confidence = None
        failure_probabilities = None

        if rul_days < 60:

            idx = self.failure_model.predict(features)[0]
            proba = self.failure_model.predict_proba(features)[0]

            failure_type = self.label_encoder.inverse_transform([idx])[0]
            failure_confidence = float(proba[idx])

            failure_probabilities = {
                cls: float(prob)
                for cls, prob in zip(self.label_encoder.classes_, proba)
            }

        if rul_days < 7:
            status = "CRITICAL"
            priority = "URGENT"
            action = "Maintenance IMMEDIATE (1-2 days)"

        elif rul_days < 30:
            status = "CRITICAL"
            priority = "HIGH"
            action = "Maintenance 1-2 weeks"

        elif rul_days < 60:
            status = "WARNING"
            priority = "MEDIUM"
            action = "Maintenance 4-8 weeks"

        else:
            status = "NORMAL"
            priority = "LOW"
            action = "Monitoring only"

        return {
            "status": "success",
            "sensor_id": sensor_data.get("id"),
            "machine_id": sensor_data.get("machine_id"),

            "prediction": {
                "rul_hours": round(rul_hours, 1),
                "rul_days": round(rul_days, 1),
                "status": status,
                "priority": priority,
                "action": action
            },

            "failure": {
                "type": failure_type,
                "confidence": round(failure_confidence, 3) if failure_confidence else None,
                "probabilities": {
                    k: round(v, 3)
                    for k, v in (failure_probabilities or {}).items()
                } if failure_probabilities else None
            }
        }