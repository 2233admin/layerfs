"""Declared cache classes, with no inferred coldness or missing-counter credit."""


def validate(cache_class, evidence):
    if cache_class in ("B", "C"):
        own_written = evidence.get("has_own_write_input")
        if type(own_written) is not bool:
            return "INELIGIBLE"
        if own_written:
            cold = evidence.get("own_write_cold_observation")
            started = evidence.get("commit_started_monotonic_ns")
            if not (isinstance(cold, dict) and cold.get("status") == "VERIFIED_COLD"
                    and cold.get("phase") == "before_commit"
                    and type(cold.get("resident_pages")) is int and cold["resident_pages"] == 0
                    and cold.get("metadata_state") == "VERIFIED_COLD"
                    and cold.get("identity_checked") is True
                    and type(cold.get("observed_monotonic_ns")) is int
                    and type(started) is int and cold["observed_monotonic_ns"] < started):
                return "INELIGIBLE"
    if cache_class == "A":
        pages = evidence.get("resident_pages")
        metadata = evidence.get("metadata_state")
        return "ELIGIBLE" if type(pages) is int and pages == 0 and metadata == "VERIFIED_COLD" else "INELIGIBLE"
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
