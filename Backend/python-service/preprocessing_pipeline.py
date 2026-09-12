import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List


class PreprocessingPipeline:

    def __init__(self):
        pass

    def transform_single(self, data: Dict) -> np.ndarray:

        air_temp = float(data.get('air_temperature', 300.0))
        process_temp = float(data.get('process_temperature', 310.0))
        rpm = float(data.get('rotational_speed', 1500))
        torque = float(data.get('torque', 40.0))
        tool_wear = float(data.get('tool_wear', 100))

        temp_difference = process_temp - air_temp
        power = torque * rpm / 9.5488
        torque_speed_ratio = torque / (rpm + 1)

        temp_rate_of_change = float(data.get('temp_rate_of_change', 0.0))
        rpm_variance = float(data.get('rpm_variance', 20.0))

        dt_str = data.get('date_time', datetime.now().isoformat())
        dt = pd.to_datetime(dt_str)

        month = dt.month
        hour = dt.hour
        dayofweek = dt.dayofweek

        machine_age_hours = float(data.get('machine_age_hours', 10000))
        hours_since_last = float(data.get('hours_since_last', 8))

        machine_type = data.get('machine_type', 'M')

        type_h = 1 if machine_type == 'H' else 0
        type_l = 1 if machine_type == 'L' else 0
        type_m = 1 if machine_type == 'M' else 0

        features = [
            air_temp, process_temp, rpm, torque, tool_wear,
            temp_difference, power, torque_speed_ratio,
            temp_rate_of_change, rpm_variance,
            month, hour, dayofweek,
            machine_age_hours, hours_since_last,
            type_h, type_l, type_m
        ]

        return np.array(features).reshape(1, -1)

    def validate_input(self, data: Dict):
        required = [
            'air_temperature',
            'process_temperature',
            'rotational_speed',
            'torque',
            'tool_wear',
            'machine_type'
        ]

        missing = [f for f in required if f not in data]

        if missing:
            return False, f"Missing fields: {missing}"

        return True, ""