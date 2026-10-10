"""Declared cache classes, with no inferred coldness or missing-counter credit."""


def validate(cache_class, evidence):
    if cache_class == "A":
        pages = evidence.get("resident_pages")
        metadata = evidence.get("metadata_state")
        return "ELIGIBLE" if pages == 0 and metadata == "VERIFIED_COLD" else "INELIGIBLE"
    if cache_class == "B":
        return "ELIGIBLE" if (evidence.get("fresh_mount") is True
                              and evidence.get("warmup_terminal_unmount") is True
                              and evidence.get("warmup_cleanup") == "Gone"
                              and type(evidence.get("object_demands")) is int
                              and evidence["object_demands"] == 0) else "INELIGIBLE"
    if cache_class == "C":
        interval = evidence.get("warm_interval_ns")
        return "ELIGIBLE" if (evidence.get("same_mount") is True and type(interval) is int
                              and 0 <= interval < 60_000_000_000) else "INELIGIBLE"
    raise ValueError("cache class must be A, B or C")
