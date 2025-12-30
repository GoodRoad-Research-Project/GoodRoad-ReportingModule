from pydantic import BaseModel

class ViolationEvent(BaseModel):
    eventId: str
    plateNo: str
    violationType: str
    eventTime: str
