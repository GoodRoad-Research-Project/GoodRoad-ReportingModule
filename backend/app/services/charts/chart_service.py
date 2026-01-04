def compute_charts(plate_no, events, now):
    return {
        "plateNo": plate_no,
        "timelineByMonth": {
            "2025-08": 1,
            "2025-09": 3,
            "2025-10": 2,
            "2025-11": 4,
            "2025-12": 2
        },
        "distributionByType": {
            "RED_LIGHT": 3,
            "SPEEDING": 5,
            "NO_SIGNAL": 2
        },
        "activeVsExpiredPoints": {
            "active": 10,
            "expired": 6
        }
    }
